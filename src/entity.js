import * as PIXI from "pixi.js";
import Position from "./utils";

export default class Entity {
  constructor(position, sprite, updateCallback, map, type) {

    this.position = new Position(position.x, position.y);
    this.target = new Position(0, 0);
    this.health = 10;
    this.type = type;

    this.sprite = sprite;
    this.updateCallback = updateCallback;

    this.map = map;
    this.map.grid[position.y][position.x] = this;

    Entity.entities.push(this);
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

  damage(damage) {
    this.health -= damage;
    this.triggerUpdate();
  }

  move() {
    let originalPosition = new Position(this.position.x, this.position.y);
    if (this.target.x > 0) {
      this.position.x++;
      this.target.x--;
    } else if (this.target.x < 0) {
      this.position.x--;
      this.target.x++;
    }

    if (
      !originalPosition.equals(this.position) &&
      this.position.x >= 0 &&
      this.position.x < this.map.width &&
      this.position.y >= 0 &&
      this.position.y < this.map.height &&
      this.map.grid[this.position.y][this.position.x] === null
    ) {
      this.map.grid[originalPosition.y][originalPosition.x] = null;
      this.map.grid[this.position.y][this.position.x] = this;
    } else {
      this.position = originalPosition;
    }

    originalPosition = new Position(this.position.x, this.position.y);
    if (this.target.y > 0) {
      this.position.y++;
      this.target.y--;
    } else if (this.target.y < 0) {
      this.position.y--;
      this.target.y++;
    }

    if (
      !originalPosition.equals(this.position) &&
      this.position.x >= 0 &&
      this.position.x < this.map.width &&
      this.position.y >= 0 &&
      this.position.y < this.map.height &&
      this.map.grid[this.position.y][this.position.x] === null
    ) {
      this.map.grid[originalPosition.y][originalPosition.x] = null;
      this.map.grid[this.position.y][this.position.x] = this;
    } else {
      this.position = originalPosition;
    }

    this.triggerUpdate();
  }

  triggerUpdate() {
    if (this.updateCallback) this.updateCallback(this);
  }
}

export class Arena {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = new Array(height);
    for (let i = 0; i < height; i++) this.grid[i] = new Array(width);
  }

  clear() {
    for (let i = 0; i < this.height; i++)
      for (let j = 0; j < this.width; j++) this.grid[i][j] = null;
  }

  getEmpty() {
    let pos = new Position(
      Math.floor(Math.random() * this.width),
      Math.floor(Math.random() * this.height)
    );
    while (this.grid[pos.y][pos.x]) {
      pos = new Position(
        Math.floor(Math.random() * this.width),
        Math.floor(Math.random() * this.height)
      );
    }
    return pos;
  }
}

export const EntityType = {
  // Player
  Player: {
    name: "Player",
    description: "A headbanging mage. Casts Spells to the beat.",
  },
  // Ghoul
  Ghoul: {
    name: "Ghoul",
    description: "Your typical undead (Will bite).",
  },
  // NewBass
  NewBass: {
    name: "Enchantment - New Bass",
    description: "Replaces your current bassline with a new one.",
  }
};

Entity.entities = [];
