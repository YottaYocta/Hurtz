import * as PIXI from "pixi.js";
import wizardUrl from "../assets/wizard.png";

export default class Context {
  constructor(width, height) {
    // pixi.js context

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.app = new PIXI.Application({ backgroundColor: 0x3c3836 });
    this.app.autoDensity = true;
    document.body.appendChild(this.app.view);
    this.app.view.classList.add("canvas");

    // output console

    this.outputContainer = document.createElement("div");
    this.outputConsole = document.createElement("p");
    this.outputContainer.appendChild(this.outputConsole);
    this.outputContainer.classList.add('console');
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

    this.updateDimensions();

    this.reset();
  }

  reset() {
    // graphics context
    this.app.stage.removeChildren();
  }

  updateDimensions() {
    let sw = window.innerWidth / 1.2;
    let sh = window.innerHeight / 1.2;
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

  updateSprite(x, y, sprite) {
    if (sprite !== null && sprite !== undefined) {
      sprite.width = this.tileSize;
      sprite.height = this.tileSize;
      x *= this.targetTileSize;
      x += this.targetTileSize / 2;
      y *= this.targetTileSize;
      y += this.targetTileSize / 2;
      if (Math.abs(x - sprite.x) > 1 || Math.abs(y - sprite.y) > 1) {
        let diffX = x - sprite.x;
        let diffY = y - sprite.y;
        sprite.x += diffX / 3;
        sprite.y += diffY / 3;
      }
    }
  }

  setSprite(x, y, sprite) {
    if (sprite !== null && sprite !== undefined) {
      sprite.width = this.targetTileSize;
      sprite.height = this.targetTileSize;
      x *= this.targetTileSize;
      x += this.targetTileSize / 2;
      y *= this.targetTileSize;
      y += this.targetTileSize / 2;
      sprite.x = x;
      sprite.y = y;
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

export const Icons = {
  Up: `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevrons-up" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#928374" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <polyline points="7 11 12 6 17 11" />
  <polyline points="7 17 12 12 17 17" />
</svg>`,
  Down: `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevrons-down" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#928374" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <polyline points="7 7 12 12 17 7" />
  <polyline points="7 13 12 18 17 13" />
</svg>`,
  Left: `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevrons-left" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#928374" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <polyline points="11 7 6 12 11 17" />
  <polyline points="17 7 12 12 17 17" />
</svg>`,
  Right: `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevrons-right" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#928374" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <polyline points="7 7 12 12 7 17" />
  <polyline points="13 7 18 12 13 17" />
</svg>`,
};
