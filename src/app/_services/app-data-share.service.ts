import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { INTEREST_KEYWORD, LINK_PREVIEW, PAGE_INFO, dev_prod } from './../_helpers/constents';
import { BehaviorSubject } from 'rxjs';
import { Injectable, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppDataShareService {

  constructor() {
    isDevMode() ? this.vue_background="url('assets/svg/topography.svg')" : this.vue_background="url("+dev_prod.staticUrl_prod+'assets/svg/topography.svg'+")";
  }

  initialSetup = new BehaviorSubject<boolean>(null);

  interestOption = new BehaviorSubject<string>(null);
  settingsOption = new BehaviorSubject<string>(null);

  studentInterest:INTEREST_KEYWORD[] = []

  currentSelectedInterestArray:INTEREST_KEYWORD[] = [];
  currentSelectedInterestSubject = new Subject<INTEREST_KEYWORD>();

  currentSelectedInterest(): Observable<INTEREST_KEYWORD> {
    return this.currentSelectedInterestSubject.asObservable();
  }

  alertInput = new Subject<boolean | string>();

  alertResponse(): Observable<boolean | string> {
    return this.alertInput.asObservable();
  }

  appContainerHeight:number;
  appContainerWidth:number;
  appRightContainerWidth:number;

  vue_background:string;

  locationEdited = false;

  myVueArray:LINK_PREVIEW[] = [];
  myVuePageInfo:PAGE_INFO;

  vueFeedArray:LINK_PREVIEW[] = [];
  vueFeedPageInfo:PAGE_INFO;

  vueHistoryArray:LINK_PREVIEW[] = [];
  vueHistoryPageInfo:PAGE_INFO;

  vueSaveArray:LINK_PREVIEW[] = [];
  vueSavePageInfo:PAGE_INFO;

  isVueConstructed = new BehaviorSubject<boolean>(null);

  reset(){
    this.initialSetup.next(null);
    this.interestOption.next(null);
    this.settingsOption.next(null);
    this.studentInterest = [];
    this.currentSelectedInterestArray = [];
    this.myVueArray = [];
  }

}
