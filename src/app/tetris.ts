import { AudioEngineService, Channel } from './services/audio-engine.service';
import { SoundEffects } from './resource-loader';

var Keys = {
  Up: 38,
  Down: 40,
  Left: 37,
  Right: 39,

  Space: 32
}

class Ticker {
  private interval: number;
  constructor(private millis : number, private callback : Function) {
    this.millis = millis;
    this.callback = callback;
  }
  start(): void {
    this.interval = setInterval(this.callback, this.millis);
  }
  stop(): void {
    clearInterval(this.interval);
  }
}

class Piece {
  id: number;
  x: number = 0;
  y: number = 0;
  data: number[];
  size: number;
  colorClass: string;
  static Blocks = [
    { // I
      size: 4,
      color: "#0ff",
      colorClass: "w3-cyan",
      data: [
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0,
        0, 1, 0, 0
      ]
    },
    { // L
      size: 3,
      color: "#00f",
      colorClass: "w3-blue",
      data: [
        0, 1, 0,
        0, 1, 0,
        0, 1, 1
      ]
    },
    { // J
      size: 3,
      color: "#f80",
      colorClass: "w3-orange",
      data: [
        0, 1, 0,
        0, 1, 0,
        1, 1, 0
      ]
    },
    { // O
      size: 2,
      color: "#ff0",
      colorClass: "w3-yellow",
      data: [
        1, 1,
        1, 1
      ]
    },
    { // S
      size: 3,
      color: "#0f0",
      colorClass: "w3-green",
      data: [
        1, 0, 0,
        1, 1, 0,
        0, 1, 0
      ]
    },
    { // Z
      size: 3,
      color: "#f00",
      colorClass: "w3-red",
      data: [
        0, 0, 1,
        0, 1, 1,
        0, 1, 0
      ]
    },
    { // T
      size: 3,
      color: "#f0f",
      colorClass: "w3-purple",
      data: [
        0, 1, 0,
        1, 1, 1,
        0, 0, 0
      ]
    },

  ];
  private static nextId: number = 1;
  static random(): Piece {
    let template = Piece.Blocks[Math.floor(Math.random() * Piece.Blocks.length)];
    return new Piece(template.size, template.data, template.colorClass);
  }
  constructor(size: number, data: number[], colorClass: string = "") {
    this.id = Piece.nextId++;
    this.size = size;
    this.data = data.map(x => x);
    this.colorClass = colorClass;
  }
  getMinX(cy: number = NaN): number {
    if (isNaN(cy)) {
      for (let x = 0; x < this.size; x++)
        for (let y = 0; y < this.size; y++)
          if (this.at(x, y) == 1)
            return this.x + x;
    } else {
      for (let x = 0; x < this.size; x++)
        if (this.at(x, cy) == 1)
          return this.x + x;
    }
    return NaN;
  }
  getMaxX(cy: number = NaN): number {
    if (isNaN(cy)) {
      for (let x = this.size - 1; x >= 0; x--)
        for (let y = 0; y < this.size; y++)
          if (this.at(x, y) == 1)
            return this.x + x;
    } else {
      for (let x = this.size - 1; x >= 0; x--)
        if (this.at(x, cy) == 1)
          return this.x + x;
    }
    return NaN;
  }
  getMaxY(cx: number = NaN): number {
    if (isNaN(cx)) {
      for (let y = this.size - 1; y >= 0; y--)
        for (let x = 0; x < this.size; x++)
          if (this.at(x, y) == 1)
            return this.y + y;
    } else {
      for (let y = this.size - 1; y >= 0; y--)
        if (this.at(cx, y) == 1)
          return this.y + y;
    }
    return NaN;
  }
  getMinY(cx: number = NaN): number {
    if (isNaN(cx)) {
      for (let y = 0; y < this.size; y++)
        for (let x = 0; x < this.size; x++)
          if (this.at(x, y) == 1)
            return this.y + y;
    } else {
      for (let y = 0; y < this.size; y++)
        if (this.at(cx, y) == 1)
          return this.y + y;
    }
    return NaN;
  }  
  at(x: number, y: number): number {
    return this.data[y * this.size + x];
  }
  setAt(x: number, y: number, v: number): void {
    this.data[y * this.size + x] = v;
  }
}

class GridCell {
  pieceId: number = 0;
  colorClass: string = "";

  constructor() { }
  
  reset(): void {
    this.pieceId = 0;
    this.colorClass = "";
  }
  set(piece: Piece): void {
    this.pieceId = piece.id;
    this.colorClass = piece.colorClass;
  }
  swap(other: GridCell): void {
    var p = this.pieceId;
    var k = this.colorClass;

    this.pieceId = other.pieceId;
    this.colorClass = other.colorClass;

    other.pieceId = p;
    other.colorClass = k;
  }
}

export class Tetris {
  grid: GridCell[];
  lines: number = 0;
  level: number = 0;
  score: number = 0;
  gameOver: boolean = false;
  nextPiece: Piece = null;
  private gameTicker: Ticker;
  private activePiece: Piece = null;
  private keystate: object = {};
  private tickCount: number = 0;
  private tickInterval: number = 50;
  private consecutiveTetris : number = 0;
  private music : Channel = null;
  constructor(readonly width: number, readonly height: number, readonly startingLevel : number = 1, private audioEngine : AudioEngineService) {

    this.level = startingLevel;

    this.grid = new Array<GridCell>(width * height)

    for (let i = 0; i < this.grid.length; i++)
      this.grid[i] = new GridCell();
  }
  ticksPerUpdate(): number {
    return 20 - 2 * this.level;
  }
  start(): void {
    this.gameTicker = new Ticker(this.tickInterval, this.tick.bind(this));
    this.gameTicker.start();
    /*
    this.audioEngine.play(SoundEffects.GameStart);
    setTimeout(() => {
      this.music = this.audioEngine.fadeIn(SoundEffects.Music, 4.0);
      if(this.music)
        this.music.loop = true;
    } , 3000);
    */
   this.music = this.audioEngine.fadeIn(SoundEffects.Music, 1.5);
   this.music.loop = true;
  }
  stop(): void {
    this.gameTicker.stop();
  }
  tick(): void {

    if(this.gameOver) {
      return;
    }

    if (this.activePiece == null) {
      this.pushNextPiece();
    }

    // Update the active piece 
    // Updates trigger every N ticks (N depends upon the current level) or
    // when the down arrow is pressed

    let collided: boolean = false;
    let colMinY: number, colMaxY: number;

    if (this.tickCount == 0 || this.keystate[Keys.Down]) {

      // Collision check
      // for every x in [0, piece.size] find the maxY where piece.at(x, maxY) == 1
      // There's a collision if maxY == height - 1 or the grid is not empty at [x, maxY + 1]

      for (let x = 0; !collided && x < this.activePiece.size; x++) {
        let maxY = this.activePiece.getMaxY(x);
        let gx = this.activePiece.x + x;

        if (maxY == this.height - 1 || (this.isInsideGrid(gx, maxY + 1) && !this.isGridEmpty(gx, maxY + 1))) {
          colMinY = this.activePiece.y;
          colMaxY = Math.min(this.activePiece.y + this.activePiece.size - 1, this.height - 1);
          collided = true;
        }

      }

      if (!collided) { // If the current piece hasn't collided, we push it down
        this.moveActivePiece(0, 1);
      }
    }

    // Line erasing
    // If there was a collision, erase lines if necessary
    if (collided) {

      let clearedLines : number = 0;

      for (let y = Math.max(0, colMinY); y <= Math.max(0, colMaxY); y++) {
        let toErase: boolean = true;
        for (let x = 0; x < this.width; x++)
          if (this.isGridEmpty(x, y)) {
            toErase = false;
            break;
          }
        if (toErase) {
          for (let x = 0; x < this.width; x++)
            this.getGrid(x, y).reset();
          this.pushDown(y);
          this.lines++;
          clearedLines++;
        }
      }

      // Score computing based on cleared lines:
      // - from 1 to 3 lines -> 100 * 2 ^ (clearedLines - 1), so eighter 100, 200 or 400
      // - 4 cleared lines is "TETRIS", the score is 800 * 2 ^ (consecutiveTetris - 1), so 800, 1600, 3200, ...
      if(clearedLines > 0) {
        if(clearedLines < 4) {
          this.score += 100 * Math.pow(2, clearedLines - 1);
        } else {
          this.consecutiveTetris++;
          this.score += 800 * Math.pow(2, this.consecutiveTetris - 1);
        }
      }

      switch(clearedLines) {
        case 1: this.audioEngine.play(SoundEffects.Clear1); break;
        case 2: this.audioEngine.play(SoundEffects.Clear2); break;
        case 3: this.audioEngine.play(SoundEffects.Clear3); break;
        case 4: this.audioEngine.play(SoundEffects.Tetris); break;
      }

      // After pushing all the lines down, we check
      // if the piece is currently above the grid and
      // if it is, it's game over
      if(this.activePiece.getMinY() < 0) {
        this.audioEngine.play(SoundEffects.GameOver);
        if(this.music)
          this.music.fadeOut(1.5);
        this.gameOver = true;
        this.stop();
      }

      this.activePiece = null;

    }

    this.level = Math.min(9, this.startingLevel + Math.floor(this.lines / 10));

    this.tickCount = (this.tickCount + 1) % this.ticksPerUpdate();


  }
  pushDown(row: number) {
    for (let y = row; y >= 1; y--)
      for (let x = 0; x < this.width; x++)
        this.getGrid(x, y).swap(this.getGrid(x, y - 1));
  }
  pushNextPiece(): void {
    if (this.nextPiece == null)
      this.nextPiece = Piece.random();

    this.activePiece = this.nextPiece;
    this.activePiece.x = Math.round((this.width - this.activePiece.size) / 2);
    this.activePiece.y = -this.activePiece.size;
    this.nextPiece = Piece.random();
  }
  onKeyDown(keyCode: number): void {

    if (this.activePiece != null) {
      if (keyCode == Keys.Left) {

        let collides: boolean = false;

        for (let y = 0; y < this.activePiece.size; y++) {
          let minX = this.activePiece.getMinX(y);
          let gy = this.activePiece.y + y;
        
          if ((this.isInsideGrid(minX - 1, gy) && !this.isGridEmpty(minX - 1, gy)) || minX == 0) {
            collides = true;
            break;
          }
          
        }

        if (!collides)
          this.moveActivePiece(-1, 0);

      } else if (keyCode == Keys.Right && this.activePiece.getMaxX() < this.width - 1) {

        let collides: boolean = false;

        for (let y = 0; y < this.activePiece.size; y++) {
          let maxX = this.activePiece.getMaxX(y);
          let gy = this.activePiece.y + y;

          if((this.isInsideGrid(maxX + 1, gy) && !this.isGridEmpty(maxX + 1, gy)) || maxX == this.width -1) {
            collides = true;
            break;
          }
        }

        if (!collides)
          this.moveActivePiece(1, 0);
      }
    }

    this.keystate[keyCode] = true;
  }
  onKeyUp(keyCode: number): void {
    if (this.activePiece !== null) {
      if (keyCode == Keys.Up) {
        this.rotateActivePiece();
      }
    }
    delete this.keystate[keyCode];
  }
  rotateActivePiece(): void {
    let s = this.activePiece.size;
    let data = new Array<number>(s * s);

    // Create the new piece data
    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++)
        data[(s - x - 1) * s + y] = this.activePiece.at(x, y);

    // Calculate X displacement if data goes out of the grid (horizontally)
    let minX = Number.MAX_SAFE_INTEGER;
    let maxX = -Number.MAX_SAFE_INTEGER;

    for (let y = 0; y < s; y++)
      for (let x = 0; x < s; x++)
        if (data[y * s + x] == 1) {
          minX = Math.min(minX, x + this.activePiece.x);
          maxX = Math.max(maxX, x + this.activePiece.x);
        }


    let displacementX = 0;

    if (minX < 0) {
      displacementX = -minX;
    } else if (maxX > this.width - 1) {
      displacementX = -(maxX - (this.width - 1));
    }

    let nx = this.activePiece.x + displacementX;
    let ny = this.activePiece.y;


    // Check if the piece can be put in the grid without overlapping other pieces

    for (let x = 0; x < s; x++)
      for (let y = 0; y < s; y++)
        if (data[y * s + x] == 1) { // if the rotated piece is solid here
          // Grid coordinates
          let gx = nx + x;
          let gy = ny + y;

          // Can't rotate the piece if:
          // - (gx, gy) is outside of the grid (because gy is too big)
          if (!this.isInsideGrid(gx, gy))
            return;

          // - There's some other piece on the way
          if (this.getGrid(gx, gy).pieceId != this.activePiece.id && !this.isGridEmpty(gx, gy)) {
            this.audioEngine.play(SoundEffects.PieceRotateFail);
            return;
          }

        }

    // Clear the grid where the the current piece is
    for (let x = this.activePiece.x; x < this.activePiece.x + s; x++)
      for (let y = this.activePiece.y; y < this.activePiece.y + s; y++)
        if (this.isInsideGrid(x, y) && this.getGrid(x, y).pieceId == this.activePiece.id)
          this.getGrid(x, y).reset();


    // Displace the piece horizontally and set the new loyout
    this.activePiece.x += displacementX;
    this.activePiece.data = data;

    // Update the grid;
    for (let x = this.activePiece.x; x < this.activePiece.x + s; x++)
      for (let y = this.activePiece.y; y < this.activePiece.y + s; y++)
        if (this.isInsideGrid(x, y) && this.activePiece.at(x - this.activePiece.x, y - this.activePiece.y) == 1)
          this.getGrid(x, y).set(this.activePiece);

    this.audioEngine.play(SoundEffects.PieceRotate);

  }
  moveActivePiece(dx: number, dy: number): void {
    let s = this.activePiece.size;

    for (let x = this.activePiece.x; x < this.activePiece.x + this.activePiece.size; x++)
      for (let y = this.activePiece.y; y < this.activePiece.y + this.activePiece.size; y++)
        if (this.isInsideGrid(x, y) && this.getGrid(x, y).pieceId == this.activePiece.id)
          this.getGrid(x, y).reset();

    this.activePiece.y += dy;
    this.activePiece.x += dx;

    for (let x = this.activePiece.x; x < this.activePiece.x + this.activePiece.size; x++)
      for (let y = this.activePiece.y; y < this.activePiece.y + this.activePiece.size; y++)
        if (this.isInsideGrid(x, y) && this.activePiece.at(x - this.activePiece.x, y - this.activePiece.y) == 1)
          this.getGrid(x, y).set(this.activePiece);

  }
  isInsideGrid(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
  isGridEmpty(x: number, y: number): boolean {   
    return this.grid[y * this.width + x].pieceId === 0;
  }
  getGrid(x: number, y: number): GridCell {
    return this.grid[y * this.width + x];
  }

}