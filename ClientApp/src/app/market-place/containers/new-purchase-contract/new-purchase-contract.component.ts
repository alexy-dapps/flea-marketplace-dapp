import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { utils } from 'ethers';

import { Store, select } from '@ngrx/store';
import * as fromPurchaseContract from '../../store/reducers';
import { IpfsImageActions, PurchaseContractActions } from '../../store/actions';
import { FileUploadStatus } from '../../store/reducers/ipfs-product-image.reducer';

import { ShowIpfsImageComponent } from '../../components/show-ipfs-image/show-ipfs-image.component';

/* based on
      https://docs.ethers.io/ethers.js/html/api-utils.html#bytes32-strings

      check if string is less then 32 bytes. Needed to pass into the smart contract
  */
function bites32StringValidator(control: AbstractControl): { [key: string]: any } | null {

  let pathTest = false;

  try {
    utils.formatBytes32String(control.value);
    pathTest = true;

  } catch (error) {
    // console.log('bites32StringValidator', error)
  }
  /*
  If our validation fails, we return an object with a key for the error name and a value of true.
  Otherwise, if the validation passes, we simply return null.
  */

  return !pathTest ? {
    forbiddenKey: {
      value: control.value
    }
  } : null;
}

@Component({
  selector: 'app-new-purchase-contract',
  templateUrl: './new-purchase-contract.component.html',
  styleUrls: ['./new-purchase-contract.component.css']
})
export class NewPurchaseContractComponent implements OnInit, OnDestroy {

  @ViewChild('file') fileControl: ElementRef;
  fileBlob: File;
  fileContent: ArrayBuffer;

  ipfsHash$: Observable<string>;
  uploadStatus$: Observable<FileUploadStatus>;
  private readonly IMAGE_PATTERN: RegExp = /^.+\.(png|jpg|jpeg|gif|png)$/;
  commissions: string[] = ['2.0', '2.5', '3.0', '3.5', '4.0'];

  constructor(
    private store$: Store<fromPurchaseContract.AppState>,
    private formBuilder: FormBuilder,
    public dialog: MatDialog
  ) { }

  frmGroup: FormGroup = this.formBuilder.group({
    productKey: ['', [Validators.required, bites32StringValidator]],
    description: ['', Validators.required],
    etherValue: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,3})?$/)]],
    commission: ['', Validators.required],
    fileArg: [
      '', [Validators.required, Validators.pattern(this.IMAGE_PATTERN)]
    ],
    ipfsHash: ['', Validators.required] // to hold ipfsHash value
  });


  ngOnInit() {

    this.uploadStatus$ = this.store$.pipe(select(fromPurchaseContract.getIpfsUploadStatus));
    this.ipfsHash$ = this.store$.pipe(
      select(fromPurchaseContract.getIpfsHash),
      tap(value => this.frmGroup.get('ipfsHash').patchValue(value))
    );
  }

  formControl = (name: string) => this.frmGroup.get(`${name}`);

  /*
     A controls is said to be touched if the the user focused on the control
     and then focused on something else.
     For example by clicking into the control and then pressing tab or clicking on another control in the form.

      The difference between touched and dirty is that with touched the user doesn’t need to actually change
      the value of the input control.
    */
  required = (name: string) =>
    this.formControl(name).hasError('required') && this.formControl(name).touched

  invalidPattern = (name: string) =>
    // 'dirty' means that the user is actually interacted with the control
    // making attempt of typing vs just focusing or blaring
    this.formControl(name).hasError('pattern') && this.formControl(name).dirty

  invalid32BytesKey = (name: string) =>
    this.formControl(name).hasError('forbiddenKey') && this.formControl(name).dirty

  requiredFile = (name: string) => this.formControl(name).hasError('required');
  invalidPatternFile = (name: string) => this.formControl(name).hasError('pattern');


  // here is the way to emulate the click on the file input control
  selectFile() {
    this.fileControl.nativeElement.click();
  }

  onFileChange(event) {
    if (event.target.files && event.target.files.length) {
      this.fileBlob = event.target.files[0];

      this.frmGroup.get('fileArg').patchValue(this.fileBlob.name);

      const reader = new FileReader();
      reader.readAsDataURL(this.fileBlob);
      reader.onload = _ => {
        this.fileContent = reader.result as ArrayBuffer;
        this.store$.dispatch(IpfsImageActions.reset());
      };
    }
  }

  uploadFile() {
    this.store$.dispatch(IpfsImageActions.uploadImage({ file: this.fileBlob }));
  }


  isPending = (status: FileUploadStatus) => status === FileUploadStatus.Pending;
  isSuccess = (status: FileUploadStatus) => status === FileUploadStatus.Success;
  isError = (status: FileUploadStatus) => status === FileUploadStatus.Error;
  inProgress = (status: FileUploadStatus) => status === FileUploadStatus.Progress;


  loadImage() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '460px';
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    this.dialog.open(ShowIpfsImageComponent, dialogConfig);

  }

  onCreate(): void {
    const { valid } = this.frmGroup;

    if (valid) {
      const { fileArg, ...model } = this.frmGroup.value;
      this.store$.dispatch(PurchaseContractActions.createPurchaseContract({ payload: model }));
    }

  }

  ngOnDestroy(): void {

    this.store$.dispatch(IpfsImageActions.reset());
  }

}
