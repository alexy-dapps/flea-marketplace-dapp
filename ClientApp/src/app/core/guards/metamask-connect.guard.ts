

import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { take, tap, filter, switchMap, catchError } from 'rxjs/operators';
import * as fromRoot from '../store';


@Injectable({
  providedIn: 'root',
})
export class MetaMaskConnectGuard implements CanActivate {
  constructor(private store: Store<fromRoot.AppState>) {}

  canActivate(): Observable<boolean> {
    return this.store.pipe(
      select(fromRoot.getEthereumConnected),
       tap(connected => {
        if (!connected) {
          this.store.dispatch(fromRoot.Web3GatewayActions.ethereumConnectRedirect());
          return false;
        }
        return true;
      }),
      take(1)
    );
  }


}
