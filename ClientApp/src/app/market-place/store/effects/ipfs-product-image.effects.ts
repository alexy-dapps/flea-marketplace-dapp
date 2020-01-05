
import { Injectable } from '@angular/core';
import { exhaustMap, map, tap, switchMap, catchError } from 'rxjs/operators';
import { of, empty} from 'rxjs';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';

import { IpfsDaemonService } from '../../../core/services/ipfs-daemon.services';
import { HttpClient } from '@angular/common/http';

import * as fromPurchaseContract from '../reducers';
import { IpfsImageActions } from '../actions';
import { ErrorActions } from '../../../core/store/actions';



@Injectable()
export class IpfsUploadEffects {
  constructor(
    private store$: Store<fromPurchaseContract.AppState>,
    private ipfsSrv: IpfsDaemonService,
    private readonly actions$: Actions,
    private httpClient: HttpClient,
  ) {}


  uploadImage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IpfsImageActions.uploadImage),
        map(action => action.file),
        exhaustMap((file) => {
          // const fileStream =  (window as any).IpfsHttpClient.Buffer as Buffer;

          return this.ipfsSrv.addFile(file).pipe(
            tap(ipfsHash => console.log(`IPFS file hash: ${ipfsHash}`)),
            map(ipfsHash => IpfsImageActions.uploadImageSuccess({ipfsHash})),

            catchError((err: Error) =>
              of(ErrorActions.errorMessage({ errorMsg: err.message }), IpfsImageActions.uploadImageFail())
            )
          );
        })

      ));

      downloadImage$ = createEffect(
        () =>
          this.actions$.pipe(
            ofType(IpfsImageActions.downloadImage),
            map((action) => action.ipfsHash),
            switchMap((ipfsHash: string) =>
              this.ipfsSrv.getFile(ipfsHash).pipe(
                map((image: Blob) => IpfsImageActions.downloadImageSuccess({ image })),
                catchError((err: Error) =>
                  of(ErrorActions.errorMessage({ errorMsg: err.message }), IpfsImageActions.downloadImageError())
              )
             )
            )

          )
        );

        // display default error image
        downloadImageError$ = createEffect(
          () =>
            this.actions$.pipe(
              ofType(IpfsImageActions.downloadImageError),

              switchMap(() => this.httpClient.get(`./assets/img/error-human.png`, {
                responseType: 'blob'
              }).pipe(
                  map((image: Blob) => IpfsImageActions.downloadImageSuccess({ image })),
                  catchError((err: Error) =>
                    of(ErrorActions.errorMessage({ errorMsg: err.message }))
                )
               )
              )

            )
          );


}
