import { NgModule, APP_INITIALIZER } from '@angular/core';
//import { LocationStrategy, HashLocationStrategy} from '@angular/common';
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDividerModule} from '@angular/material/divider';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { WaveAppModule } from './components/wave-app/wave-app.module';
import { AccountModule } from './components/account/account.module';
import { HomeModule } from './components/home/home.module';

import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { HttpClientModule } from '@angular/common/http';

import { MinimaLight } from '@alyle/ui/themes/minima';
import {
  LyTheme2,
  LY_THEME,
  LY_THEME_NAME,
  StyleRenderer,
  LyHammerGestureConfig
} from '@alyle/ui';

import {appInitializer} from './_helpers/app.initializer';

import { GraphqlService } from './_services/graphql.service';
import { AuthenticationService } from './_services/authentication.service';
import { ResponsiveService } from './_services/responsive.service';
import { LocationService } from './_services/location.service';
import { AppDataShareService } from './_services/app-data-share.service';
import { UserDataService } from './_services/user-data.service';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { LogoutComponent } from './components/logout/logout.component';


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    LogoutComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ApolloModule,
    HttpClientModule,
    HttpLinkModule,
    HammerModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatDividerModule,
    MatSnackBarModule,
    HomeModule,
    AccountModule,
    WaveAppModule
  ],
  providers: [
    GraphqlService,
    AuthenticationService,
    ResponsiveService,
    LocationService,
    LyTheme2,
    StyleRenderer,
    AppDataShareService,
    UserDataService,
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [GraphqlService] },
    { provide: LY_THEME_NAME, useValue: 'minima-light' },
    { provide: LY_THEME, useClass: MinimaLight, multi: true },
    { provide: HAMMER_GESTURE_CONFIG, useClass: LyHammerGestureConfig },
    //{ provide: LocationStrategy, useClass: HashLocationStrategy }

  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
