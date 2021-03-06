import { NgModule } from '@angular/core';

import { SharedModule } from './../shared/shared.module';
import { AccountRoutingModule } from './account-routing.module';

import { AccountComponent } from './account.component';


@NgModule({
  imports: [
    SharedModule,
    AccountRoutingModule
  ],
  declarations: [
    AccountComponent
  ]
})

export class AccountModule {}
