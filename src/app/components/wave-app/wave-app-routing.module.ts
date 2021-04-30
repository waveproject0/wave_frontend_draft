import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WaveAppComponent } from './wave-app.component';

const routes: Routes = [
  {
    path:"",
    component: WaveAppComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class WaveAppRoutingModule { }
