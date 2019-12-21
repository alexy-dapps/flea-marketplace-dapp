

import { NgModule } from '@angular/core';

import { LayoutModule } from '@angular/cdk/layout';

const CDK_MODULES = [
    LayoutModule
];

@NgModule({
    imports: CDK_MODULES,
    exports: CDK_MODULES,
    declarations: []

})
export class AngularCdkModule { }
