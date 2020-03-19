
import { NgModule, Optional, SkipSelf, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// NgRx
import * as fromRootStore from './store';
import { ROOT_REDUCERS, metaReducers } from './store/reducers';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule, RouterState } from '@ngrx/router-store';

import { AppErrorHandler } from './services/app-error-handler.service';
import { MaterialModule, FlexLayoutModule, AngularCdkModule } from '../shared';

import { MatSpinner } from '@angular/material/progress-spinner';
import { NavComponent } from './components/nav/nav.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { LoaderComponent } from './components/loader/loader.component';
import { SnackBarComponent } from './components/snackbar/snack-bar.component';
import { NotFoundPageComponent } from './containers/not-found-page.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { HttpErrorInterceptor } from './services/http-error.interceptor';

export const COMPONENTS = [
  NavComponent,
  NotFoundPageComponent,
  DashboardComponent,
  // LoaderComponent, - we don't use it
  SnackBarComponent,
  ConfirmDialogComponent

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    FlexLayoutModule,
    AngularCdkModule,


    /**
     * StoreModule.forRoot is imported once in the root module, accepting a reducer
     * function or object map of reducer functions. If passed an object of
     * reducers
     * In the V9, two of these runtime checks, strictStateImmutability, and strictActionImmutability
     *  are now enabled by default in development,
     * so developers can be assured that their state following immutable practices out of the box.
     */
    StoreModule.forRoot(ROOT_REDUCERS, {
      metaReducers,
    }),

    // @ngrx/router-store keeps router state up-to-date in the store.
    StoreRouterConnectingModule.forRoot({
      stateKey: 'router',
      routerState: RouterState.Minimal,
    }),

    /**
     * Store devtools instrument the store retaining past versions of state
     * and recalculating new states. This enables powerful time-travel
     * debugging.
     *
     * To use the debugger, install the Redux Devtools extension for either
     * Chrome or Firefox
     *
     * See: https://github.com/zalmoxisus/redux-devtools-extension
     */
    // Instrumentation must be imported after importing StoreModule (config is optional)
    StoreDevtoolsModule.instrument({
      name: 'FleaMarket DApp Store State',
      // In a production build you would want to disable the Store Devtools
      // logOnly: environment.production,
    }),

    /**
     * EffectsModule.forRoot() is imported once in the root module and
     * sets up the effects class to be initialized immediately when the
     * application starts.
     *
     * See: https://ngrx.io/guide/effects#registering-root-effects
     */
    EffectsModule.forRoot(fromRootStore.effects),

  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,

  /**
   * An entry component is any component that Angular loads imperatively,
   *  (which means you’re not referencing it in the template)
   * In out case these components will be use in the effects, so they are have to be declared
   * as entry components
   */
  entryComponents: [
    SnackBarComponent,
    ConfirmDialogComponent,
    MatSpinner
  ],
  providers: [
    // register the GlobalErrorHandler provider
    { provide: ErrorHandler, useClass: AppErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
  ],
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {

    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }

  }

}
