import { Routes } from '@angular/router';
import { GameComponent } from './game/game.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: ':roomId/:playerName', component: GameComponent },
  { path: '', component: AppComponent }
];
