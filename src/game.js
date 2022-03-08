import Context, { Resources, Icons } from "./context";
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
      output += `${Icons.Right}
                  ${this.player.target.x}`;
    } else if (this.player.target.x < 0) {
      output += `${Icons.Left}
                  ${Math.abs(this.player.target.x)}`;
    }

    output += "\n";

    if (this.player.target.y > 0) {
      output += `${Icons.Down}
                  ${this.player.target.y}`;
    } else if (this.player.target.y < 0) {
      output += `${Icons.Up}
                  ${Math.abs(this.player.target.y)}`;
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
