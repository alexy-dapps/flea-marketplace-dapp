

import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { take, tap, filter, switchMap, catchError } from 'rxjs/operators';
import { MarketPlaceAnchorModule } from '../market-place-anchor.module';
import * as fromStore from '../store/reducers';
import { PurchaseContractActions } from '../store/actions';


@Injectable({
  providedIn: MarketPlaceAnchorModule
})
export class ProductsLoadedGuard implements CanActivate {
  constructor(private store: Store<fromStore.AppState>) { }

  canActivate(): Observable<boolean> {
    return this.waitForProductsToLoad().pipe(

      switchMap(() => of(true)),
      catchError(() => of(false))
    );
  }


  waitForProductsToLoad(): Observable<boolean> {
    return this.store.pipe(
      select(fromStore.isProductsLoaded),
      tap(loaded => {
        if (!loaded) {
          this.store.dispatch(PurchaseContractActions.loadProducts());

        }
      }),
      // Notice that the filter() returns the observable sequence that contains elements
      // from the input sequence that satisfy the condition.
      // so in this case, if the loaded is false, the steam will not continue, but
      // when the loaded is true, we grab this bool value. Which means we are waiting for the
      // loaded value has become true and then we continue the stream and take this one value .
      // after that the whole stream will be completed.
      filter(loaded => loaded),
      take(1)
    );
  }

}
