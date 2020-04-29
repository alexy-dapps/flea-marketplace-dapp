import { Injectable, Inject } from '@angular/core';
import { serializeError } from 'serialize-error';
import { Router } from '@angular/router';
import { of, from, fromEvent, EMPTY as empty, Observable } from 'rxjs';
import { exhaustMap, switchMap, map, tap, catchError, withLatestFrom, filter } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

import { Actions, ofType, createEffect, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../reducers';

import { EthereumProviderToken } from '../../services/tokens';
import { EthersWeb3ProviderService } from '../../services/ethers-web3-provider-service';
import { Web3GatewayActions, SpinnerActions, ErrorActions } from '../actions';
import { utils } from 'ethers';

@Injectable()
export class Web3GatewayEffects {
  constructor(
    @Inject(EthereumProviderToken) private ethProvider,
    private readonly actions$: Actions,
    private store$: Store<fromStore.AppState>,
    private router: Router,
    private web3ProviderSrv: EthersWeb3ProviderService,
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
  ethereumInject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ROOT_EFFECTS_INIT),
      map(() => {

        // https://gist.github.com/rekmarks/d318677c8fc89e5f7a2f526e00a0768a
        // Returns true or false, representing whether the user has MetaMask installed.
        if (!this.ethProvider || !this.ethProvider.isMetaMask) {
          return ErrorActions.errorMessage({ errorMsg: `Please install MetaMask.` });
        }
        return Web3GatewayActions.ethereumInjectSuccess();
      })
    )
  );


  ethereumConnect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3GatewayActions.ethereumConnect),
      exhaustMap(() => {

        // This is equivalent to ethereum.enable()
        // return list of user account
        // currently only ever one: accounts[0]
        return from(this.ethProvider.send('eth_requestAccounts')).pipe(
          // You now have an array of accounts!
          // Currently only ever one:
          // { id: 1, jsonrpc: "2.0", result: ['0xFDEa65C8e26263F6d9A1B5de9555D2931A33b825']}
          map((ethAccounts: any[]) => {
            if (ethAccounts.length === 0) {
              return ErrorActions.errorMessage({ errorMsg: `Can't get any user accounts` });
            }
            console.log(`Ethereum provider has been granted access to the following account:`, ethAccounts[0]);
            return Web3GatewayActions.ethereumConnectSuccess();
          }),
          // User denied account access
          catchError((err: Error) => of(this.handleError(err), SpinnerActions.hide()) )
        );

      })
    )
  );

  ethereumDisconnect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3GatewayActions.ethereumDisconnect),
      map(() => {

        /*
         window.ethereum.disable() for logging out of provider
         This future is not implemented yet. See discussion here:
         https://ethereum-magicians.org/t/window-ethereum-disable-for-logging-out-of-provider/3630
         https://ethereum-magicians.org/t/eip-1102-opt-in-provider-access/414/59
        */
        return ErrorActions.errorMessage({ errorMsg: `This feature is in a suggested proposal yet.` });

      })
    )
  );


  connectRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(Web3GatewayActions.ethereumConnectRedirect),
        tap(_ => {
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  showSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3GatewayActions.ethereumConnect),
      map(() => SpinnerActions.show())
    )
  );

  hideSpinner$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3GatewayActions.ethereumConnectSuccess),
      map(() => SpinnerActions.hide())
    )
  );

  getAccountInfo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3GatewayActions.ethereumConnectSuccess),
      switchMap(() => {
        return [Web3GatewayActions.getNetwork(), Web3GatewayActions.getAccount(), Web3GatewayActions.getBalance()];

      })
    )
  );

  getAddress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3GatewayActions.getAccount),
      switchMap(() =>
        this.web3ProviderSrv.getSelectedAddress().pipe(
          map((address: string) => Web3GatewayActions.accountSuccess({ address })),
          catchError((err: Error) => of(this.handleError(err)))
        )
      )
    )
  );

  getBalance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3GatewayActions.getBalance),
      switchMap(() =>
        this.web3ProviderSrv.getBalance().pipe(
          map((balance: string) =>
            Web3GatewayActions.balanceSuccess({ balance })
          ),
          catchError((err: Error) => of(this.handleError(err)))
        )
      )
    )
  );

  getNetwork$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Web3GatewayActions.getNetwork),
      switchMap(() =>
        this.web3ProviderSrv.getNetwork().pipe(
          map((network: string) =>
            Web3GatewayActions.networkSuccess({ network })
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
  // Note that this event is emitted on:
  // - page load
  // - when log out from MetaMask
  // - when we switch account or network in MetaMask

  // ** If the array of accounts is non-empty, you're already connected.

  accountWatcher$ = !!this.ethProvider ? fromEvent(this.ethProvider, 'accountsChanged').pipe(
    withLatestFrom(this.store$.pipe(select(fromStore.getAccount))),

    // we only want to refresh the browser when:
    // - we logout from MetaMask (accounts.length == 0)
    // - when we switch account to different account (!!currentAccount && currentAccount !== accounts[0])
    filter(([accounts, currentAccount]) => {

      if ((accounts as any).length === 0)
        return true;

      /*
     I notice that using ethers.js it returns account in the hex string like this
      0xd64d1cc32225bd5815cfa7a0b8a6aa46e0ef1285
      but from the event 'accountsChanged' it return the same account hex string like this:
      0xd64D1cc32225bD5815cFA7A0B8a6aa46e0eF1285
      !Notice the capital letters. So we should take care of this situation
    */

      const curAdd = currentAccount ? utils.getAddress(currentAccount) : currentAccount;
      const newAdd = accounts[0] ? utils.getAddress(accounts[0]) : accounts[0];

      if (!!curAdd && (curAdd !== newAdd)) {
        return true;
      }

      return false;
    }),
    map(([accounts, currentAccount]) => {
      // we need to reload browser
      // based onhttps://medium.com/metamask/no-longer-reloading-pages-on-network-change-fbf041942b44
      this.document.location.reload();
    })
  ) : of(1);

  accountChanged$ = createEffect(
    () => this.accountWatcher$,
    { dispatch: false }
  );


  private handleError(error: Error) {
    const friendlyErrorMessage = serializeError(error).message;
    return ErrorActions.errorMessage({ errorMsg: friendlyErrorMessage });
  }


}
