import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.css']
})
export class CountdownComponent implements OnInit {
  @Output("ended") endedEvent : EventEmitter<void> = new EventEmitter(true);
  @Input() time : number = 3;
  timeSteps : number[] = [];

  private currentTime : number;
  constructor() { }

  ngOnInit() {
    for(let i = this.time; i >= 1; i--) {
      this.timeSteps.push(i);
    }
    this.currentTime = this.time;
  }

  decrement() : void {
    this.currentTime--;
    if(this.currentTime === 0) {
      //setTimeout(() => this.endedEvent.emit(), 1000);
      this.endedEvent.emit();
    }
  }

}
