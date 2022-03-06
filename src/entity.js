import * as PIXI from "pixi.js";
import Position from "./utils";

export default class Entity {
  constructor(x, y, sprite) {
    this.position = new Position(x, y);
    this.sprite = sprite;
    Entity.entities.set(this.position, this);
  }
}

Entity.entities = new Map();
