import * as PIXI from "pixi.js";
import wizardUrl from "../assets/wizard.png";

export default class Context {
  constructor(width, height) {
    // pixi.js context

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.app = new PIXI.Application({ backgroundColor: 0xffffff });
    this.app.autoDensity = true;
    document.body.appendChild(this.app.view);
    this.app.view.classList.add("output");

    // output console

    this.outputContainer = document.createElement("div");
    this.outputConsole = document.createElement("p");
    this.outputContainer.appendChild(this.outputConsole);
    this.outputContainer.classList.add("output");
    document.body.appendChild(this.outputContainer);

    // dimensions

    this.mapWidth = width;
    this.mapHeight = height;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.zeroX = 0;
    this.zeroY = 0;
    this.tileSize = 0;
    this.updateDimensions();

    this.reset();
  }

  reset() {
    // graphics context
    this.app.stage.removeChildren();
  }

  updateDimensions() {
    let sw = window.innerWidth / 2;
    let sh = window.innerHeight / 2;
    if (sw !== 0 && sh !== 0) {
      if (this.mapWidth / this.mapHeight < sw / sh) {
        this.canvasHeight = sh;
        this.canvasWidth = sh * (this.mapWidth / this.mapHeight);
        this.tileSize = this.canvasHeight / this.mapHeight;
      } else {
        this.canvasHeight = sw / (this.mapWidth / this.mapHeight);
        this.canvasWidth = sw;
        this.tileSize = this.canvasWidth / this.mapWidth;
      }
      this.app.renderer.resize(this.canvasWidth, this.canvasHeight);
    }
  }

  updateSprite(x, y, sprite) {
    if (sprite !== null && sprite !== undefined) {
      sprite.width = this.tileSize;
      sprite.height = this.tileSize;
      x *= this.tileSize;
      x += this.tileSize / 2;
      y *= this.tileSize;
      y += this.tileSize / 2;
      if (Math.abs(x - sprite.x) > 1 || Math.abs(y - sprite.y) > 1) {
        let diffX = x - sprite.x;
        let diffY = y - sprite.y;
        sprite.x += diffX / 3;
        sprite.y += diffY / 3;
      }
    }
  }

  createSprite(url) {
    const sprite = PIXI.Sprite.from(url);
    sprite.anchor.set(0.5);
    this.app.stage.addChild(sprite);
    return sprite;
  }

  write(text) {
    this.outputConsole.innerHTML = text;
  }
}

export const Resources = {
  wizard: wizardUrl,
};
