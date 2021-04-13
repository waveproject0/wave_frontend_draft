import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alert-box',
  templateUrl: './alert-box.component.html',
  styleUrls: ['./alert-box.component.scss']
})
export class AlertBoxComponent implements OnInit {

  constructor() { }

  @Input() message:string;
  @Output() response = new EventEmitter();

  ngOnInit(): void {
  }

  alertResponse(response:boolean){
    this.response.emit(response);
  }

}
