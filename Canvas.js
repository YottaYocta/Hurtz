import * as PIXI from "pixi.js";
import spritesheetData from "./assets/spritesheet.json";
import spritesheet from "./assets/spritesheet.png";

export default class Canvas {
  #canvas = new PIXI.Application({ backgroundColor: 0x000000 });

  #appContainer = document.createElement("div");
  #canvasContainer = document.createElement("div");
  #infoContainer = document.createElement("div");
  #aspect_ratio = 1;

  #uiId = 0;

  #spritesheet = new PIXI.Spritesheet(
    PIXI.BaseTexture.from("./assets/" + spritesheetData.meta.image),
    spritesheetData
  );

  async setup() {
    document.body.appendChild(this.#appContainer);
    this.#appContainer.appendChild(this.#canvasContainer);
    this.#appContainer.appendChild(this.#infoContainer);
    this.#canvasContainer.appendChild(this.#canvas.view);
    this.#appContainer.classList.add("app");
    this.#canvasContainer.classList.add("canvas");
    this.#infoContainer.classList.add("info");
    this.#canvas.renderer.resize(600, 600);

    await this.#spritesheet.parse();
  }

  get base() {
    return this.#infoContainer;
  }

  createSprite(spriteName) {
    let sprite = new PIXI.Sprite(this.#spritesheet.textures[spriteName]);
    this.#canvas.stage.addChild(sprite);
    return sprite;
  }

  createButton(text, callback) {
    let newButton = document.createElement("button");
    newButton.addEventListener("click", callback);
    newButton.innerText = text;
    newButton.id = "button" + this.uiId;
    return newButton;
  }

  addUINode(base, child) {
    base.appendChild(child);
  }
}
