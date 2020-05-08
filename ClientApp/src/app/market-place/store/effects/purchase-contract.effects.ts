
import { Injectable } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { serializeError } from 'serialize-error';
import {
  map, mapTo, tap, filter, withLatestFrom,
  switchMap, exhaustMap, catchError, concatMap, concatMapTo
} from 'rxjs/operators';

import { of, concat } from 'rxjs';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Router, ActivatedRouteSnapshot } from '@angular/router';

import { FleaMarketContractService } from '../../services/flea-market-contract-service';
import { PurchaseContractService } from '../../services/purchase-contract-service';

import * as fromStore from '../reducers';
import { Store, select } from '@ngrx/store';
import { PurchaseContractActions } from '../actions';
import { ErrorActions, SpinnerActions, SnackBarActions, Web3GatewayActions } from '../../../core/store/actions';
import { AppearanceColor, SnackBarInterface } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../core/components/confirm-dialog/confirm-dialog.component';



@Injectable()
export class PurchaseContractEffects {
  constructor(
    private store$: Store<fromStore.AppState>,
    private fleaSrv: FleaMarketContractService,
    private purchaseSrv: PurchaseContractService,
    private actions$: Actions,
    private router: Router,
    private dialog: MatDialog
  ) { }


  createProduct$ = createEffect(
    () => this.actions$.pipe(
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
              Web3GatewayActions.getBalance()];
          }),

          catchError((err: Error) =>
            of(this.handleError(err), SpinnerActions.hide(), Web3GatewayActions.getBalance())
          )
        );
      })

    ));

  loadPurchaseContract$ = createEffect(
    () => this.actions$.pipe(
      ofType(PurchaseContractActions.loadPurchaseContract),
      map(action => action.address),
      switchMap(address => {

        return this.purchaseSrv.loadPurchaseContract(address).pipe(
          map(contract =>
            PurchaseContractActions.loadPurchaseContractSuccess({ contract })),
          catchError((err: Error) => of(this.handleError(err), SpinnerActions.hide()))
        );
      })

    ));


  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.loadProducts),
      switchMap(() =>

        this.fleaSrv.getPurchaseContractList().pipe(
          tap(products => console.log('purchase contracts:', products)),
          map(products => PurchaseContractActions.loadProductsSuccess({ products })),
          catchError((err: Error) => of(this.handleError(err), SpinnerActions.hide()))
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
          // Gets an observable that is notified when the dialog is finished closing.
          return dialogRef.afterClosed();
        }),
        filter(result => !!result),
        exhaustMap(result => concat(

          of(SpinnerActions.show()),
          this.fleaSrv.removePurchaseContract(result).pipe(
            tap(productKey => console.log(`Contract has been removed: ${productKey}`)),
            /*
            Related to the operators mapTo and concatMapTo. These operators map to static values.
            Sometimes you want to map to dynamic values,
            such as using a value passed in via an action’s payload property.
            For dynamic values, use the matching operators map or concatMap which expect a function rather than a static value.
            */
            concatMap(productKey =>
              [PurchaseContractActions.removePurchaseContractSuccess({ key: productKey }),
              Web3GatewayActions.getBalance()]
            ),
            catchError((err: Error) =>
              of(this.handleError(err), SpinnerActions.hide(), Web3GatewayActions.getBalance())
            )
          ),
          of(SpinnerActions.hide()),
        ))

      ));

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
            content: `Are you sure you want to deactivate contract: ${contract.productKey}?`,
            output: contract.contractAddress
          };

          const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
          // Gets an observable that is notified when the dialog is finished closing.
          return dialogRef.afterClosed();
        }),
        filter(result => !!result),
        exhaustMap(result => concat(

          of(SpinnerActions.show()),
          this.purchaseSrv.abortPurchaseContract(result).pipe(
            tap(address => console.log(`Successfully canceled contract: ${address} `)),
            concatMapTo(
              [PurchaseContractActions.abortSelectedPurchaseContractSuccess(),
              Web3GatewayActions.getBalance()]
            ),
            catchError((err: Error) =>
              of(this.handleError(err), SpinnerActions.hide(), Web3GatewayActions.getBalance())
            )
          ),
          of(SpinnerActions.hide()),
        ))

      ));

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
          // Gets an observable that is notified when the dialog is finished closing.
          return dialogRef.afterClosed();
        }),
        filter(result => !!result),
        exhaustMap(result => concat(

          of(SpinnerActions.show()),
          this.purchaseSrv.confirmPurchase(result.address, result.eth).pipe(
            tap(address => console.log(`Purchase confirmed successfully for the contract: ${address} `)),
            concatMapTo(
              [PurchaseContractActions.confirmBuySuccess(), Web3GatewayActions.getBalance()]
            ),
            catchError((err: Error) => of(this.handleError(err), Web3GatewayActions.getBalance()))
          ),
          of(SpinnerActions.hide())
        ))

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
          // Gets an observable that is notified when the dialog is finished closing.
          return dialogRef.afterClosed();
        }),
        filter(result => !!result),
        exhaustMap(result => concat(

          of(SpinnerActions.show()),
          this.purchaseSrv.confirmDelivery(result).pipe(
            tap(address => console.log(`Delivery confirmed successfully for the contract: ${address} `)),
            concatMapTo(
              [PurchaseContractActions.confirmDeliverySuccess(), Web3GatewayActions.getBalance()]
            ),
            catchError((err: Error) =>
              of(this.handleError(err), Web3GatewayActions.getBalance())
            )
          ),
          of(SpinnerActions.hide()),
        ))

      ));

  withdrawBySeller$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.releaseEscrow),
      withLatestFrom(this.store$.pipe(select(fromStore.getSelectedPurchaseContract))),
      map(([payload, contract]) => contract.contractAddress),
      exhaustMap((address) => {

        return this.purchaseSrv.withdrawBySeller(address).pipe(
          concatMap(eth =>
            [PurchaseContractActions.releaseEscrowSuccess({ amount: eth }),
            Web3GatewayActions.getBalance()]
          ),
          catchError((err: Error) =>
            of(this.handleError(err), SpinnerActions.hide(), Web3GatewayActions.getBalance())
          )
        );
      })

    ));

  withdrawByOwner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.withdrawByOwner),
      withLatestFrom(this.store$.pipe(select(fromStore.getSelectedPurchaseContract))),
      map(([payload, contract]) => contract.contractAddress),
      exhaustMap((address) => {

        return this.purchaseSrv.withdrawByOwner(address).pipe(
          concatMap(eth =>
            [PurchaseContractActions.withdrawByOwnerSuccess({ amount: eth }),
            Web3GatewayActions.getBalance()]
          ),
          catchError((err: Error) =>
            of(this.handleError(err), SpinnerActions.hide(), Web3GatewayActions.getBalance())
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

  reload$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PurchaseContractActions.abortSelectedPurchaseContractSuccess,
          PurchaseContractActions.confirmBuySuccess,
          PurchaseContractActions.confirmDeliverySuccess,
          PurchaseContractActions.releaseEscrowSuccess,
          PurchaseContractActions.withdrawByOwnerSuccess),
        withLatestFrom(this.store$.pipe(select(fromStore.getSelectedPurchaseContract))),
        tap(async ([action, contract]) => {

          // here is the trick to make  this.selectedPurchaseContract$ emit
          // on the same route
          // we need to reload on the same route
          // based on https://github.com/angular/angular/issues/13831
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.navigate(['/market-place/products', contract.productKey]);

        })
      ),
    { dispatch: false }
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.createPurchaseContract,
        PurchaseContractActions.loadProducts,
        PurchaseContractActions.loadPurchaseContract,
        PurchaseContractActions.releaseEscrow,
        PurchaseContractActions.withdrawByOwner
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
        PurchaseContractActions.releaseEscrowSuccess,
        PurchaseContractActions.withdrawByOwnerSuccess
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

  showSnackbarOnReleaseEscrow$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.releaseEscrowSuccess),
      map((payload) => {

        const msg: SnackBarInterface = {
          message: `Fund in amount: ${payload.amount} ETH has been successfully release back to Seller`,
          color: AppearanceColor.Success
        };

        return SnackBarActions.open({ payload: msg });
      })
    )
  );

  showSnackbarOnReceiveCommission$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PurchaseContractActions.withdrawByOwnerSuccess),
      map((payload) => {

        const msg: SnackBarInterface = {
          message: `Commission in amount: ${payload.amount} ETH has been successfully transferred to Owner`,
          color: AppearanceColor.Success
        };

        return SnackBarActions.open({ payload: msg });
      })
    )
  );

  showSnackbarOnSuccess$ = createEffect(() =>
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

  private handleError(error: Error) {
    const friendlyErrorMessage = serializeError(error).message;
    return ErrorActions.errorMessage({ errorMsg: friendlyErrorMessage });
  }
}
