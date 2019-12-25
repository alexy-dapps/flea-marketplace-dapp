import { Injectable } from '@angular/core';

import { Actions, ofType, createEffect } from '@ngrx/effects';
import { tap, map } from 'rxjs/operators';

import { ErrorActions, SnackBarActions } from '../actions';
import { AppearanceColor, SnackBarInterface } from '../../models';



@Injectable()
export class ErrorEffects {

    constructor(private readonly actions$: Actions) {
    }

    handleError$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(ErrorActions.errorMessage),
          map(action => action.errorMsg),
          tap(errorMsg => console.error('Got error:', errorMsg)),
          map(errorMsg => {

            const msg: SnackBarInterface = {
              message: errorMsg,
              color: AppearanceColor.Error
          };

            return SnackBarActions.open({payload: msg});
          } )
        )

    );

}
