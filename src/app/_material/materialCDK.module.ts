import { NgModule } from '@angular/core';
import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {TextFieldModule} from '@angular/cdk/text-field';

const CdkComponents = [
    A11yModule,
    OverlayModule,
    TextFieldModule,
]


@NgModule({
    imports: [CdkComponents],
    exports: [CdkComponents]
  })
  export class CdkModule { }