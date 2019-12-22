import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MaterialModule, FlexLayoutModule, AngularCdkModule } from '../shared';

import { NavComponent } from './components/nav/nav.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoaderComponent} from './components/loader/loader.component';
import { SnackBarComponent } from './components/snackbar/snack-bar.component';
import { NotFoundPageComponent } from './containers/not-found-page.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

export const COMPONENTS = [
  NavComponent,
  NotFoundPageComponent,
  DashboardComponent,
  LoaderComponent,
  SnackBarComponent,
  ConfirmDialogComponent

];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FlexLayoutModule,
    AngularCdkModule,
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
    ConfirmDialogComponent
  ],
})
export class CoreModule { }
