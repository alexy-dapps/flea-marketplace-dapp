import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect, ROOT_EFFECTS_INIT } from '@ngrx/effects';
import { serializeError } from 'serialize-error';
import { of } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';

import { IpfsDaemonService } from '../../services/ipfs-daemon.services';
import { IpfsDaemonActions, ErrorActions } from '../actions';

@Injectable()
export class IpfsDaemonEffects {
  constructor(
    private ipfsSrv: IpfsDaemonService,
    private readonly actions$: Actions
  ) { }

  onConnect$ = createEffect(
    () =>
      this.actions$.pipe(
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

  private handleError(error: Error) {
    const friendlyErrorMessage = serializeError(error).message;
    return ErrorActions.errorMessage({ errorMsg: friendlyErrorMessage });
  }


}
