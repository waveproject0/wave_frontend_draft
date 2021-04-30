import { LOCATION_JSON, dev_prod } from './../../_helpers/constents';
import { take } from 'rxjs/operators';
import {
  RESEND_ACTIVATION_EMAIL,
  PASSWORD_RESET_EMAIL,
  EMAIL_CHECK,
  USERNAME_CHECK,
  USER_REGISTRATION_WITHOUT_PROFILE_PICTURE,
  USER_REGISTRATION_WITH_PROFILE_PICTURE
} from './../../_helpers/graphql.query';
import { GraphqlService } from './../../_services/graphql.service';
import { AuthenticationService } from './../../_services/authentication.service';
import { LocationService } from './../../_services/location.service';
import { Component, isDevMode, OnInit, OnDestroy} from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {
  constructor(
    private authenticationService: AuthenticationService,
    private graphqlService: GraphqlService,
    private locationService: LocationService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    ) { }

  message_send_url:string;
  currentPath = {};
  routerUnsub: Subscription;
  accountTab:number;
  email:string = null;
  profileImage:File;
  locationData:LOCATION_JSON;
  accessGPSPermisson:boolean;
  accessGPSClicked = false;

  loginLoadStatus = false;

  loadSpinner = {
    username : undefined,
    email : undefined,
    location : false
  }

  startDate = new Date(1995, 0, 1);
  dob = new Date();

  loginForm: FormGroup;
  loginFormError = false;
  loginFormErrorCode:string;
  loginFormErrorMessage:string;

  signupForm: FormGroup;
  signupFormSuccess = false;

  emailActivationForm: FormGroup;
  emailActivationSuccess = false;
  emailActivationError = false;
  emailActivationErrorMessage:string;

  passwordResetForm: FormGroup;
  passwordResetSuccess = false;
  passwordResetError = false;
  passwordResetErrorMessage:string;

  accountTabChange(tabChange){
    if(tabChange === 1){
      if(!this.locationData){
        this.getLocation();
      }
    }
  }


  FormChange(){
    this.loginFormError = false;
    this.emailActivationError = false;
    this.emailActivationSuccess = false;
    this.passwordResetSuccess = false;
    this.passwordResetError = false;
    this.signupForm.get('loginDetails.username').value == "" ? this.loadSpinner.username = undefined : null;
    this.signupForm.get('loginDetails.email').value == "" ? this.loadSpinner.email = undefined : null;
  }

  profileImg(file){
    this.profileImage = file;
  }

  onLoginFormSubmit(){
    this.loginLoadStatus = true;
    const formValue = this.loginForm.value;
    const emailOrUsernameMatch = formValue.emailOrUsername.match(/@/g);
    const validation = emailOrUsernameMatch ? emailOrUsernameMatch : '';

    if (validation.length > 0){
      this.email = formValue.emailOrUsername;
      this.authenticationService.login(formValue.emailOrUsername, formValue.password, false, formValue.trustedDevice);
    }

    else{
      this.authenticationService.login(formValue.emailOrUsername, formValue.password, true, formValue.trustedDevice);
    }

    this.authenticationService.getLoginFormResult().pipe(take(1))
    .subscribe(result =>{
      this.loginFormError = result;

      if (this.loginFormError){
        this.loginLoadStatus = false;
        this.authenticationService.getLoginFormErrorCode().pipe(take(1))
        .subscribe(result =>{
          if (result === 'invalid_credentials'){
            this.loginFormErrorCode = result;
            this.loginFormErrorMessage = '<strong>Invalid</strong> credentials.';
          }
          if (result === 'not_verified'){
            this.loginFormErrorCode = result;
            this.loginFormErrorMessage = 'Service is <strong>Unavailable</strong>';
          }
        });

      }
      else{

        if (this.currentPath['queryParams'].next){
          this.router.navigate([this.currentPath['queryParams'].next]);
        }
        else{
          this.router.navigate(['/app']);
        }

      }

    });

  }

  onSignupFormSubmit(){
    const signupFromValue = this.signupForm.value;
    if (signupFromValue.personalDetails.location === "" || signupFromValue.personalDetails.location === null){
      this.locationData.postal_code = null;
    }
    else{
      this.locationData.postal_code = signupFromValue.personalDetails.location;
    }

    const mutationArrgs = {
      "username":signupFromValue.loginDetails.username,
      "email":signupFromValue.loginDetails.email,
      "password1":signupFromValue.loginDetails.password,
      "password2":signupFromValue.loginDetails.confirmPassword,
      "fullName":signupFromValue.personalDetails.fullname,
      "sex":signupFromValue.personalDetails.sex,
      "dob":signupFromValue.personalDetails.dob.toLocaleDateString(),
      "location_json":'"'+JSON.stringify(this.locationData).replace(/"/g, "\\\"")+'"',
    }

    var USER_REGISTRATION;

    if (this.profileImage){
      USER_REGISTRATION = USER_REGISTRATION_WITH_PROFILE_PICTURE;
      mutationArrgs["profilePic"] = this.profileImage;
    }
    else{
      USER_REGISTRATION = USER_REGISTRATION_WITHOUT_PROFILE_PICTURE;
    }

    this.graphqlService.graphqlMutation(USER_REGISTRATION, mutationArrgs).pipe(take(1))
      .subscribe((result:any) => {
        if(result.data.userRegistration.user === "USER_REGISTRATION_SUCCESS"){
          this.router.navigate(['/account'],{fragment:'registrationSuccessful'});
        }
        else{
          this.snackBar.open("something went Wrong!", "Try Again",{duration:2000});
        }
    });

  }

  onEmailActivationFormSubmit(){
    const email = this.emailActivationForm.value.email;
    const mutationArrgs = {
      "email": email
    }

    this.graphqlService.graphqlMutation(RESEND_ACTIVATION_EMAIL, mutationArrgs).pipe(take(1))
    .subscribe((result:any) => {
      if(result.data.resendActivationEmail.errors){
        this.emailActivationError = true;
        if (result.data.resendActivationEmail.errors.email[0].code === 'already_verified'){
          this.emailActivationErrorMessage = 'Email is already <strong>Verified.</strong>';
        }
        else if (result.data.resendActivationEmail.errors.email[0].code === 'email_fail'){
          this.emailActivationErrorMessage = 'Failed to send <strong>email.</strong>';
        }
        else if (result.data.resendActivationEmail.errors.email[0].code === 'invalid'){
          this.emailActivationErrorMessage = 'Enter a <strong>valid</strong> email address.';
        }
      }
      else if(result.data.resendActivationEmail.success){
        this.emailActivationSuccess = result.data.resendActivationEmail.success;
      }
    });
  }

  onPasswordRestFormSubmit(){
    const email = this.passwordResetForm.value.email;
    const mutationArrgs = {
      "email": email
    }

    this.graphqlService.graphqlMutation(PASSWORD_RESET_EMAIL, mutationArrgs).pipe(take(1))
    .subscribe((result:any) => {
      if(result.data.sendPasswordResetEmail.errors){
        this.passwordResetError = true;
        if (result.data.sendPasswordResetEmail.errors.email[0].code === 'email_fail'){
          this.passwordResetErrorMessage = 'Failed to send <strong>email</strong>';
        }
        else if (result.data.sendPasswordResetEmail.errors.email[0].code === 'not_verified'){
          this.passwordResetErrorMessage = '<strong>Your email is not verified.</strong> A new verification email is send.';
        }
        else if (result.data.sendPasswordResetEmail.errors.email[0].code === 'invalid'){
          this.passwordResetErrorMessage = 'Enter a <strong>valid</strong> email address.';
        }
      }
      else if(result.data.sendPasswordResetEmail.success){
        this.passwordResetSuccess = result.data.sendPasswordResetEmail.success;
      }
    });
  }

  backToLogin(){
    this.router.navigate(['/account']);
  };


  getLocation(){
    this.loadSpinner.location = true;
    (async () => {
      const result = await this.locationService.getLocation();
      if (result){
        this.signupForm.get('personalDetails.location').enable();
        this.locationData = this.locationService.location;
        this.locationData.postal_code != null ? this.signupForm.get('personalDetails.location').setValue(this.locationData.postal_code) : null;
        this.loadSpinner.location = false;
      }
      else{
        this.loadSpinner.location = null;
        this.signupForm.get('personalDetails.location').disable();
      }
    })();
  }

  getGPSLocation(){
    this.loadSpinner.location = true;
    this.accessGPSClicked = true;
    (async () =>{
      const result = await this.locationService.getLocation(true);
      if (result){
        this.signupForm.get('personalDetails.location').enable();
        localStorage.setItem('LOCATION_ACCESSED', 'true');
        this.locationData = this.locationService.location;
        this.locationData.postal_code != null ? this.signupForm.get('personalDetails.location').setValue(this.locationData.postal_code) : null;
        this.accessGPSPermisson = false;
        this.loadSpinner.location = false;
      }
      else{
        this.loadSpinner.location = null;
        this.signupForm.get('personalDetails.location').disable();
      }
    })();
  }

  retryToGetLocation(){
    this.accessGPSClicked ? this.getGPSLocation() : this.getLocation();
  }

  pathToForm(currentPath){
    if (currentPath['fragment'] != 'emailActivation' && currentPath['fragment'] != 'passwordReset' && currentPath['fragment'] != 'registrationSuccessful'){

      this.loginForm = new FormGroup({
        'emailOrUsername': new FormControl(null, Validators.required),
        'password': new FormControl(null, Validators.required),
        'trustedDevice': new FormControl(false, Validators.required),
      });

      this.signupForm = new FormGroup({

        'personalDetails': new FormGroup({
          'fullname': new FormControl(null, [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z ]*$')]),
          'dob': new FormControl(null, Validators.required),
          'sex': new FormControl(null, Validators.required),
          'location': new FormControl({value:null, disabled:true}, Validators.pattern("^[0-9]*$")),
        }),
        'loginDetails': new FormGroup({

          'username': new FormControl(null, [Validators.required, Validators.pattern('^[_A-z0-9]*((-|)*[_A-z0-9])*$')],
          this.usernameCheckAsync.bind(this)),

          'email': new FormControl(null, Validators.required,
            this.emailCheckAsync.bind(this)),

          'password': new FormControl(null, [Validators.required, Validators.pattern('^(?=.*[\\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[.?!^@#$%&*])[\\w\\d.?!@^#$%&*]{8,}$')]),
          'confirmPassword': new FormControl(null, Validators.required),
        }, {validators: this.passwordMatchValidator}),

      });

      this.accountTab = 0;
      this.email = null;
      this.signupFormSuccess = false;

      if (currentPath['fragment'] === 'signup'){
        this.accountTab = 1;
        if(!this.locationData){
          this.getLocation();
        }
      }

    }

    else if (currentPath['fragment'] === 'emailActivation'){

      this.emailActivationForm = new FormGroup({
        'email': new FormControl(this.email, [Validators.email, Validators.required])
      });
      this.emailActivationError = false;
      this.emailActivationSuccess = false;

    }

    else if (currentPath['fragment'] === 'passwordReset'){
      this.passwordResetForm = new FormGroup({
        'email': new FormControl(this.email, [Validators.email, Validators.required])
      });
      this.passwordResetSuccess = false;
      this.passwordResetError = false;

    }

    else if (currentPath['fragment'] === 'registrationSuccessful'){
      this.signupFormSuccess = true;
    }

  }

  usernameCheckAsync(control: FormControl): Promise<any> | Observable<any>{
    const promise = new Promise<any>((resolve) => {
      const mutationArrgs = {
        'username': control.value
      }

      this.loadSpinner.username  = true;
      this.graphqlService.graphqlMutation(USERNAME_CHECK, mutationArrgs).pipe(take(1))
      .subscribe((result:any) => {

        if (result.data.emailUsernameCheck.username === 'USERNAME_ALREADY_EXISTS'){
          this.loadSpinner.username = null;
          resolve({'usernameCheck': true});
        }
        else{
          this.loadSpinner.username = false;
          resolve(null);
        }
      });
    });
    return promise;
  }

  emailCheckAsync(control: FormControl): Promise<any> | Observable<any>{
    const promise = new Promise<any>((resolve) => {
      const mutationArrgs = {
        'email': control.value
      }

      this.loadSpinner.email  = true;
      this.graphqlService.graphqlMutation(EMAIL_CHECK, mutationArrgs).pipe(take(1))
      .subscribe((result:any) => {
        if (result.data.emailUsernameCheck.email === 'EMAIL_INCORRECT_FORMAT'){
          this.loadSpinner.email = null;
          resolve({'emailFormatCheck': true});
        }
        else if (result.data.emailUsernameCheck.email === 'EMAIL_ALREADY_EXISTS'){
          this.loadSpinner.email = null;
          resolve({'emailCheck': true});
        }
        else{
          this.loadSpinner.email = false;
          resolve(null);
        }
      });
    });
    return promise;
  }

  passwordMatchValidator(control: AbstractControl): {[key:string]: boolean} | null{
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password.pristine || confirmPassword.pristine){
      return null
    }

    return password && confirmPassword && password.value != confirmPassword.value ? {'misMatch': true} : null;
  }



  ngOnInit(): void {
    isDevMode() ? this.message_send_url = 'assets/svg/message_send.svg' : this.message_send_url = dev_prod.staticUrl_prod + 'assets/svg/message_send.svg';

    this.currentPath['fragment'] = this.route.snapshot.fragment ? this.route.snapshot.fragment : null;
    this.currentPath['queryParams'] = this.route.snapshot.queryParams ? this.route.snapshot.queryParams : null;

    this.pathToForm(this.currentPath);

    let firstRouteSub = false;
    this.routerUnsub = this.route.fragment
      .subscribe((fragment:any) => {
        if (firstRouteSub){
          this.currentPath['fragment'] = fragment;
          this.pathToForm(this.currentPath);
        }
        firstRouteSub = true;
      });

    localStorage.getItem('LOCATION_ACCESSED') ? null : this.accessGPSPermisson = true;

  }

  ngOnDestroy(){
    this.routerUnsub.unsubscribe();
  }

}
