import * as PIXI from "pixi.js";
import Position from "./utils";
import wizardUrl from "../assets/wizard.png";
import orangeUrl from "../assets/orange.png";
import ghoulUrl from "../assets/ghoul.png";

export default class Context {
  constructor(width, height) {
    // pixi.js context

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.app = new PIXI.Application({ backgroundColor: 0x3b324a });
    this.app.autoDensity = true;
    document.body.appendChild(this.app.view);
    this.app.view.classList.add("canvas");

    // output console

    this.outputContainer = document.createElement("div");
    this.outputConsole = document.createElement("p");
    this.outputContainer.appendChild(this.outputConsole);
    this.outputContainer.classList.add("console");
    document.body.appendChild(this.outputContainer);

    // dimensions

    this.mapWidth = width;
    this.mapHeight = height;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.zeroX = 0;
    this.zeroY = 0;
    this.tileSize = 0;
    this.targetTileSize = 0;

    this.morgue = [];

    this.updateDimensions();

    this.reset();
  }

  reset() {
    this.app.stage.removeChildren();
  }

  updateDimensions() {
    let sw = window.innerWidth / 2;
    let sh = window.innerHeight / 2;
    if (sw !== 0 && sh !== 0) {
      if (this.mapWidth / this.mapHeight < sw / sh) {
        this.canvasHeight = sh;
        this.canvasWidth = sh * (this.mapWidth / this.mapHeight);
        this.targetTileSize = this.canvasHeight / this.mapHeight;
      } else {
        this.canvasHeight = sw / (this.mapWidth / this.mapHeight);
        this.canvasWidth = sw;
        this.targetTileSize = this.canvasWidth / this.mapWidth;
      }
      this.app.renderer.resize(this.canvasWidth, this.canvasHeight);
    }
  }

  updateSprite(position, sprite) {
    position = new Position(position.x, position.y);
    if (sprite !== null && sprite !== undefined) {
      sprite.width = this.tileSize;
      sprite.height = this.tileSize;
      position.x *= this.targetTileSize;
      position.x += this.targetTileSize / 2;
      position.y *= this.targetTileSize;
      position.y += this.targetTileSize / 2;
      if (
        Math.abs(position.x - sprite.x) > 1 ||
        Math.abs(position.y - sprite.y) > 1
      ) {
        let diffX = position.x - sprite.x;
        let diffY = position.y - sprite.y;
        sprite.x += diffX / 3;
        sprite.y += diffY / 3;
      }
    }
  }

  setSprite(position, sprite) {
    position = new Position(position.x, position.y);
    if (sprite !== null && sprite !== undefined) {
      sprite.width = this.targetTileSize;
      sprite.height = this.targetTileSize;
      position.x *= this.targetTileSize;
      position.x += this.targetTileSize / 2;
      position.y *= this.targetTileSize;
      position.y += this.targetTileSize / 2;
      sprite.x = position.x;
      sprite.y = position.y;
    }
  }

  updateTileSize() {
    let diff = this.targetTileSize - this.tileSize;
    if (Math.abs(diff) > 0.1) {
      this.tileSize += diff / 5;
    }
  }

  createSprite(url) {
    const sprite = PIXI.Sprite.from(url);
    sprite.x = -100;
    sprite.y = -100;
    sprite.anchor.set(0.5);
    this.app.stage.addChild(sprite);
    return sprite;
  }

  write(text) {
    this.outputConsole.innerHTML = text;
  }

  scheduleRemove(sprite) {
    this.morgue.push(sprite);
  }

  clean() {
    for (let sprite of this.morgue) {
      this.app.stage.removeChild(sprite);
    }
  }

  removeAll(sprites) {
    for (let sprite of sprites) {
      this.app.stage.removeChild(sprite);
    }
  }
}

export const Resources = {
  Wizard: wizardUrl,
  Orange: orangeUrl,
  Ghoul: ghoulUrl,
};

export const Icons = {
  Up: `
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M7 16H5v-2h2v-2h2v-2h2V8h2v2h2v2h2v2h2v2h-2v-2h-2v-2h-2v-2h-2v2H9v2H7v2z" fill="currentColor"/> </svg>
`,
  Down: `
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M7 8H5v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2V8h-2v2h-2v2h-2v2h-2v-2H9v-2H7V8z" fill="currentColor"/> </svg>
`,
  Left: `
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M16 5v2h-2V5h2zm-4 4V7h2v2h-2zm-2 2V9h2v2h-2zm0 2H8v-2h2v2zm2 2v-2h-2v2h2zm0 0h2v2h-2v-2zm4 4v-2h-2v2h2z" fill="currentColor"/> </svg>
`,
  Right: `
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M8 5v2h2V5H8zm4 4V7h-2v2h2zm2 2V9h-2v2h2zm0 2h2v-2h-2v2zm-2 2v-2h2v2h-2zm0 0h-2v2h2v-2zm-4 4v-2h2v2H8z" fill="currentColor"/> </svg>
`,
  Heart: `
<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M9 2H5v2H3v2H1v6h2v2h2v2h2v2h2v2h2v2h2v-2h2v-2h2v-2h2v-2h2v-2h2V6h-2V4h-2V2h-4v2h-2v2h-2V4H9V2zm0 2v2h2v2h2V6h2V4h4v2h2v6h-2v2h-2v2h-2v2h-2v2h-2v-2H9v-2H7v-2H5v-2H3V6h2V4h4z" fill="currentColor"/> </svg>
  `,
};
