import * as PIXI from "pixi.js";
import Position from "./utils";

export default class Entity {
  constructor(x, y, sprite) {
    this.position = new Position(x, y);
    this.target = new Position(0, 0);
    this.sprite = sprite;
    Entity.entities.set(this.position, this);
  }

  move() {
    if (this.target.x > 0) {
      this.position.x++;
      this.target.x--;
    } else if (this.target.x < 0) {
      this.position.x--;
      this.target.x++;
    }

    if (this.target.y > 0) {
      this.position.y++;
      this.target.y--;
    } else if (this.target.y < 0) {
      this.position.y--;
      this.target.y++;
    }
  }
}

Entity.entities = new Map();
