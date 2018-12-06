import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { SplashComponent } from './splash/splash.component';
import { GameoverComponent } from './gameover/gameover.component';
import { LoaderComponent } from './loader/loader.component';
import { CountdownComponent } from './countdown/countdown.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    SplashComponent,
    GameoverComponent,
    LoaderComponent,
    CountdownComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [ ],
  bootstrap: [AppComponent]
})
export class AppModule { }
