
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { windowRefToken } from '../../../core/services/tokens';
import { PurchaseContractModel, ContractState } from '../../models';
import {ThemePalette} from '@angular/material/core';


interface StatusColor {
  state: ContractState;
  color: ThemePalette;
}

@Component({
  selector: 'app-purchase-contract-detail',
  templateUrl: './purchase-contract-detail.component.html',
  styles: [
    `
    mat-list-item h3 {
        width: 240px;
      }

    `
  ]
})
export class PurchaseContractDetailComponent implements OnChanges {

  @ViewChild('ipfsImage') imageRef: ElementRef;
  @Input() contract: PurchaseContractModel;
  @Input() image: Blob;
  @Input() account: string;
  @Output() remove = new EventEmitter<string>();
  @Output() abortMe = new EventEmitter();
  @Output() buy = new EventEmitter<string>();
  @Output() delivery = new EventEmitter();
  @Output() releaseEscrow = new EventEmitter();
  @Output() receiveCommission = new EventEmitter();

  statusColors: StatusColor[] = [
    {state: ContractState.Created, color: 'accent'},
    {state: ContractState.Locked, color: 'primary'},
    {state: ContractState.Canceled, color: undefined},
    {state: ContractState.ItemReceived, color: 'accent'},
    {state: ContractState.SellerPaid, color: 'primary'},
    {state: ContractState.OwnerPaid, color: 'primary'},
    {state: ContractState.Completed, color: 'warn'},
  ];

  buyerConfirmPrice = new FormControl('', [Validators.required, , Validators.pattern(/^\d+(\.\d{1,4})?$/)]);

  constructor(
    @Inject(windowRefToken) private windowRef: Window
  ) { }

  ngOnChanges(changes: SimpleChanges) {

    if (this.imageRef) {
      this.imageRef.nativeElement.src = this.windowRef.window.URL.createObjectURL(this.image);
    }

    this.buyerConfirmPrice.reset();
  }

  // based on http://geekswithblogs.net/PhubarBaz/archive/2013/11/25/typescript-enums-to-string.aspx
  enumToString = (state: ContractState): string => ContractState[state];

  get validatorError() {
    return this.buyerConfirmPrice.hasError('required') ? 'You must enter a value' :
      this.buyerConfirmPrice.hasError('pattern') ? 'Not a valid format' :
        '';
  }


  // only the deployer can remove contract and the state is Canceled
  get removeFromListing() {
    return (this.contract.state === ContractState.Canceled) &&
    (this.contract.ownerAddress === this.account);
  }


  // only the seller can abort contract and the state is Created
  get canAbort() {
    return (this.contract.state === ContractState.Created) &&
    (this.contract.sellerAddress === this.account);

  }
  /* criteria to buy action
   - contract in state Created
   - Buyer address is null
   - And it is should be not the Seller

  */
  get canBuy() {
    return (this.contract.state === ContractState.Created)
    && (!this.contract.buyerAddress)
    && (this.contract.sellerAddress !== this.account);

  }
  // only the buyer can perform this action and the state is Locked
  get canDelivery() {
    return (this.contract.state === ContractState.Locked) &&
    (this.contract.buyerAddress === this.account);
  }

  // only the seller and the deployer can see commission field
  get showCommission() {
    return (this.contract.ownerAddress === this.account) ||
    (this.contract.sellerAddress === this.account);
  }

  get canReleaseEscrow() {
    return (this.contract.state === ContractState.ItemReceived || this.contract.state === ContractState.OwnerPaid ) &&
    (this.contract.sellerAddress === this.account);
  }

  get canReceiveCommission() {
    return (this.contract.state === ContractState.ItemReceived || this.contract.state === ContractState.SellerPaid ) &&
    (this.contract.ownerAddress === this.account);
  }

}

