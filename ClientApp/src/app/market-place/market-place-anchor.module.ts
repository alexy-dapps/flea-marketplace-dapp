import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// follow the idea to avoid the Circular Dependencies warning
// https://medium.com/@tomastrajan/total-guide-to-angular-6-dependency-injection-providedin-vs-providers-85b7a347b59f

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class MarketPlaceAnchorModule { }
