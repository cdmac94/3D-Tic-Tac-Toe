import { Room, Client } from '@colyseus/core';
import { MyRoomState } from './schema/MyRoomState';
// import { RoomLogic } from './roomlogic';

export class TicTacToe extends Room<MyRoomState> {
  maxClients = 2;
  // private roomLogic: RoomLogic;

  onCreate(options: any) {
    this.setState(new MyRoomState());
    // this.roomLogic = new RoomLogic();
    

    this.onMessage('gamefield', (client, message: Array<number>) => {
        this.broadcast('new gamefield', message);
    });

    this.onMessage('gameStatus', (client: { sessionId: any }, message: { status: number }) => {
      console.log('Received new status', message);
      this.broadcast('gameStatus', message);
    });
  }

  onJoin(client: Client, options: any) {
    console.log(this.clients.length);

    if (options.playerName === '') {
      client.send('error joining', { message: 'No player name provided.' });
      return;
    }

    if (this.clients.length === 1) {
      client.send('playerNumber', { number: 1 });
      client.send('gameStatus', 6);
    } else if (this.clients.length === 2) {
      client.send('playerNumber', { number: 2 });
      this.broadcast('gameStatus', 1);
    } else {
      client.send('error joining', { message: 'Room is full. Unable to join.' });
    }

    console.log(client.sessionId, 'joined with name:', options.playerName);
  }

  onAuth(client: Client, options: any) {
    return true;
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, 'left!');
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...');
  }
}
