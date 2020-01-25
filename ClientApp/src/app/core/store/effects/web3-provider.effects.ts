import { Injectable, Inject } from '@angular/core';
import { serializeError } from 'serialize-error';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { of, from, fromEvent, EMPTY as empty } from 'rxjs';
import { exhaustMap, switchMap, map, tap, catchError, withLatestFrom, filter } from 'rxjs/operators';

import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../reducers';

import { MetamaskEthereumToken } from '../../services/tokens';
import { EthersProviderService } from '../../services/ethers-provider-service';
import { Web3ProviderActions, SpinnerActions, ErrorActions } from '../actions';

@Injectable()
export class Web3ProviderEffects {
  constructor(
    @Inject(MetamaskEthereumToken) private web3Token,
    private readonly actions$: Actions,
    private store$: Store<fromStore.AppState>,
    private router: Router,
    private providerSrv: EthersProviderService,
  ) { }


  // ethereum.enable() will be Deprecated
  /*
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
              of(this.handleError(err), SpinnerActions.hide())
            )
          );
        }

        return empty;
      })
    )
  );
  */

  metaMaskEnable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.init),
      exhaustMap(() => {

        // Requests the user provides an ethereum address to be identified by.
        // Returns a promise of an array of hex-prefixed ethereum address strings.
        // Currently only ever one: accounts[0], for example,
        // ['0xFDEa65C8e26263F6d9A1B5de9555D2931A33b825']
        return from(this.web3Token.send('eth_requestAccounts')).pipe(
          tap((ethAccounts: string[]) =>
            console.log(`Ethereum provider has been granted access to the following accounts: ${ethAccounts}`)
          ),
          map((ethAccounts: string[]) => {
            if (ethAccounts.length === 0) {
              return ErrorActions.errorMessage({ errorMsg: `Can't get any user accounts` });
            }
            return Web3ProviderActions.initSuccess();
          }),
          // User denied account access
          catchError((err: Error) => of(this.handleError(err), SpinnerActions.hide())
          )
        );

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
          catchError((err: Error) => of(this.handleError(err)))
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
          catchError((err: Error) => of(this.handleError(err)))
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
          catchError((err: Error) => of(this.handleError(err)))
        )
      )
    )
  );


  // example of using native events
  /*
  resize$ = createEffect(
    () =>
    fromEvent(window, 'resize').pipe(
      tap(event => console.log( 'event', event) )
      ),
      { dispatch: false }
  );

  // output
  // event, Event {isTrusted: true, type: "resize", target: Window, currentTarget: Window, eventPhase: 2, …}
  */

  // based on https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md#chainchanged
  // and https://gist.github.com/rekmarks/d318677c8fc89e5f7a2f526e00a0768a
  // Note that this event is emitted on page load also
 // If the array of accounts is non-empty, you're already connected.
  accountChanged$ = createEffect(
    () =>
      fromEvent(this.web3Token, 'accountsChanged').pipe(
        withLatestFrom(this.store$.pipe(select(fromStore.getAccount))),
        // filter(([accounts, currentAccount]) => ((accounts as Array<string>).length > 0 && !!currentAccount)),
        tap(([accounts, currentAccount]) => {

          if (currentAccount !== accounts[0]) {
            console.log('new account', accounts[0]);
            // we need to reload browser
            // based onhttps://medium.com/metamask/no-longer-reloading-pages-on-network-change-fbf041942b44
            document.location.reload();
          }
        })
      ),
    { dispatch: false }
  );


  private handleError(error: Error) {
    const friendlyErrorMessage = serializeError(error).message;
    return ErrorActions.errorMessage({ errorMsg: friendlyErrorMessage });
  }


}
