import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppErrorService {

  constructor() { }

  tokenRefreshError = new Subject<string>();

  getTokenRefreshError(): Observable<string>{
    return this.tokenRefreshError.asObservable();
  }
}
