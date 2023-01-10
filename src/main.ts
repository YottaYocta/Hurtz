import "./style.css";
import * as PIXI from "pixi.js";
import spritesheetInfo from "../assets/spritesheet.json";
import { SCALE_MODES } from "pixi.js";

class Engine {
  private container = document.createElement("div");
  private app = new PIXI.Application({
    width: 600,
    height: 600,
    background: 0x333333,
  });
  private spritesheet = new PIXI.Spritesheet(
    PIXI.BaseTexture.from("../assets/" + spritesheetInfo.meta.image),
    spritesheetInfo
  );

  constructor(public width = 512, public height = 512, public bpm = 100) {
    this.spritesheet.baseTexture.scaleMode = SCALE_MODES.NEAREST;

    document.body.appendChild(this.container);
    window.addEventListener("resize", this.customResize.bind(this));

    let basePercentage = 90;
    let containerHeight = (basePercentage * this.height) / this.width;
    let containerMaxWidth = (basePercentage * this.width) / this.height;
    this.container.style.width = `${basePercentage}vw`;
    this.container.style.height = `${containerHeight}vw`;
    this.container.style.maxHeight = `${basePercentage}vh`;
    this.container.style.maxWidth = `${containerMaxWidth}vh`;
    this.container.style.overflow = "hidden";
    this.container.classList.add("container");
    this.container.appendChild(this.app.view as unknown as Node);
    this.app.resizeTo = this.container;
    this.customResize();
  }

  async setup() {
    this.spritesheet.parse();
  }

  customResize() {
    this.app.resize();
    this.app.stage.scale.set(
      Math.min(
        this.container.offsetHeight / this.height,
        this.container.offsetWidth / this.width
      )
    );
  }

  createSprite(name: String): PIXI.Sprite {
    let newSprite = new PIXI.Sprite(this.spritesheet.textures[`${name}`]);
    this.app.stage.addChild(newSprite);
    return newSprite;
  }
}

let engine = new Engine();
await engine.setup();

let sprite = engine.createSprite("wizard");
