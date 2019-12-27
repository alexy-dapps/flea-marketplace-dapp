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
    canActivate: [guards.EthInitGuard],
  },
  { path: '**', component: NotFoundPageComponent }, // !!!has to be the last one

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

