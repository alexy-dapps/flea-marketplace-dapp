import { Injectable, Inject } from '@angular/core';

import { Actions, ofType, createEffect } from '@ngrx/effects';
import { of, from, EMPTY as empty } from 'rxjs';
import { exhaustMap, switchMap, map, tap, catchError } from 'rxjs/operators';

import { MetamaskEthereumToken } from '../../services/tokens';
import { EthersProviderService } from '../../services/ethers-provider-service';
import { Web3ProviderActions, SpinnerActions, ErrorActions } from '../actions';

@Injectable()
export class Web3ProviderEffects {
  constructor(
    @Inject(MetamaskEthereumToken) private web3Token,
    private providerSrv: EthersProviderService,
    private readonly actions$: Actions
  ) { }

  metaMaskEnable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.init),
      exhaustMap(() => {
        if ('enable' in this.web3Token) {

          // ethereum.enable(): Requests the user provides an ethereum address to be identified by.
          // Returns a promise of an array of hex-prefixed ethereum address strings.
          return from(this.web3Token.enable()).pipe(
            tap((ethAccounts: string[]) =>
              console.log(
                'Ethereum provider has been granted access to the following accounts',
                ethAccounts
              )
            ),
            map((ethAccounts: string[]) => {
              if (ethAccounts.length === 0) {
                return ErrorActions.errorMessage({
                  errorMsg: 'Can not get any user accounts'
                });
              }

              return Web3ProviderActions.initSuccess();
            }),

            // User denied account access
            catchError((err: Error) =>
              of(ErrorActions.errorMessage({ errorMsg: err.message }), SpinnerActions.hide())
            )
          );
        }

        return empty;
      })
    )
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.init),
      map(() => SpinnerActions.show())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.initSuccess),
      map(() => SpinnerActions.hide())
    )
  );

  showAccountInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.initSuccess),
      switchMap(() => {
        return [Web3ProviderActions.getNetwork(), Web3ProviderActions.getAddress(), Web3ProviderActions.getBalance()];

      })
    )
  );

  getAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.getAddress),
      switchMap(() =>
        this.providerSrv.getSelectedAddress().pipe(
          map((address: string) => Web3ProviderActions.addressSuccess({ address })),
          catchError((err: Error) =>
            of(ErrorActions.errorMessage({ errorMsg: err.message }))
          )
        )
      )
    )
  );

  getBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.getBalance),
      switchMap(() =>
        this.providerSrv.getBalance().pipe(
          map((balance: string) =>
            Web3ProviderActions.balanceSuccess({ balance })
          ),
          catchError((err: Error) =>
            of(ErrorActions.errorMessage({ errorMsg: err.message }))
          )
        )
      )
    )
  );

  getNetwork$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.getNetwork),
      switchMap(() =>
        this.providerSrv.getNetwork().pipe(
          map((network: string) =>
            Web3ProviderActions.networkSuccess({ network })
          ),
          catchError((err: Error) =>
            of(ErrorActions.errorMessage({ errorMsg: err.message }))
          )
        )
      )
    )
  );



}
