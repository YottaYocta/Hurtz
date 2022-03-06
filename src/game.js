import Context, { Resources } from "./context";
import Entity from "./entity";
import { Direction } from "./utils";

export default class Game {
  constructor() {
    this.mapWidth = 16;
    this.mapHeight = 8;
    this.mode = GameMode.Start;

    this.startNotification = document.createElement('div');
    this.startNotification.innerHTML = `
        <h1>PRESS ANY KEY TO BEGIN</h1>
    `;

    this.resetNotification = document.createElement('div');
    this.resetNotification.innerHTML = `
      <h1>YOU DIED. PRESS ANY KEY TO PLAY AGAIN</h1>
    `;

    document.body.appendChild(this.startNotification);

    window.addEventListener("resize", () => {
      this.ctx.updateDimensions();
    });
    window.addEventListener("keydown", this.processKey.bind(this));

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
          document.body.removeChild(this.startNotification);
          this.mode = GameMode.Play;
          this.ctx = new Context(this.mapWidth, this.mapHeight);
          this.reset();
          window.requestAnimationFrame(this.tick.bind(this));
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
              this.mode = GameMode.Reset;
              document.body.appendChild(this.resetNotification);
            }; break;
          }
        }
        break;
      case GameMode.Reset:
        {
          document.body.removeChild(this.resetNotification);
          this.reset();
          this.mode = GameMode.Play;
          window.requestAnimationFrame(this.tick.bind(this));
        }
        break;
    }
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
