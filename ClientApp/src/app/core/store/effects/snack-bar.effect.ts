import { Injectable } from '@angular/core';

import { Actions, ofType, createEffect } from '@ngrx/effects';
import { tap, map } from 'rxjs/operators';

import { SnackBarActions } from '../actions';
import { MatSnackBar } from '@angular/material';
import { SnackBarComponent } from '../../components/snackbar/snack-bar.component';


@Injectable()
export class SnackBarEffects {

    static readonly SNACKBAR_DELAY: number = 7000;

    constructor(private readonly actions$: Actions, private matSnackBar: MatSnackBar) {}

    openSnackbar$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(SnackBarActions.open),
          map(action => action.payload),
          tap(payload => this.matSnackBar.openFromComponent(SnackBarComponent, {
             data: payload,
             duration: SnackBarEffects.SNACKBAR_DELAY }))
        ),
        { dispatch: false }

    );
}
