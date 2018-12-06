import { Injectable } from '@angular/core';



export class Channel {
  audio : HTMLAudioElement = new Audio();
  
  busy : boolean = false;
  private paused : boolean = false;

  get loop() : boolean {
    return this.audio.loop;
  }

  set loop(v : boolean) {
    this.audio.loop = v;
  }

  constructor() { 
    this.audio.addEventListener("ended", () => {
      if(this.loop === false)
        this.busy = false;
    });
  }
  stop() {
    if(this.busy) {
      this.audio.pause();
      this.busy = false;
    }
  }
  pause() {
    if(this.busy) {
      this.paused ? this.audio.play() : this.audio.pause();
    }
  }
  fadeOut(time : number = 1.0) {
    let step = this.audio.volume * (time / 100.0);
    let interval = setInterval(() => {
      this.audio.volume = Math.max(0, this.audio.volume - step);
      if(this.audio.volume === 0.0) {
        clearInterval(interval);
      }
    }, 10);
  }
}


@Injectable({
  providedIn: 'root'
})
export class AudioEngineService {
  
  private soundBank = {};
  private channels : Channel[] = [];

  constructor() {

    let numChannels = 8;
    
    for(let i = 0; i < numChannels; i++) {
      this.channels[i] = new Channel();
    }
  }
  
  getChannel(index : number) : Channel {
    return this.channels[index]
  }

  loadSound(id : any, source : any) {
    if(source instanceof HTMLAudioElement) {
      this.soundBank[id] = source;
    } else if(typeof source === "string") {
      let audio = new Audio();
      audio.src = source;
      this.soundBank[id] = audio;
    }
  }

  play(id : any) : Channel {

    if(!this.soundBank[id]) {
      console.error(`Sound id not found: ${id}`);
      return null;
    }

    for(let c of this.channels) {
      if(!c.busy) {
        c.audio.src = this.soundBank[id].src;
        c.loop = false;
        c.busy = true;
        c.audio.play();
        return c;
      }
    }
    return null;
  }

  fadeIn(id : any, time : number) : Channel {

    if(!this.soundBank[id]) {
      console.error(`Sound id not found: ${id}`);
      return null;
    }


    let channel = this.play(id);
    if(channel != null) {
      channel.audio.volume = 0;
      let step = 0.01 / time;
      let interval = setInterval(() => {
        channel.audio.volume = Math.min(1.0, channel.audio.volume + step);
        if(channel.audio.volume === 1.0) {
          clearInterval(interval);
        }
      }, 10);
      return channel;
    }
    return null;
  }
}
