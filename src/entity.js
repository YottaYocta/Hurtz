import * as PIXI from "pixi.js";
import Position from "./utils";

export default class Entity {
  constructor(position, type, sprite, updateCallback, map) {

    this.map = map;
    this.map.grid[position.y][position.x] = this;

    this._position = new Position(position.x, position.y);
    this._target = new Position(0, 0);
    this._health = type.health;
    this.type = type;

    this.sprite = sprite;
    this.updateCallback = updateCallback;

    Entity.entities.push(this);
  }

  get position() {

    return this._position;
  }

  get health() {
    return this._health;
  }

  set position(position) {
    this.map.grid[this._position.y][this._position.x] = null;
    this.map.grid[position.y][position.x] = this;
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
    this._health -= damage;
    this.triggerUpdate();
  }

  move() {
    let originalPosition = new Position(this.position.x, this.position.y);
    let newPosition = new Position(this.position.x, this.position.y);

    let moveX = false;
    let moveY = false;

    if (this.target.x > 0) {
      newPosition.x++;
      this.target.x--;
    } else if (this.target.x < 0) {
      newPosition.x--;
      this.target.x++;
    }

    if (
      !originalPosition.equals(newPosition) &&
      newPosition.x >= 0 &&
      newPosition.x < this.map.width &&
      newPosition.y >= 0 &&
      newPosition.y < this.map.height &&
      this.map.grid[newPosition.y][newPosition.x] === null
    ) {
      moveX = true;
    } else {
      newPosition = originalPosition;
    }

    originalPosition = new Position(newPosition.x, newPosition.y);

    if (this.target.y > 0) {
      newPosition.y++;
      this.target.y--;
    } else if (this.target.y < 0) {
      newPosition.y--;
      this.target.y++;
    }

    if (
      !originalPosition.equals(newPosition) &&
      newPosition.x >= 0 &&
      newPosition.x < this.map.width &&
      newPosition.y >= 0 &&
      newPosition.y < this.map.height &&
      this.map.grid[newPosition.y][newPosition.x] === null
    ) {
      moveY = true;
    } else {
      newPosition = originalPosition;
    }

    if (moveX || moveY) this.position = newPosition;
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
    for (let i = 0; i < height; i++) {
      this.grid[i] = new Array(width);
    }
    this.clear();
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

  isValid(position) {
    return (
      position.x >= 0 && position.y >= 0 &&
      position.x < this.width && position.y < this.height
    ); 
  }

  isEmpty(position) {
    return (
      this.grid[position.y][position.x] === null
    ); 
  }

  toString() {
    let output = '';
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) output += (this.grid[i][j] ? 1 : 0) + ' ';
      output += '\n';
    }
    return output;
  }
}


export const EntityType = {
  Player: {
    name: "Player",
    description: "A headbanging mage. Casts Spells to the beat.",
    health: 10,
  },
  Ghoul: {
    name: "Ghoul",
    description: "Your typical undead (Will bite).",
    health: 5,
  },
  NewBass: {
    name: "Enchantment - New Bass",
    description: "Replaces your current bassline . Higher rounds give more notes.",
    health: 3,
  },
  ExtendBassRange: {
    name: "Enchantment - Extend Bass Range",
    description: "Extends the range of your current bass.",
    health: 3,
  },
  getEnchantments: function() {
    return [EntityType.NewBass, EntityType.ExtendBassRange];
  },
  randomEnchantment: function() {
    let enchantments = this.getEnchantments();
    return enchantments[Math.floor(Math.random() * enchantments.length)]; 
  },

};

Entity.entities = [];
