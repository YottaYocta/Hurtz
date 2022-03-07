import Context, { Resources } from "./context";
import Audio from "./audio";
import Sequence from "./sequence";
import Entity from "./entity";
import { Direction } from "./utils";

export default class Game {
  constructor() {
    this.mapWidth = 16;
    this.mapHeight = 8;

    // graphics

    this.ctx = new Context(this.mapWidth, this.mapHeight);

    // audio

    this.audio = new Audio(Math.floor(Math.random() * 100) + 200);
    this.sequence = new Sequence();
    this.sequence.createMeasure();

    window.addEventListener("resize", () => {
      this.ctx.updateDimensions();
    });
    window.addEventListener("keydown", this.processKey.bind(this));

    this.setMode(GameMode.Start);
  }

  reset() {
    this.ctx.reset();
    Entity.entities.clear();
    this.player = new Entity(
      0,
      0,
      this.ctx.createSprite(Resources.wizard),
      this.updateUI.bind(this)
    );
  }

  processKey(e) {
    switch (this.mode) {
      case GameMode.Start:
        {
          window.requestAnimationFrame(this.tick.bind(this));
          this.setMode(GameMode.Play);
          this.reset();
        }
        break;
      case GameMode.Play:
        {
          switch (e.key) {
            case "h":
              {
                this.scheduleMove(this.player, Direction.Left);
              }
              break;
            case "j":
              {
                this.scheduleMove(this.player, Direction.Down);
              }
              break;
            case "k":
              {
                this.scheduleMove(this.player, Direction.Up);
              }
              break;
            case "l":
              {
                this.scheduleMove(this.player, Direction.Right);
              }
              break;
            case "q":
              {
                this.setMode(GameMode.Reset);
              }
              break;
          }
        }
        break;
      case GameMode.Reset:
        {
          this.reset();
          this.setMode(GameMode.Play);
          window.requestAnimationFrame(this.tick.bind(this));
        }
        break;
    }
  }

  nextTurn() {
    this.moveEntities();
  }

  moveEntities() {
    for (let [position, entity] of Entity.entities) {
      entity.move();
      if (entity.position.x < 0)
        entity.position = { x: 0, y: entity.position.y };
      if (entity.position.y < 0)
        entity.position = { x: entity.position.x, y: 0 };
      if (entity.position.y >= this.mapHeight)
        entity.position = { x: entity.position.x, y: this.mapHeight - 1 };
      if (entity.position.x >= this.mapWidth)
        entity.position = { x: this.mapWidth - 1, y: entity.position.y };
    }
  }

  updateUI() {
    let output = "";
    if (this.player.target.x > 0) {
      output += `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevrons-right" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <polyline points="7 7 12 12 7 17" />
  <polyline points="13 7 18 12 13 17" />
</svg> ${this.player.target.x}`;
    } else if (this.player.target.x < 0) {
      output += `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevrons-left" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <polyline points="11 7 6 12 11 17" />
  <polyline points="17 7 12 12 17 17" />
</svg> ${Math.abs(this.player.target.x)}`;
    }

    output += "\n";

    if (this.player.target.y > 0) {
      output += `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevrons-down" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <polyline points="7 7 12 12 17 7" />
  <polyline points="7 13 12 18 17 13" />
</svg> ${this.player.target.y}`;
    } else if (this.player.target.y < 0) {
      output += `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-chevrons-up" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <polyline points="7 11 12 6 17 11" />
  <polyline points="7 17 12 12 17 17" />
</svg> ${Math.abs(this.player.target.y)}`;
    }

    this.ctx.write(output);
  }

  setMode(mode) {
    switch (mode) {
      case GameMode.Start:
        {
          this.ctx.write("PRESS ANY KEY TO BEGIN");
          this.audio.stop();
        }
        break;
      case GameMode.Play:
        {
          this.ctx.write("USE VIKEYS OR WASD TO MOVE");
          this.audio.start(this.sequence, this.nextTurn.bind(this));
        }
        break;
      case GameMode.Reset: {
        this.ctx.write("PRESS ANY KEY TO PLAY AGAIN");
        this.audio.stop();
      }
    }
    this.mode = mode;
  }

  tick() {
    switch (this.mode) {
      case GameMode.Start:
        {
        }
        break;
      case GameMode.Play:
        {
          this.updateScene();
          window.requestAnimationFrame(this.tick.bind(this));
        }
        break;
      case GameMode.Reset:
        {
        }
        break;
    }
  }

  updateScene() {
    for (let [position, entity] of Entity.entities) {
      this.ctx.updateSprite(
        entity.position.x,
        entity.position.y,
        entity.sprite
      );
    }
  }

  scheduleMove(entity, direction) {
    switch (direction) {
      case Direction.Left:
        {
          if (entity.position.x > 0)
            entity.target = { x: entity.target.x - 1, y: entity.target.y };
        }
        break;
      case Direction.Down:
        {
          if (entity.position.y < this.mapHeight - 1)
            entity.target = { x: entity.target.x, y: entity.target.y + 1 };
        }
        break;
      case Direction.Up:
        {
          if (entity.position.y > 0)
            entity.target = { x: entity.target.x, y: entity.target.y - 1 };
        }
        break;
      case Direction.Right:
        {
          if (entity.position.x < this.mapWidth - 1)
            entity.target = { x: entity.target.x + 1, y: entity.target.y };
        }
        break;
    }
  }
}

const GameMode = {
  Start: 1,
  Play: 2,
  Reset: 3,
};
