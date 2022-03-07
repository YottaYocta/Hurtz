import * as PIXI from "pixi.js";
import Position from "./utils";

export default class Entity {
  constructor(x, y, sprite, updateCallback) {
    this.position = new Position(x, y);
    this.target = new Position(0, 0);
    this.sprite = sprite;
    this.updateCallback = updateCallback;
    console.log(updateCallback);
    Entity.entities.set(this.position, this);
  }

  get position() {
    return this._position;
  }

  set position(position) {
    this._position = position;
    this.triggerUpdate();
  }

  get target() {
    return this._target;
  }

  set target(target) {
    this._target = target;
    this.triggerUpdate();
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
    this.triggerUpdate();
  }

  triggerUpdate() {
    if (this.updateCallback) this.updateCallback();
  }
}

Entity.entities = new Map();
