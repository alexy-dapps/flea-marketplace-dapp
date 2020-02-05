
import { NgModule } from '@angular/core';
import { LayoutModule } from '@angular/cdk/layout';
import { OverlayModule } from '@angular/cdk/overlay';

const CDK_MODULES = [
    LayoutModule, OverlayModule
];

@NgModule({
    imports: CDK_MODULES,
    exports: CDK_MODULES,
    declarations: []

})
export class AngularCdkModule { }
