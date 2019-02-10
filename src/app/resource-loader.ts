export enum SoundEffects {
  Splash = 0,
  GameOver,
  GameStart,
  PieceRotate,
  PieceRotateFail,
  Clear1,
  Clear2,
  Clear3,
  Tetris,
  Music
}

class ResourcePair {
  constructor(public url : string, public obj : object) { }
}

export class ResourceLoader {

  private items : ResourcePair[] = [];
  private loaded : number = 0;
  private finished : Function = null;
  private error : Function = null;
  constructor() {  }

  addSound(url: string) : Promise<HTMLAudioElement> {
    return new Promise<HTMLAudioElement>((resolve, reject) => {
      let a = new Audio();
      a.addEventListener("canplaythrough", () => { resolve(a); this.itemLoaded(); });
      a.addEventListener("error", () => { reject("Error loading " + url); this.itemLoaded(); });
      a.addEventListener("abort", () => { reject("Aborted: " + url); this.itemLoaded(); });
      this.items.push(new ResourcePair(url, a));
    });
  }

  itemLoaded() : void {
    this.loaded++;
    if(this.loaded == this.items.length && this.finished) {
      this.finished();
    }
  }

  doLoad() : Promise<void> {

    return new Promise<void>((resolve, reject) => {

      this.finished = resolve;
      this.error = reject;

      for(let pair of this.items) {

        if(pair.obj instanceof HTMLAudioElement) {
          (<HTMLAudioElement>pair.obj).src = pair.url;
        } 
      }
    });
  }


}