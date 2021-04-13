import { LogoutComponent } from './components/logout/logout.component';
import { WaveAppComponent } from './components/wave-app/wave-app.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AccountComponent } from './components/account/account.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from './_services/auth-guard.service';
import { LoginGuardService } from './_services/login-guard.service';


const routes: Routes = [
  {
    path:"",
    component: HomeComponent
  },
  {
    path:"account",
    canActivate: [LoginGuardService],
    component: AccountComponent
  },
  {
    path:"app",
    canActivate: [AuthGuardService],
    component: WaveAppComponent
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
