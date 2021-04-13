import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { INTEREST_KEYWORD, LINK_PREVIEW, PAGE_INFO } from './../_helpers/constents';
import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppDataShareService {

  constructor() { }

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
  //alertResponse = new BehaviorSubject<boolean>(null);

  appContainerHeight:number;
  appContainerWidth:number;

  locationEdited = false;

  myVueArray:LINK_PREVIEW[] = [];
  myVuePageInfo:PAGE_INFO;

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
