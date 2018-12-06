import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { HighscoresService, Score } from '../services/highscores.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css', './pixel-grid.css']
})
export class SplashComponent implements OnInit {
  
  showCredits: boolean = false;
  showHighscores : boolean = false;

  @Output("newGame") newGameEvent : EventEmitter<any> = new EventEmitter();

  constructor(public highscores : HighscoresService) { }

  ngOnInit() { }
  

}