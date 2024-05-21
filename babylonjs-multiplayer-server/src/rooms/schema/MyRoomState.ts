import { Schema, type } from "@colyseus/schema";

export class MyRoomState extends Schema {
  @type([ "number" ])
  gamefield: number[] = [];

  @type("number")
  status: number = 0;
}
