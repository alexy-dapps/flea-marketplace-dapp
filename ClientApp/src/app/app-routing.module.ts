import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './core/components/dashboard/dashboard.component';
import { NotFoundPageComponent } from './core/containers/not-found-page.component';

import * as guards from './core/guards';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'market-place',
    // here we use the TypeScript Dynamic Imports in Angular 8
    loadChildren: () => import('./market-place/market-place.module').then(mod => mod.MarketPlaceModule),
    canLoad: [guards.MetaMaskConnectGuard, guards.IpfsConnectGuard],
  },
  { path: '**', component: NotFoundPageComponent }, // !!!has to be the last one

];

// to be able to reload on the same route
// based on https://github.com/angular/angular/issues/13831
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true,  onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

