import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { serializeError } from 'serialize-error';
import { of } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { IpfsDaemonService } from '../../services/ipfs-daemon.services';
import { IpfsDaemonActions, ErrorActions } from '../actions';

@Injectable()
export class IpfsDaemonEffects {
  constructor(
    private ipfsSrv: IpfsDaemonService,
    private readonly actions$: Actions,
    private router: Router,
  ) { }

  onConnect$ = createEffect(
    () =>
      this.actions$.pipe(
        /*
  After all the root effects have been added, the root effect dispatches a ROOT_EFFECTS_INIT action.
  You can see this action as a lifecycle hook, which you can use in order to execute some code after
  all your root effects have been added.
  */
        ofType(ROOT_EFFECTS_INIT),
        switchMap(() =>
          this.ipfsSrv.getVersion().pipe(
            tap(version => console.log(`IPFS node version: ${version}`)),
            map(_ => IpfsDaemonActions.connectSuccess()),
            catchError((err: Error) => of(this.handleError(err)))
          )
        )
      )
  );

  connectRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IpfsDaemonActions.ipfsConnectRedirect),
        tap(_ => {
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  private handleError(error: Error) {
    const friendlyErrorMessage = serializeError(error).message;
    return ErrorActions.errorMessage({ errorMsg: friendlyErrorMessage });
  }


}
