import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule, FlexLayoutModule } from '../shared';
import { MarketPlaceAnchorModule } from './market-place-anchor.module';
import { MarketPlaceRoutingModule } from './market-place-routing.module';

import * as fromComponents from './components';

export const COMPONENTS = [
  fromComponents.MarketPlaceHomeComponent,

];

@NgModule({
  declarations: [COMPONENTS],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule ,
    ReactiveFormsModule,
    MarketPlaceAnchorModule,
    MarketPlaceRoutingModule
  ]
})
export class MarketPlaceModule { }
