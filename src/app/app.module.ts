import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './_material/material.module';
import { CdkModule } from './_material/materialCDK.module';
import { LyuiModule } from './_material/lyui.module';

import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { HttpClientModule } from '@angular/common/http';

import { DragScrollModule } from 'ngx-drag-scroll';
import { NgxMasonryModule } from 'ngx-masonry';

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
import { AccountComponent } from './components/account/account.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileWidgetComponent } from './components/profile-widget/profile-widget.component';
import { ImageUploadWidgetComponent } from './components/image-upload-widget/image-upload-widget.component';
import { CropperImgDialogComponent } from './components/cropper-img-dialog/cropper-img-dialog.component';
import { InfoCardWidgetComponent } from './components/info-card-widget/info-card-widget.component';
import { WaveAppComponent } from './components/wave-app/wave-app.component';
import { SettingRightComponent } from './components/wave-app/wave-components/setting-right/setting-right.component';
import { SettingLeftComponent } from './components/wave-app/wave-components/setting-left/setting-left.component';
import { LogoutComponent } from './components/logout/logout.component';
import { InterestComponent } from './components/interest/interest.component';
import { InterestLeftComponent } from './components/wave-app/wave-components/interest-left/interest-left.component';
import { InterestRightComponent } from './components/wave-app/wave-components/interest-right/interest-right.component';
import { MyVueComponent } from './components/wave-app/wave-components/interest-right/my-vue/my-vue.component';
import { CreateVueComponent } from './components/wave-app/wave-components/interest-right/my-vue/create-vue/create-vue.component';
import { CreatedVuesComponent } from './components/wave-app/wave-components/interest-right/my-vue/created-vues/created-vues.component';
import { LoadingComponent } from './components/loading/loading.component';
import { VueComponent } from './components/vue/vue.component';
import { ProfileComponent } from './components/wave-app/wave-components/profile/profile.component';
import { AlertBoxComponent } from './components/alert-box/alert-box.component';


@NgModule({
  declarations: [
    AppComponent,
    AccountComponent,
    PageNotFoundComponent,
    HomeComponent,
    ProfileWidgetComponent,
    ImageUploadWidgetComponent,
    CropperImgDialogComponent,
    InfoCardWidgetComponent,
    WaveAppComponent,
    SettingRightComponent,
    SettingLeftComponent,
    LogoutComponent,
    InterestComponent,
    InterestLeftComponent,
    InterestRightComponent,
    MyVueComponent,
    CreateVueComponent,
    CreatedVuesComponent,
    LoadingComponent,
    VueComponent,
    ProfileComponent,
    AlertBoxComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ApolloModule,
    HttpClientModule,
    HttpLinkModule,
    MaterialModule,
    LyuiModule,
    HammerModule,
    CdkModule,
    DragScrollModule,
    NgxMasonryModule,
    BrowserAnimationsModule,
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
    { provide: HAMMER_GESTURE_CONFIG, useClass: LyHammerGestureConfig }
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
