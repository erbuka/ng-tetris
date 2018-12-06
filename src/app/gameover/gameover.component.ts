import { Component, OnInit, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { HighscoresService, Score } from '../services/highscores.service';

@Component({
  selector: 'app-gameover',
  templateUrl: './gameover.component.html',
  styleUrls: ['./gameover.component.css']
})
export class GameoverComponent implements OnInit {

  @ViewChild('inputName') inputName : ElementRef; 

  @Output("scoreSaved") scoreSavedEvent : EventEmitter<Score> = new EventEmitter(true);
  @Input() score : number;

  constructor(private highscores : HighscoresService) { }

  ngOnInit() {
    this.inputName.nativeElement.focus();
  }

  onKeyUp(evt) {
    if(evt.keyCode === 13) {
      let name = evt.target.value.trim();
      if(name.length > 0) {
        this.highscores.store(new Score(name, this.score));
        this.scoreSavedEvent.emit(name);
      }
    }
  }

}