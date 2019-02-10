import { Component } from '@angular/core';
import { AudioEngineService } from './services/audio-engine.service';
import { SoundEffects } from './resource-loader';

enum EGameStates { Loading, Splash, Playing };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { 
  gameState : EGameStates = EGameStates.Loading;
  GameStates = EGameStates;
  
  constructor(private audioEngine : AudioEngineService) { }

	onNewGame() {
    this.gameState = EGameStates.Playing;
	}
  onGameOver() {
    this.gameState = EGameStates.Splash;
  }
  onLoadEnd() {
    this.gameState = EGameStates.Splash;
    this.audioEngine.play(SoundEffects.Splash);
  }
}
