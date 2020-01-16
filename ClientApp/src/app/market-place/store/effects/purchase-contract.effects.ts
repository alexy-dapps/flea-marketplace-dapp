
import { Injectable } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { exhaustMap, map, mapTo, tap, switchMap, withLatestFrom, catchError, concatMap, concatMapTo } from 'rxjs/operators';
import { of } from 'rxjs';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

import { FleaMarketContractService } from '../../services/flea-market-contract-service';
import { PurchaseContractService } from '../../services/purchase-contract-service';

import * as fromStore from '../reducers';
import { Store, select } from '@ngrx/store';
import { PurchaseContractActions } from '../actions';
import { ErrorActions, SpinnerActions, SnackBarActions, Web3ProviderActions } from '../../../core/store/actions';
import { AppearanceColor, SnackBarInterface } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';



@Injectable()
export class PurchaseContractEffects {
  constructor(
    private store$: Store<fromStore.AppState>,
    private fleaSrv: FleaMarketContractService,
    private purchaseSrv: PurchaseContractService,
    private readonly actions$: Actions,
    private router: Router,
    private dialog: MatDialog
  ) { }


  createProduct$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PurchaseContractActions.createPurchaseContract),
        map(action => action.payload),
        exhaustMap((payload) => {

          return this.fleaSrv.createPurchaseContract(payload).pipe(
            tap(address => console.log('Contract address: ', address)),
            switchMap((address: string) => {

              return [
                PurchaseContractActions.createPurchaseContractSuccess({
                  product: {
                    productKey: payload.productKey,
                    contractAddress: address
                  }
                }),
                // update ballance
                Web3ProviderActions.getBalance()];
            }),

            catchError((err: Error) =>
              of(ErrorActions.errorMessage({ errorMsg: err.message }), SpinnerActions.hide(),
                // update ballance
                Web3ProviderActions.getBalance())
            )
          );
        })

      ));

  loadPurchaseContract$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PurchaseContractActions.loadPurchaseContract),
        map(action => action.address),
        switchMap(address => {

          return this.purchaseSrv.loadPurchaseContract(address).pipe(
            map(contract =>
              PurchaseContractActions.loadPurchaseContractSuccess({ contract })),

            catchError((err: Error) =>
              of(ErrorActions.errorMessage({ errorMsg: err.message }), SpinnerActions.hide())
            ));
        })

      ));

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.createPurchaseContract,
        PurchaseContractActions.loadProducts,
        PurchaseContractActions.loadPurchaseContract,
        PurchaseContractActions.removePurchaseContract,
        PurchaseContractActions.abortSelectedPurchaseContract,
        PurchaseContractActions.confirmBuy,
        PurchaseContractActions.confirmDelivery
      ),

     // Related to the operators mapTo and concatMapTo. These operators map to static values.
      mapTo(SpinnerActions.show())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.createPurchaseContractSuccess,
        PurchaseContractActions.loadProductsSuccess,
        PurchaseContractActions.loadPurchaseContractSuccess,
        PurchaseContractActions.removePurchaseContractSuccess,
        PurchaseContractActions.abortSelectedPurchaseContractSuccess,
        PurchaseContractActions.confirmBuySuccess,
        PurchaseContractActions.confirmDeliverySuccess
      ),
      mapTo(SpinnerActions.hide())
    )
  );

  showSnackbarOnCreateContract$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.createPurchaseContractSuccess),
      map((payload) => {

        const msg: SnackBarInterface = {
          message: `New smart product contract has been created successfully: Address: ${payload.product.contractAddress}`,
          color: AppearanceColor.Success
        };

        return SnackBarActions.open({ payload: msg });
      })
    )
  );

  showSnackbarOnConfirm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.abortSelectedPurchaseContractSuccess,
        PurchaseContractActions.confirmBuySuccess,
        PurchaseContractActions.confirmDeliverySuccess
      ),
      withLatestFrom(this.store$.pipe(select(fromStore.getSelectedPurchaseContract))),
      map(([action, contract]) => {

        let msg = '';

        if (action.type === '[PurchaseContract/Command] Abort Purchase Contract Success') {
          msg = `The request made by the seller to abort the contract '${contract.description}' has been confirmed!`;
        } else if (action.type === '[PurchaseContract/Command] Confirm Buy Success') {
          msg = `Deposit fund made by the buyer for item '${contract.description}' has been confirmed!`;
        } else if (action.type === '[PurchaseContract/Command] Confirm Product Delivery Success') {
          msg = `Receiving item '${contract.description}' by the buyer has been confirmed!`;
        }


        return SnackBarActions.open({
          payload: {
            message: msg,
            color: AppearanceColor.Success
          }
        });
      })
    )
  );


  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.loadProducts),
      switchMap(() =>

        this.fleaSrv.getPurchaseContractList().pipe(
          tap(products => console.log('purchase contracts:', products)),
          map(products => PurchaseContractActions.loadProductsSuccess({ products })),
          catchError((err: Error) =>
            of(ErrorActions.errorMessage({ errorMsg: err.message }),
              SpinnerActions.hide())
          )

        )
      )
    ));


  removeProduct$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PurchaseContractActions.removePurchaseContract),
        map(payload => payload.key),
        switchMap(key => {

          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '420px';
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;
          dialogConfig.data = {
            title: 'Confirm Remove',
            content: `Are you sure to remove contract ${key} from market?`,
            output: key
          };

          const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

          //  * Gets an observable that is notified when the dialog is finished closing.
          return dialogRef.afterClosed();

        }),
        exhaustMap(result => {

          if (result === undefined) {
            return of(SpinnerActions.hide());
          }

          return this.fleaSrv.removePurchaseContract(result).pipe(
            tap(productKey => console.log(`Contract has been removed: ${productKey}`)),
            /*
            Related to the operators mapTo and concatMapTo. These operators map to static values.
            Sometimes you want to map to dynamic values,
            such as using a value passed in via an action’s payload property.
            For dynamic values, use the matching operators map or concatMap which expect a function rather than a static value.
            */
            concatMap(productKey =>
              [PurchaseContractActions.removePurchaseContractSuccess({ key: productKey }),
              // update ballance
              Web3ProviderActions.getBalance()]
            ),
            catchError((err: Error) =>
              of(ErrorActions.errorMessage({ errorMsg: err.message }), SpinnerActions.hide(),
                // update ballance
                Web3ProviderActions.getBalance())
            )
          );
        })

      ));

  removeProductRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PurchaseContractActions.removePurchaseContractSuccess),
        tap(_ => {
          this.router.navigate(['/market-place']);
        })
      ),
    { dispatch: false }
  );

  abortContract$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PurchaseContractActions.abortSelectedPurchaseContract),
        withLatestFrom(this.store$.pipe(select(fromStore.getSelectedPurchaseContract))),
        switchMap(([action, contract]) => {

          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '420px';
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;
          dialogConfig.data = {
            title: 'Confirm Abort',
            content: `Are you sure to deactivate contract: ${contract.productKey}?`,
            output: contract.contractAddress
          };

          const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

          //  * Gets an observable that is notified when the dialog is finished closing.
          return dialogRef.afterClosed();

        }),
        exhaustMap(result => {

          if (result === undefined) {
            return of(SpinnerActions.hide());
          }

          return this.purchaseSrv.abortPurchaseContract(result).pipe(
            tap(address => console.log(`Successfully canceled contract: ${address} `)),
            concatMapTo(
              [PurchaseContractActions.abortSelectedPurchaseContractSuccess(),
              // update ballance
              Web3ProviderActions.getBalance()]
            ),
            catchError((err: Error) =>
              of(ErrorActions.errorMessage({ errorMsg: err.message }), SpinnerActions.hide(),
                // update ballance
                Web3ProviderActions.getBalance())
            )
          );
        })

      ));

  reload$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PurchaseContractActions.abortSelectedPurchaseContractSuccess,
          PurchaseContractActions.confirmBuySuccess,
          PurchaseContractActions.confirmDeliverySuccess),
        withLatestFrom(this.store$.pipe(select(fromStore.getSelectedPurchaseContract))),
        tap(async ([action, contract]) => {

          // here is the trick to make  this.selectedPurchaseContract$ emit
          // on the same route
          // generate a random product key
          const randomKey = Math.random().toString(36).replace('0.', '');
          await this.router.navigate(['/market-place/products', randomKey]);
          await this.router.navigate(['/market-place/products', contract.productKey]);

        })
      ),
    { dispatch: false }
  );

  confirmBuy$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PurchaseContractActions.confirmBuy),
        withLatestFrom(this.store$.pipe(select(fromStore.getSelectedPurchaseContract))),
        switchMap(([payload, contract]) => {

          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '420px';
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;
          dialogConfig.data = {
            title: 'Confirm Purchase',
            content: `Please confirm to deposit ${payload.eth} ETH into the contract: ${contract.productKey}`,
            output: {
              address: contract.contractAddress,
              eth: payload.eth

            }
          };

          const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

          //  * Gets an observable that is notified when the dialog is finished closing.
          return dialogRef.afterClosed();

        }),
        exhaustMap(result => {

          if (result === undefined) {
            return of(SpinnerActions.hide());
          }

          return this.purchaseSrv.confirmPurchase(result.address, result.eth).pipe(
            tap(address => console.log(`Purchase confirmed successfully for the contract: ${address} `)),
            concatMapTo(
              [PurchaseContractActions.confirmBuySuccess(),
              // update ballance
              Web3ProviderActions.getBalance()]
            ),
            catchError((err: Error) =>
              of(ErrorActions.errorMessage({ errorMsg: err.message }), SpinnerActions.hide(),
                // update ballance
                Web3ProviderActions.getBalance())
            )
          );
        })

      ));

  confirmDelivery$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PurchaseContractActions.confirmDelivery),
        withLatestFrom(this.store$.pipe(select(fromStore.getSelectedPurchaseContract))),
        switchMap(([payload, contract]) => {

          const dialogConfig = new MatDialogConfig();
          dialogConfig.width = '420px';
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;
          dialogConfig.data = {
            title: 'Confirm Delivery',
            content: `Are you sure you want to confirm that you received the purchase item ${contract.description}`,
            output: contract.contractAddress
          };

          const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

          //  * Gets an observable that is notified when the dialog is finished closing.
          return dialogRef.afterClosed();

        }),
        exhaustMap(result => {

          if (result === undefined) {
            return of(SpinnerActions.hide());
          }

          return this.purchaseSrv.confirmDelivery(result).pipe(
            tap(address => console.log(`Delivery confirmed successfully for the contract: ${address} `)),
            concatMapTo(
              [PurchaseContractActions.confirmDeliverySuccess(),
              // update ballance
              Web3ProviderActions.getBalance()]
            ),
            catchError((err: Error) =>
              of(ErrorActions.errorMessage({ errorMsg: err.message }), SpinnerActions.hide(),
                // update ballance
                Web3ProviderActions.getBalance())
            )
          );
        })

      ));


}
