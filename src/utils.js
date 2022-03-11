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

export function randInUnitRange(min, max) {
  let radius = Math.random() * (max - min) + min;
  let angle = Math.random() * 2 * Math.PI;
  return new Position(radius * Math.cos(angle), radius * Math.sin(angle));
}

// from madbence's node-bresenham
// https://github.com/madbence/node-bresenham

export function bresenham(posA, posB) {
  let points = [];
  let dx = Math.round(posB.x) - Math.round(posA.x);
  let dy = Math.round(posB.y) - Math.round(posA.y);
  let adx = Math.abs(dx);
  let ady = Math.abs(dy);
  let eps = 0;
  let sx = dx > 0 ? 1 : -1;
  let sy = dy > 0 ? 1 : -1;
  if (adx > ady) {
    for (
      let x = posA.x, y = posA.y;
      sx < 0 ? x >= posB.x : x <= posB.x;
      x += sx
    ) {
      points.push(new Position(x, y));
      eps += ady;
      if (eps << 1 >= adx) {
        y += sy;
        eps -= adx;
      }
    }
  } else {
    for (
      let x = posA.x, y = posA.y;
      sy < 0 ? y >= posB.y : y <= posB.y;
      y += sy
    ) {
      points.push(new Position(x, y));
      eps += adx;
      if (eps << 1 >= ady) {
        x += sx;
        eps -= ady;
      }
    }
  }
  return points;
}

export const Direction = {
  Up: 1,
  Down: 2,
  Left: 3,
  Right: 4,
};
