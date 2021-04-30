import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-info-card-widget',
  templateUrl: './info-card-widget.component.html',
  styleUrls: ['./info-card-widget.component.scss']
})
export class InfoCardWidgetComponent implements OnInit {

  constructor() { }

  @Input() imgUrl:string;
  @Input() titleText:string;
  @Input() subtitleText:string;


  ngOnInit(): void {
  }

}
