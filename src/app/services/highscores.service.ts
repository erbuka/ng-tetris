import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class Score {
  constructor(public name: string, public score: number) { }
}
const MAX_SCORES = 10;
const LOCAL_STORAGE_KEY = "NGTETRIS_SCORES";

@Injectable({
  providedIn: 'root'
})
export class HighscoresService {
  public scores: Score[] = [];
  constructor(private httpClient: HttpClient) {
    let data = localStorage.getItem(LOCAL_STORAGE_KEY);
    this.scores = data ? JSON.parse(data) : [];

    while (this.scores.length < MAX_SCORES)
      this.scores.push({ name: "Player", score: 0 });

  }

  store(s: Score): void {
    this.scores.push(s);
    this.scores.sort((a, b) => b.score - a.score);

    let toDelete = this.scores.length - MAX_SCORES;

    if (toDelete > 0) {
      this.scores.splice(MAX_SCORES, toDelete);
    }


    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.scores));
  }
}
