import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ResourceLoader, SoundEffects } from '../resource-loader';
import { AudioEngineService } from '../services/audio-engine.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit {

  private resLoader : ResourceLoader = new ResourceLoader();

  @Output("loadEnd") loadEndEvent : EventEmitter<void> = new EventEmitter(true);

  constructor(private soundEngine : AudioEngineService) { }

  ngOnInit() {

    this.addSound("SFX_Splash.ogg", SoundEffects.Splash);
    this.addSound("SFX_GameOver.ogg", SoundEffects.GameOver);
    this.addSound("SFX_GameStart.ogg", SoundEffects.GameStart);
    this.addSound("SFX_PieceRotateLR.ogg", SoundEffects.PieceRotate);
    this.addSound("SFX_PieceRotateFail.ogg", SoundEffects.PieceRotateFail);
    this.addSound("SFX_SpecialLineClearSingle.ogg", SoundEffects.Clear1);
    this.addSound("SFX_SpecialLineClearDouble.ogg", SoundEffects.Clear2);
    this.addSound("SFX_SpecialLineClearTriple.ogg", SoundEffects.Clear3);
    this.addSound("SFX_SpecialTetris.ogg", SoundEffects.Tetris);
    this.addSound("SFX_GameMusic.ogg", SoundEffects.Music);

    this.resLoader.doLoad()
      .then(() => this.loadEndEvent.emit());

  }

  private addSound(file : string, sfx : SoundEffects) {
    const soundDir = "assets/sound";
    this.resLoader.addSound(`${soundDir}/${file}`)
      .then(a => this.soundEngine.loadSound(sfx, a))
      .catch((e) => { console.error(e); });    
  }

}