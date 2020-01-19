
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { map, takeUntil, tap, filter, switchMap } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import * as fromStore from '../../store/reducers';
import * as fromRoot from '../../../core/store/reducers';
import { PurchaseContractActions, IpfsImageActions } from '../../store/actions';
import { PurchaseContractModel } from '../../models';

@Component({
  selector: 'app-view-purchase-contract',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `

      <app-purchase-contract-detail
        *ngIf="{ purchaseContract: selectedPurchaseContract$|async,
          image: image$|async,
          account: account$|async } as values;"
        [contract]="values.purchaseContract"
        [image] = "values.image"
        [account] = "values.account"
        (remove)="removePurchaseContract($event)"
        (abortMe)="abortPurchaseContract()"
        (buy)="confirmBuy($event)"
        (delivery)="confirmDelivery()"
        (releaseEscrow)="withdrawBySeller()"
        (receiveCommission)="withdrawByOwner()"
        >
      </app-purchase-contract-detail>
    `,
})
export class ViewPurchaseContractComponent implements OnInit, OnDestroy {

  account$: Observable<string>;
  selectedPurchaseContract$: Observable<PurchaseContractModel>;
  image$: Observable<Blob>;

  constructor(
    private store$: Store<fromStore.AppState>,
  ) { }

  private unsubscribe$: Subject<void> = new Subject<void>();

  ngOnInit() {

    this.selectedPurchaseContract$ = this.store$.pipe(
      select(fromStore.getSelectedProductWidget),
      filter(product => !!product),
      tap(product => this.store$.dispatch(PurchaseContractActions.loadPurchaseContract({ address: product.contractAddress }))),
      // nice moment here  - we switch from one observable to another
      // https://brianflove.com/2017/11/02/angular-http-client-blob/
      switchMap(() => this.store$.select(fromStore.getSelectedPurchaseContract)),
      filter(contract => !!contract),
    );


    this.image$ = this.store$.pipe(
      select(fromStore.getSelectedPurchaseContract),
      filter(contract => !!contract),
      tap(contract =>
        this.store$.dispatch(IpfsImageActions.downloadImage({ ipfsHash: contract.ipfsHash }))
      ),
      // nice moment here  - we switch to another observable
      // https://brianflove.com/2017/11/02/angular-http-client-blob/
      switchMap(() => this.store$.select(fromStore.getImageBlob)),
      filter(image => !!image)
    );


    this.account$ = this.store$.pipe(select(fromRoot.getAccount));

  }

  removePurchaseContract(key: string) {
    this.store$.dispatch(PurchaseContractActions.removePurchaseContract({ key }));
  }

  abortPurchaseContract() {
    this.store$.dispatch(PurchaseContractActions.abortSelectedPurchaseContract());
  }

  confirmBuy(eth: string) {
    // console.log(`Buyer pays: ${eth}`);
    this.store$.dispatch(PurchaseContractActions.confirmBuy({eth}));
  }

  confirmDelivery() {
    this.store$.dispatch(PurchaseContractActions.confirmDelivery());
  }

  withdrawBySeller() {
    this.store$.dispatch(PurchaseContractActions.releaseEscrow());
  }

  withdrawByOwner() {
    this.store$.dispatch(PurchaseContractActions.withdrawByOwner());
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

  }

}

