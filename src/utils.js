export default class Position {
  constructor(x, y) {
    this.x = typeof x === "number" ? x : 0;
    this.y = typeof y === "number" ? y : 0;
  }

  set(x) {
    this.x = x;
    this.y = x;
  }

  add(x, y) {
    return new Position(this.x + x, this.y + y);
  }

  zero() {
    this.x = 0;
    this.y = 0;
  }

  manhattanDist(pos) {
    return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y);
  }

  equals(pos) {
    return pos.x === this.x && pos.y === this.y;
  }
}

export function randInRange(a, b) {
  return Math.floor(Math.random() * (a - b + 1)) + b;
}

export const Direction = {
  Up: 1,
  Down: 2,
  Left: 3,
  Right: 4,
};
