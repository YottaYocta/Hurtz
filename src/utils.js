export default class Position {
  constructor(x, y) {
    this.x = typeof x === "number" ? x : 0;
    this.y = typeof y === "number" ? y : 0;
  }

  set(x) {
    this.x = x;
    this.y = x;
  }

  zero() {
    this.x = 0;
    this.y = 0;
  }
}

export const Direction = {
  Up: 1,
  Down: 2,
  Left: 3,
  Right: 4,
};
