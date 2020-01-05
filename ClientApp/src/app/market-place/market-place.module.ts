import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule, FlexLayoutModule } from '../shared';
import { MarketPlaceRoutingModule } from './market-place-routing.module';


import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from './store/reducers';
import { IpfsUploadEffects } from './store/effects/ipfs-product-image.effects';
import { PurchaseContractEffects } from './store/effects/purchase-contract.effects';

import * as fromContainers from './containers';
import * as fromComponents from './components';

import { MarketPlaceAnchorModule } from './market-place-anchor.module';


export const CONTAINERS = [
    fromContainers.NewPurchaseContractComponent,
    fromContainers.ViewProductCollectionComponent,
    fromContainers.ViewPurchaseContractComponent

  ];

export const COMPONENTS = [
    fromComponents.MarketPlaceHomeComponent,
    fromComponents.ShowIpfsImageComponent,
    fromComponents.PurchaseContractListComponent,
    fromComponents.ProductDetailHomeComponent,
    fromComponents.PurchaseContractDetailComponent
  ];


@NgModule({
  declarations: [COMPONENTS, CONTAINERS],


  /*based on https://alligator.io/angular/anatomy-angular-module/
     * This is for components that can�t be found by the Angular compiler during compilation time
     * because they are not referenced anywhere in component templates.

      Components that should go into entryComponents are not that common.
      A good example would be Angular Material dialogs, because they are created dynamically,
      and the Angular compiler would not know about them otherwise.
     * */
  entryComponents: [
    fromComponents.ShowIpfsImageComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule ,
    ReactiveFormsModule,
    MarketPlaceAnchorModule,
    MarketPlaceRoutingModule,

    StoreModule.forFeature('purchaseContract', reducers),
    EffectsModule.forFeature([IpfsUploadEffects, PurchaseContractEffects])
  ],
})
export class MarketPlaceModule { }
