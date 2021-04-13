import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-profile-widget',
  templateUrl: './profile-widget.component.html',
  styleUrls: ['./profile-widget.component.scss']
})
export class ProfileWidgetComponent implements OnInit {

  constructor() { }

  @Input() public photoUrl: string;
  @Input() public fullName: string;
  @Input() public size: string;

  public showInitials = false;
  public initials: string;
  public circleColor: string;
  public circleSize: string;

  private colors = [
      '#25282A', // space gray
      '#4E5851', // midnight green
      '#1F2020', // black
      '#FFE681', // light yellow
      '#BA0C2E', // red
  ];

  ngOnInit() {

      if (!this.photoUrl) {
          this.showInitials = true;
          this.createInititals();

          const randomIndex = Math.floor(Math.random() * Math.floor(this.colors.length));
          this.circleColor = this.colors[randomIndex];
      }
  }

  private createInititals(): void {
      let initials;
      initials  = this.fullName.charAt(0).toUpperCase();
      this.initials = initials;
  }

}
