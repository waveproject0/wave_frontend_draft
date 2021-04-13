import { Subscription } from 'rxjs';
import { ResponsiveService } from './../../_services/responsive.service';
import { dev_prod } from './../../_helpers/constents';
import { Component, isDevMode, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private responsiveService:ResponsiveService, private elRef: ElementRef) {}

  hero_video_url:string;
  hero_art_url:string;
  girl_on_computer_url:string;
  girl_diving_url:string;
  girl_machine_url:string;
  girl_painter_url:string;
  girl_scientist_url:string;
  girl_on_call_url:string;
  girl_painting_together_url:string;


  screenValue:string;
  headlineClass:string;
  colClass:string;
  flexCenter:string;
  swipTextTopValue:string;
  swipConversationtext:boolean;
  swipConversationLineheight:string;


  responsiveServiceUnsub:Subscription;

  responsiveValue(value, screenSize){
    if (value === 'xl' || value === 'lg'){
      this.headlineClass = 'mat-display-1';
      this.swipTextTopValue = '13px';
      this.colClass = 'col-6';
      this.flexCenter = 'justify-content-start';
    }
    else if (value === 'md'){
      this.headlineClass = 'mat-headline';
      this.swipTextTopValue = '20px';
      this.colClass = 'col-6';
      this.flexCenter = 'justify-content-start';
    }
    else{
      this.headlineClass = 'mat-title';
      this.swipTextTopValue = '20px';
      this.colClass = 'col-12';
      this.flexCenter = 'justify-content-center';
    }

    if (screenSize < 436){
      this.swipConversationtext = false;
      this.swipConversationLineheight = 'normal';
    }
    else if (screenSize >= 768 && screenSize < 943){
      this.swipConversationtext = true;
      this.swipConversationLineheight = 'normal';
    }
    else if (screenSize >= 938 && screenSize < 965){
      this.swipConversationtext = true;
      this.swipConversationLineheight = 'normal';
    }
    else if (screenSize >= 991 && screenSize < 1125){
      this.swipConversationtext = true;
      this.swipConversationLineheight = 'normal';
    }
    else if (screenSize >= 1126 && screenSize < 1153){
      this.swipConversationtext = true;
      this.swipConversationLineheight = 'normal';
    }
    else if (screenSize >= 1200 && screenSize < 1405){
      this.swipConversationtext = true;
      this.swipConversationLineheight = 'normal';
    }
    else{
      this.swipConversationtext = true;
      this.swipConversationLineheight = '0.1';
    }
  }

  ngOnInit(): void {
    if (isDevMode()){
      this.hero_video_url = 'assets/video/hero_video.mp4';
      this.hero_art_url = 'assets/img/hero_art.jpg';
      this.girl_on_computer_url = 'assets/svg/girl_on_computer.svg';
      this.girl_diving_url = 'assets/img/girl_diving.png';
      this.girl_machine_url = 'assets/img/girl_machine.png';
      this.girl_painter_url = 'assets/img/girl_painter.png';
      this.girl_scientist_url = 'assets/img/girl_scientist.png';
      this.girl_on_call_url = 'assets/svg/girl_on_call.svg';
      this.girl_painting_together_url = 'assets/svg/girls_painting_together.svg';
    }
    else{
      this.hero_video_url = dev_prod.staticUrl_prod + 'assets/video/hero_video.mp4';
      this.hero_art_url = dev_prod.staticUrl_prod + 'assets/img/hero_art.jpg';
      this.girl_on_computer_url = dev_prod.staticUrl_prod + 'assets/svg/girl_on_computer.svg';
      this.girl_diving_url = dev_prod.staticUrl_prod + 'assets/img/girl_diving.png';
      this.girl_machine_url = dev_prod.staticUrl_prod + 'assets/img/girl_machine.png';
      this.girl_painter_url = dev_prod.staticUrl_prod + 'assets/img/girl_painter.png';
      this.girl_scientist_url = dev_prod.staticUrl_prod + 'assets/img/girl_scientist.png';
      this.girl_on_call_url = dev_prod.staticUrl_prod + 'assets/svg/girl_on_call.svg';
      this.girl_painting_together_url = dev_prod.staticUrl_prod + 'assets/svg/girls_painting_together.svg';
    }

    this.responsiveValue(this.responsiveService.screenWidth, this.responsiveService.screenSize);
    this.responsiveServiceUnsub = this.responsiveService.getScreenWidthStatus()
    .subscribe(result =>{
      this.responsiveValue(result, this.responsiveService.screenSize);
    });
  }

  ngAfterViewInit(){
    const video = this.elRef.nativeElement.querySelector('video');
    video.load();
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.play();
  }

  ngOnDestroy(){
    this.responsiveServiceUnsub.unsubscribe();
  }

}
