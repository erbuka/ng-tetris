import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';
import { Tetris } from '../tetris';
import { AudioEngineService } from '../services/audio-engine.service';


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
	
  @Output("gameOver") gameOverEvent : EventEmitter<void> = new EventEmitter(true);
  @Input() width : number = 10;
  @Input() height : number = 22;
  @Input() startingLevel : number = 1;
  game : Tetris;
	cellSize : number;

	constructor(private audioEngine : AudioEngineService) { }

	onScoreSaved() : void {
		this.gameOverEvent.emit();
	}

	ngOnInit() : void {
		this.game = new Tetris(this.width, this.height, 1, this.audioEngine);
		this.onResize(null);
	}

	onCountdownEnded() : void {
		this.game.start();
	}

	
	@HostListener("window:keydown", ["$event"])
	onKeyDown(evt) {
		this.game.onKeyDown(evt.keyCode);
	}

	@HostListener("window:keyup", ["$event"])
	onKeyUp(evt) {
		this.game.onKeyUp(evt.keyCode);
	}	

	@HostListener("window:resize", ["$event"])
	onResize(evt) {
		this.cellSize = Math.round((window.innerHeight * 0.8) / this.game.height);
	}

}
