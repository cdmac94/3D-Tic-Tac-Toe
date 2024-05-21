

export class RoomLogic {

  // add gamefield array 

  gameField: Array<any> = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  // check board functions


  matchArray(newGamefield: Array<any>, gamefield: Array<any>){
    for (let i = 0; i < newGamefield.length; i++) {
      if (newGamefield[i] != 0 ){
        if(gamefield[i] != 1 || gamefield[i] != 2){
          gamefield[i] = newGamefield[i];
        }
      }
    }
    return gamefield;
  }

  // change to check draw and send game status

}
