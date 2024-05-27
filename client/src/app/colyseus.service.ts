import { Injectable } from '@angular/core';
import { Client, Room } from 'colyseus.js';
import { BehaviorSubject } from 'rxjs';
import { Status } from './game/gamestate';

@Injectable({
  providedIn: 'root'
})
export class ColyseusService {
  private client: Client;
  private room!: Room;
  private playerNumberSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
  playerNumber$ = this.playerNumberSubject.asObservable();
  gameStatus!: Status;

  constructor() {
    this.client = new Client('ws://localhost:2567');
  }

  async joinRoom(roomName: string, playerName: string): Promise<{ roomId: string; sessionId: string }> {
    const room = await this.client.joinOrCreate(roomName, { playerName });
    this.room = room;

    // Add message receiver
    this.room.onMessage('gameStatus', (message) => {
      this.onMessageReceived('gameStatus', message);
      this.gameStatus = message;
    });

    this.room.onMessage('playerNumber', (message) => {
      this.onPlayerNumberReceived(message.number);
    });

    this.room.onMessage('new gamefield', (message) => {
      this.onMessageReceived('gamefield', message);
    });
    this.room.onMessage('error joining', (message) =>{
      this.onMessageReceived('error joining', message);
      alert('Please enter a name!');
    })

    return {
      roomId: this.room.id,
      sessionId: this.room.sessionId
    };
  }

  leaveRoom() {
    this.room.leave();
  }

  getRoom() {
    return this.room;
  }


  sendMessage(message: string) {
    this.room.send(message);
  }

  sendScore(message: string, newField: Array<any>) {
    this.room.send(message, newField);
  }

  sendStatus(message: string, status: number) {
    this.room.send(message, status);
  }


  private onMessageReceived(type: string, message: any) {
    console.log(`Message received from server. Type: ${type}, Message:`, message);
    // Handle the message as needed
  }

  private onPlayerNumberReceived(playerNumber: number) {
    console.log(`Player number received: ${playerNumber}`);
    this.playerNumberSubject.next(playerNumber);
  }
}
