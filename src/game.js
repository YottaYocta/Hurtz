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
    this.player = new Entity(0, 0, this.ctx.createSprite(Resources.wizard));
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
                this.moveEntity(this.player, Direction.Left);
              }
              break;
            case "j":
              {
                this.moveEntity(this.player, Direction.Down);
              }
              break;
            case "k":
              {
                this.moveEntity(this.player, Direction.Up);
              }
              break;
            case "l":
              {
                this.moveEntity(this.player, Direction.Right);
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
          this.audio.start(this.sequence);
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

  moveEntity(entity, direction) {
    switch (direction) {
      case Direction.Left:
        {
          if (entity.position.x > 0) entity.position.x--;
        }
        break;
      case Direction.Down:
        {
          if (entity.position.y < this.mapHeight - 1) entity.position.y++;
        }
        break;
      case Direction.Up:
        {
          if (entity.position.y > 0) entity.position.y--;
        }
        break;
      case Direction.Right:
        {
          if (entity.position.x < this.mapWidth - 1) entity.position.x++;
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
