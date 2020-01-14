
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { windowRefToken } from '../../../core/services/tokens';
import { PurchaseContractModel, ContractState } from '../../models';

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

  @ViewChild('ipfsImage', { static: false }) imageRef: ElementRef;
  @Input() contract: PurchaseContractModel;
  @Input() image: Blob;
  @Input() account: string;
  @Output() remove = new EventEmitter<string>();
  @Output() abortMe = new EventEmitter();
  @Output() buy = new EventEmitter<string>();
  @Output() delivery = new EventEmitter();

  buyerConfirmPrice = new FormControl('', [Validators.required, , Validators.pattern(/^\d+(\.\d{1,4})?$/)]);

  constructor(
    @Inject(windowRefToken) private windowRef: Window
  ) { }


  ngOnChanges(changes: SimpleChanges) {

    if (this.imageRef) {
      this.imageRef.nativeElement.src = this.windowRef.URL.createObjectURL(this.image);
    }

    this.buyerConfirmPrice.reset();
  }

  get validatorError() {
    return this.buyerConfirmPrice.hasError('required') ? 'You must enter a value' :
      this.buyerConfirmPrice.hasError('pattern') ? 'Not a valid format' :
        '';
  }

  status = (state: ContractState) => {

    switch (state) {
      case ContractState.Created: {
        return {
          color: 'accent',
          state: 'Created'
        };
      }
      case ContractState.Locked: {
        return {
          color: 'primary',
          state: 'Locked'
        };
      }
      case ContractState.Inactive: {
        return {
          color: 'warn',
          state: 'Inactive'
        };
      }
      case ContractState.Canceled: {
        return {
          color: '',
          state: 'Canceled'
        };
      }

    }

  }

  // only the seller can remove contract and the state is Created
  get canRemove() {
    return (this.contract.state === ContractState.Canceled) &&
    (this.contract.sellerAddress === this.account);
  }


  // only the seller can abort contract and the state is Created
  get canAbort() {
    return (this.contract.state === ContractState.Created) &&
    (this.contract.sellerAddress === this.account);

  }
  /* criteria to buy
   - contract in state Created
   - Buyer address is null
   - And it is should be not the Seller

  */
  get canBuy() {
    return this.buyerConfirmPrice.valid && this.buyerConfirmPrice.touched
    && (this.contract.state === ContractState.Created)
    && (!this.contract.buyerAddress)
    && (this.contract.sellerAddress !== this.account);

  }
  // only the buyer can abort contract and the state is Locked
  get canDelivery() {
    return (this.contract.state === ContractState.Locked) &&
    (this.contract.buyerAddress === this.account);
  }

  // only the seller and the deployer can see commission field
  get showCommission() {
    return (this.contract.ownerAddress === this.account) ||
    (this.contract.sellerAddress === this.account);
  }


}

