import { dev_prod } from './../../../../../_helpers/constents';
import { take } from 'rxjs/operators';
import { AppDataShareService } from './../../../../../_services/app-data-share.service';
import { Component, isDevMode, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-my-vue',
  templateUrl: './my-vue.component.html',
  styleUrls: ['./my-vue.component.scss']
})
export class MyVueComponent implements OnInit, OnDestroy {

  constructor(
    private appDataShareService:AppDataShareService,
    private Ref:ChangeDetectorRef
    ) { }

  typography_backgorund_url:string;
  appContainerHeight:string;
  myVueEmpty:boolean;
  myVueArrayLength = 0;

  navCreatedVuesState = false;
  navCreateVueState = false;

  isVueConstructed = false;
  createVueStatusMessage:string;

  navStateChange(state:string){
    if (state=== 'createdvues'){
      this.navCreatedVuesState = true;
      this.navCreateVueState = false;
    }
    else if (state === 'createvue'){
      this.navCreateVueState = true;
      this.navCreatedVuesState = false;
    }
  }

  createVueStatus(status:string){
    this.createVueStatusMessage = status;
  }

  vueConstructed(){
    this.isVueConstructed = true;
    this.appDataShareService.isVueConstructed.next(true);
  }

  ngOnInit(): void {
    isDevMode() ? this.typography_backgorund_url="url('assets/svg/topography.svg')" : this.typography_backgorund_url="url("+dev_prod.staticUrl_prod+'assets/svg/topography.svg'+")";
    this.navStateChange('createdvues');
  }

  backToMyvue(){
    if (this.isVueConstructed){
      this.appDataShareService.alertInput.next('Do you want to navigate back. You current Vue will be lost!');
      this.appDataShareService.alertResponse().pipe(take(1))
      .subscribe((response:boolean) =>{
        if (response){
          this.navStateChange('createdvues');
          this.isVueConstructed = false;
          this.appDataShareService.isVueConstructed.next(false);
        }
      });
    }
    else{
      this.navStateChange('createdvues');
    }

  }

  vueSubmited(){
    this.navStateChange('createdvues');
    this.isVueConstructed = false;
    this.appDataShareService.isVueConstructed.next(false);
  }

  VueEmptyEvent(value){
    this.myVueEmpty = value;
    this.myVueEmpty === false ? this.myVueArrayLength = this.appDataShareService.myVueArray.length : this.myVueArrayLength = 0;
    this.Ref.detectChanges();
  }

  ngOnDestroy(){
    this.appDataShareService.isVueConstructed.next(false);
    console.log("destroyed");
  }

}
