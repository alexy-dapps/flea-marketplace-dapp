
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';

import * as fromRoot from '../../store/reducers';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-loader',
    styleUrls: ['./loader.component.css'],
    template: `<div fxLayout="row" fxLayoutAlign="center stretch">

                  <div class= "loader-overlay" >
                    <div *ngIf="(showLoading$ | async) === false; else spinner"> </div>
                    <ng-template #spinner>
                            <div fxLayout="row" fxLayoutAlign = "center center">
                                <mat-spinner color='warn'> </mat-spinner>
                             </div>
                     </ng-template>
                   </div>

               </div>`
})
export class LoaderComponent implements OnInit {

    showLoading$: Observable<boolean>;

    constructor(private store: Store<fromRoot.AppState>) { }

    ngOnInit() {

        this.showLoading$ = this.store.pipe(
            select(fromRoot.getSpinnerShow),
            // tap(show => console.log('Spinner show', show)),

        );
    }


}
