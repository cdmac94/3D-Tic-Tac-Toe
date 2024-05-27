import { Status } from "../game/gamestate";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class GameLogic {

  // initial game status and game field
  gamefield: [0, 0, 0, 0, 0, 0, 0, 0, 0] | Array<number>;

  gameStatus: Status;

  updateLocalGamefield(currentPlayer: number, pickIndex: number){
    this.gamefield[pickIndex] = currentPlayer;
    return this.gamefield;
  }

  // get index of cube picked

  getIndex(cubeId: string){
    console.log("Get index cubeId:", cubeId);
    if (cubeId.includes("cube_0_0")) {
      return 0;
    } else if (cubeId === "cube_0_1") {
      return 1;
    } else if (cubeId === "cube_0_2") {
      return 2;
    } else if (cubeId === "cube_1_0") {
      return 3;
    } else if (cubeId === "cube_1_1") {
      return 4;
    } else if (cubeId === "cube_1_2") {
      return 5;
    } else if (cubeId === "cube_2_0") {
      return 6;
    } else if (cubeId === "cube_2_1") {
      return 7;
    } else if (cubeId === "cube_2_2") {
      return 8;
    } else {
      return -1;
    }
  }

  checkColumn( position: number, currentTable: Array<number> ){
    if( currentTable[0]  === position && currentTable[3]  === position && currentTable[6]  === position){
      return true
    } else if( currentTable[1]  === position && currentTable[4]  === position && currentTable[7]  === position){
      return true;
    } else if( currentTable[2]  === position && currentTable[5]  === position && currentTable[8]  === position){
      return true;
    }
    return false
  }
  checkRow( position: number, currentTable: Array<any> ){
    if( currentTable[0]  === position && currentTable[1]  === position && currentTable[2]  === position){
      return true
    } else if( currentTable[3]  === position && currentTable[4]  === position && currentTable[5]  === position){
      return true;
    } else if( currentTable[6]  === position && currentTable[7]  === position && currentTable[8]  === position){
      return true;
    }
    return false
  }
  checkDiagonal( position: number, currentTable: Array<any> ){
    if( currentTable[0]  === position && currentTable[4]  === position && currentTable[8]  === position){
      return true
    } else if( currentTable[2]  === position && currentTable[4]  === position && currentTable[6]  === position){
      return true;
    }
    return false
  }

  // change to check win and send game status
  checkWin( position: number, currentTable: Array<any>) {

    let winner = false;

    if ( this.checkColumn(position, currentTable) || this.checkRow(position, currentTable) || this.checkDiagonal(position, currentTable) ){
      winner = true;
    }

    return winner
  }

  // change to check draw and send game status
  checkDraw(currentPlayer: Array<any>) {

    let draw = true;

    for (let i = 0; i < currentPlayer.length; i++) {
      if (currentPlayer[i] === 0){
        draw = false;
      }
    }
    if(draw){
      return true
    } else{
      return draw;
    }
  }

  public constructor() {
    this.gamefield = [ 0, 0, 0, 0, 0, 0, 0, 0, 0]
    this.gameStatus = Status.WAIT;
  }

  // add logic to update session
  gameEnd(): void {
    this.gameStatus = Status.STOP;
  }
}
