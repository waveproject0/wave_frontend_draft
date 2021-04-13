import { AppDataShareService } from './app-data-share.service';
import { USER_LOCATION } from './../_helpers/graphql.query';
import { take } from 'rxjs/operators';
import { USER_OBJ, TRUSTED_DEVICE, LOCATION } from './../_helpers/constents';
import { GraphqlService } from './graphql.service';
import { UserDataService } from './user-data.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';

import {
  EMAIL_LOGIN_MUTATION,
  USERNAME_LOGIN_MUTATION,
  LOGOUT_MUTATION
} from '../_helpers/graphql.query';

import { Injectable } from '@angular/core';
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private graphqlService: GraphqlService,
    private userDataService:UserDataService,
    private appDataShareService:AppDataShareService,
    private router: Router,
    private snackBar: MatSnackBar,
    ) { }

  private loginFormErrorSubject = new Subject();

  public getLoginFormResult(): Observable<any> {
    return this.loginFormErrorSubject.asObservable();
  }

  private loginFormErrorCodeSubject = new Subject();

  public getLoginFormErrorCode(): Observable<any> {
    return this.loginFormErrorCodeSubject.asObservable();
  }

  public login(emailOrUsername:string, password:string, usernamePresent:boolean, trustedDevice:boolean){
    const mutationArrgs = {
      "password":password
    }
    let LOGIN_MUTATION_TYPE;

    if (usernamePresent){
      mutationArrgs['username'] = emailOrUsername;
      LOGIN_MUTATION_TYPE = USERNAME_LOGIN_MUTATION;
    }
    else{
      mutationArrgs['email'] = emailOrUsername;
      LOGIN_MUTATION_TYPE = EMAIL_LOGIN_MUTATION;
    }

    this.graphqlService.graphqlMutation(LOGIN_MUTATION_TYPE, mutationArrgs).pipe(take(1))
    .subscribe(
      (auth_result:any) => {
        if(!auth_result.data.tokenAuth.errors){

          if (trustedDevice === true){
            localStorage.setItem(TRUSTED_DEVICE, "true");
          }

          const tokenAuth:any = auth_result.data.tokenAuth;
          const user = tokenAuth.user;
          const token = tokenAuth.token;
          const refreshToken = tokenAuth.refreshToken;

          this.userDataService.setItem({
            accessToken:token,
            refreshToken:refreshToken
          });

          this.graphqlService.graphqlQuery({query:USER_LOCATION}).valueChanges.pipe(take(1))
          .subscribe(
            (location_result:any) =>{
              if (location_result.errors){
                this.loginFormErrorSubject.next(true);
                this.userDataService.removeItem();
                this.snackBar.open("something went Wrong!", "Try Again");
              }
              else{
                const locationData = location_result.data.userPostalCode.edges[0].node;
                const location:LOCATION = {
                  postal_code : locationData.code === 0 ? null : locationData.code,
                  region : locationData.region.name,
                  state_or_province : locationData.region.stateOrProvince.name,
                  country_code : locationData.region.stateOrProvince.country.code
                }
                const user_obj:USER_OBJ = {
                  uid: user.uid,
                  email: user.email,
                  username: user.username,
                  fullName: user.firstName,
                  sex: (user.sex).toLowerCase( ),
                  dob: user.dob,
                  profilePictureUrl: user.profilePictureUrl,
                  location: location
                }

                this.userDataService.setItem({
                  userObject:user_obj,
                  studentState:user.studentprofile.state
                });

                user.studentprofile.relatedstudentinterestkeywordSet.edges.forEach(element => {
                  this.appDataShareService.studentInterest.push({
                    id: element.node.interest.id,
                    name: element.node.interest.word,
                    selected: false,
                    saved: element.node.saved,
                    count: element.node.count,
                    average_percent: element.node.averagePercentage
                  });
                });

                (async () => {
                  const result = await this.graphqlService.getAllInterestCategory();
                  if (result){
                    this.graphqlService.onLoginChange(true);
                    this.graphqlService.initialTokenRefresh = false;
                    this.loginFormErrorSubject.next(false);
                    this.graphqlService.studentInterestSnapshot();
                  }
                  else{
                    this.loginFormErrorSubject.next(true);
                    this.userDataService.removeItem();
                  }
                })();
              }
            },
            error =>{
              this.loginFormErrorSubject.next(true);
              this.userDataService.removeItem();
              this.snackBar.open("something went Wrong!", "Try Again");
            }
          );
        }
        else{
          this.loginFormErrorSubject.next(true);
          this.loginFormErrorCodeSubject.next(auth_result.data.tokenAuth.errors.nonFieldErrors[0].code);
          this.userDataService.removeItem();
        }

      },
      error =>{
        this.loginFormErrorSubject.next(true);
        this.snackBar.open("something went Wrong!", "Try Again");
        this.userDataService.removeItem();
      }
    );
  }

  public logout(){
    const refresh_token_arrgs = {
      "refresh_token":this.userDataService.getItem({refreshToken:true}).refreshToken
    }
    this.graphqlService.graphqlMutation(LOGOUT_MUTATION, refresh_token_arrgs).pipe(take(1))
    .subscribe(
      (result:any) => {
      this.graphqlService.onLoginChange(false);
      this.graphqlService.stopRefreshTokenTimer();
      this.router.navigate(['/logout']);
      },
      error =>{
        this.snackBar.open("Failed to loggout", "Try Again");
      }
    );
  }

  public isAuthenticated(): Promise<boolean>{
    return new Promise<boolean>((resolve, reject) => {
      if (this.graphqlService.isLogin != undefined){
        resolve(this.graphqlService.isLogin);
      }
      else{
        if (this.graphqlService.initialTokenRefresh === true){
          this.graphqlService.getLoginStatus().pipe(take(1))
          .subscribe(result =>{
            resolve(result);
          });
        }
        else{
          resolve(false);
        }
      }
    });
  }

}
