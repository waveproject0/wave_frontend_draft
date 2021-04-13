import { AppDataShareService } from './../../../../_services/app-data-share.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-setting-left',
  templateUrl: './setting-left.component.html',
  styleUrls: ['./setting-left.component.scss']
})
export class SettingLeftComponent implements OnInit, OnDestroy {

  constructor(private appDataShareService:AppDataShareService) { }

  navInterest = false;
  navFieldofstudy = false;

  ngOnInit(): void {

    if(this.appDataShareService.initialSetup.value){
      this.navStateChange('Interest');
    }

  }

  navStateChange(state:string){
    if (state === 'Interest'){
      this.navInterest = true;
      this.navFieldofstudy = false;
    }
    else if (state === 'Fieldofstudy'){
      this.navFieldofstudy = true;
      this.navInterest = false;
    }

    this.appDataShareService.settingsOption.next(state);
  }

  settingsNav(navButton: string){
    this.navStateChange(navButton);
  }

  ngOnDestroy(){

  }

}
