

import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { take, tap, filter, switchMap, catchError } from 'rxjs/operators';
import * as fromRoot from '../store';


@Injectable({
  providedIn: 'root',
})
export class IpfsConnectGuard implements CanLoad {
  constructor(private store: Store<fromRoot.AppState>) { }

  canLoad(): Observable<boolean> {
    return this.store.pipe(
      select(fromRoot.getIpfsConnectStatus),
      tap(connected => {
        if (!connected) {
          this.store.dispatch(fromRoot.ErrorActions.errorMessage({ errorMsg: `Unable to detect IPFS node.` }));
          this.store.dispatch(fromRoot.IpfsDaemonActions.ipfsConnectRedirect());
          return false;
        }
        return true;
      }),
      take(1)
    );
  }


}
