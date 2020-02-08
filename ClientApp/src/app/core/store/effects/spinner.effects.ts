import { Injectable } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { tap, map } from 'rxjs/operators';
import * as fromStore from '../reducers';
import { Store, select } from '@ngrx/store';
import { SpinnerOverlayService } from '../../services/spinner-overlay.service';


@Injectable()
export class SpinnerEffects {

    constructor(
      private store$: Store<fromStore.AppState>,
      private spinner: SpinnerOverlayService) {}

    handleSpinner$ = createEffect(
      () =>
        this.store$.pipe(
          select(fromStore.getSpinnerShow),
          tap( isShow =>
            isShow ? this.spinner.show() : this.spinner.hide()
        )),
        { dispatch: false }

    );
}
