import { LocationService } from './_services/location.service';
import { dev_prod, state_language } from './_helpers/constents';
import { NavigationStart, Router, UrlTree } from '@angular/router';
import { AuthenticationService } from './_services/authentication.service';
import { GraphqlService } from './_services/graphql.service';
import { ResponsiveService } from './_services/responsive.service';
import { Component, isDevMode, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';
import { ConnectionService } from 'ng-connection-service';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private graphqlService: GraphqlService,
    private authenticationService: AuthenticationService,
    private locationService: LocationService,
    private responsiveService: ResponsiveService,
    private snackBar: MatSnackBar,
    private connectionService:ConnectionService,
    private router: Router
    ){}

  wave_long_logo_url:string;
  isLogin = false;
  isLoginUnsub: Subscription;
  internetMonitorUnsub: Subscription;
  currentUrlTree:UrlTree;
  currentPath:string;
  routerUnsub: Subscription;
  indiaName = "India";

  onLogout(){
    this.authenticationService.logout();
  }

  onResize(){
    this.responsiveService.checkWidth();
  }

  ngOnInit(){
    isDevMode() ? this.wave_long_logo_url='assets/svg/long-logo.svg' : this.wave_long_logo_url=dev_prod.staticUrl_prod + 'assets/svg/long-logo.svg';

    this.routerUnsub = this.router.events.pipe(filter(event => event instanceof NavigationStart))
    .subscribe((routerEvent:NavigationStart) =>{
      this.currentUrlTree = this.router.parseUrl(routerEvent.url);
      try {
        this.currentPath = this.currentUrlTree.root.children.primary.segments[0].path;
      }
      catch{
        this.currentPath = "";
      }
    });

    this.isLoginUnsub = this.graphqlService.getLoginStatus()
    .subscribe(status =>{
      this.isLogin = status;
    });

    this.internetMonitorUnsub = this.connectionService.monitor()
    .subscribe(status =>{
      this.graphqlService.onInternetStatusChange(status);
      if (status){
        this.snackBar.open('Back Online',':)', {duration:2000});
        if (this.graphqlService.tokenRefreshFailed){
          this.graphqlService.getNewToken();
        }
      }
      else{
        this.snackBar.open('You are Offline',':(');
      }
    });

    this.locationService.getLocationFromIP()
    .toPromise().then((data:any) =>{
      if (data.region_code){
        state_language[data.region_code] ? this.indiaName = state_language[data.region_code] : null;
      }
    })
  }

  ngOnDestroy(){
    this.isLoginUnsub.unsubscribe();
    this.internetMonitorUnsub.unsubscribe();
    this.routerUnsub.unsubscribe();
  }

}
