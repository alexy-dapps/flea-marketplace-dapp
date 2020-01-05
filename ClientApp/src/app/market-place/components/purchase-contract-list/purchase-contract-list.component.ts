import { Component, Input, Output, EventEmitter } from '@angular/core';

import { PurchaseWidgetModel } from '../../models';


@Component({
  selector: 'app-purchase-contract-list',
  templateUrl: './purchase-contract-list.component.html',
  styles: [
    `
    mat-list {
      position: relative;
      max-height: 420px;
      overflow: auto;
      }

    `,
    `
    mat-list-item {
      cursor: pointer;
      }

    mat-list-item:hover {
      box-shadow: 3px 3px 12px -2px rgba(0, 0, 0, 0.5);
    }

    `,
  ],

})
export class PurchaseContractListComponent {

  @Input() products: PurchaseWidgetModel[];
  @Output() selectMe = new EventEmitter<PurchaseWidgetModel>();
}
