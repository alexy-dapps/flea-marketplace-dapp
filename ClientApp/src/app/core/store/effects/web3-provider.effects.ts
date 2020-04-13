import { Injectable, Inject } from '@angular/core';
import { serializeError } from 'serialize-error';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { of, from, fromEvent, EMPTY as empty, Observable } from 'rxjs';
import { exhaustMap, switchMap, map, tap, catchError, withLatestFrom, filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

import { Actions, ofType, createEffect, ROOT_EFFECTS_INIT } from '@ngrx/effects';
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
    @Inject(DOCUMENT) private document: Document
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

  // only allow MetaMask
  /*
  After all the root effects have been added, the root effect dispatches a ROOT_EFFECTS_INIT action.
  You can see this action as a lifecycle hook, which you can use in order to execute some code after
   all your root effects have been added.
  */
  metaMaskEnabled$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => {

        // https://gist.github.com/rekmarks/d318677c8fc89e5f7a2f526e00a0768a
        const ethereum = (window as any).ethereum;
        // Returns true or false, representing whether the user has MetaMask installed.
        if (!ethereum || !ethereum.isMetaMask) {
          return ErrorActions.errorMessage({ errorMsg: `Please install MetaMask.` });
        }
        // do-nothing action
        return Web3ProviderActions.emptyAction();
      })
    )
  );


  metaMaskConnect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.metamaskConnect),
      exhaustMap(() => {

        // This is equivalent to ethereum.enable()
        // return list of user account
        // currently only ever one: accounts[0]
        return from(this.web3Token.send('eth_requestAccounts')).pipe(
          map((ethAccounts: any[]) => {
            if (ethAccounts.length === 0) {
              return ErrorActions.errorMessage({ errorMsg: `Can't get any user accounts` });
            }
            console.log(`Ethereum provider has been granted access to the following account:`, ethAccounts[0]);
            return Web3ProviderActions.metamaskConnectSuccess();
          }),
          // User denied account access
          catchError((err: Error) => of(this.handleError(err), SpinnerActions.hide())
          )
        );

      })
    )
  );

  connectRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(Web3ProviderActions.connectRedirect),
        tap(_ => {
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.metamaskConnect),
      map(() => SpinnerActions.show())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.metamaskConnectSuccess),
      map(() => SpinnerActions.hide())
    )
  );

  getAccountInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3ProviderActions.metamaskConnectSuccess),
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
        filter(([accounts, currentAccount]) => !!currentAccount && (currentAccount !== accounts[0])),
        map(([accounts, currentAccount]) => {
            console.log('new account', accounts[0]);
            // we need to reload browser
            // based onhttps://medium.com/metamask/no-longer-reloading-pages-on-network-change-fbf041942b44
            this.document.location.reload();
            // this.router.navigate(['/']);
        })
      ),
      { dispatch: false }
  );

  private handleError(error: Error) {
    const friendlyErrorMessage = serializeError(error).message;
    return ErrorActions.errorMessage({ errorMsg: friendlyErrorMessage });
  }


}
