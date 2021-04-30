import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuardService } from './_services/auth-guard.service';
import { LoginGuardService } from './_services/login-guard.service';

import { LogoutComponent } from './components/logout/logout.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';

const routes: Routes = [
  {
    path:"",
    loadChildren: () => import('./components/home/home.module').then(m => m.HomeModule)
    //component: HomeComponent
  },
  {
    path:"account",
    canActivate: [LoginGuardService],
    loadChildren: () => import('./components/account/account.module').then(m => m.AccountModule)
    //component: AccountComponent
  },
  {
    path:"app",
    canActivate: [AuthGuardService],
    loadChildren: () => import('./components/wave-app/wave-app.module').then(m => m.WaveAppModule)
    //component: WaveAppComponent
  },
  {
    path:"logout",
    component: LogoutComponent
  },
  {
    path:"**",
    component:PageNotFoundComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
