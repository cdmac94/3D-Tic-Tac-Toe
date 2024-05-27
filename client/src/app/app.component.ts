import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ColyseusService } from './colyseus.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
})
export class AppComponent {
  playerName: string = '';

  constructor(private colyseusService: ColyseusService, private router: Router) {}

  async joinGame() {
    const { roomId } = await this.colyseusService.joinRoom('TicTacToe', this.playerName);
    this.router.navigate([`/${roomId}/${this.playerName}`]);
  }
}
