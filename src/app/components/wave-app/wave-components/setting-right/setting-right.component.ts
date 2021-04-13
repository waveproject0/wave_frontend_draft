import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-setting-right',
  templateUrl: './setting-right.component.html',
  styleUrls: ['./setting-right.component.scss']
})
export class SettingRightComponent implements OnInit, OnDestroy {

  constructor(private appDataShareService:AppDataShareService) { }

  settingsOption:string;
  settingsOptionUnsub: Subscription;

  ngOnInit(): void {
    this.settingsOptionUnsub = this.appDataShareService.settingsOption.subscribe(result =>{this.settingsOption = result});
  }

  ngOnDestroy(){
    this.appDataShareService.settingsOption.next(null);
    this.settingsOptionUnsub.unsubscribe();
  }

}
