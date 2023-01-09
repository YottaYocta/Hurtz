import "./style.css";
import * as Tone from "tone";
import Canvas from "./Canvas";

let context = new Canvas();
await context.setup();

let startButton = context.createButton("click to start", (e) => {
  Tone.start();
  console.log("tone_started!");
  context.createSprite("wizard");
  e.target.remove();
});

context.addUINode(context.base, startButton);

class GameState {
  constructor() {}
}
