import Context, { Resources, Icons } from "./context";
import Audio from "./audio";
import Sequence, { Instrument } from "./sequence";
import Entity, {Arena} from "./entity";
import { Direction } from "./utils";
import PulseManager, { PulseType } from "./pulse";

export default class Game {
  constructor() {

    this.mapWidth = 16;
    this.mapHeight = 8;
    this.map = new Arena(this.mapWidth, this.mapHeight);

    // graphics

    this.ctx = new Context(this.mapWidth, this.mapHeight);
    this.pulseManager = new PulseManager();

    // audio

    this.audio = new Audio(Math.floor(Math.random() * 50) + 250);
    this.sequence = new Sequence();

    window.addEventListener("resize", () => {
      this.ctx.updateDimensions();
    });
    window.addEventListener("keydown", this.processKey.bind(this));

    this.setMode(GameMode.Start);
  }

  reset() {
    this.ctx.reset();
    this.audio.reset(Math.floor(Math.random() * 50) + 250);
    this.pulseManager.reset();

    Entity.entities = [];
    this.map.clear();

    this.player = new Entity(
      Math.floor(Math.random() * this.mapWidth),
      Math.floor(Math.random() * this.mapHeight),
      this.ctx.createSprite(Resources.Wizard),
      this.playerChanged.bind(this),
      this.map,
    );

    this.sequence.reset();
    this.sequence.createBass();
  }

  // RENDERING

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
    for (let entity of Entity.entities) {
      this.ctx.updateSprite(
        entity.position.x,
        entity.position.y,
        entity.sprite
      );
    }
    this.ctx.updateTileSize();
    this.pulseManager.updatePulses();
  }

  // INPUT AND TURNS

  processKey(e) {
    switch (this.mode) {
      case GameMode.Start:
        {
          window.requestAnimationFrame(this.tick.bind(this));
          this.setMode(GameMode.Play);
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
          this.setMode(GameMode.Play);
          window.requestAnimationFrame(this.tick.bind(this));
        }
        break;
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

  moveEntities() {
    for (let entity of Entity.entities) {
      entity.move();
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
        }
        break;
      case GameMode.Play:
        {
          this.reset();
          this.audio.start(
            this.sequence,
            this.handlePulse.bind(this),
            this.handleNote.bind(this)
          );
          this.nextLevel();
        }
        break;
      case GameMode.Reset:
        {
          this.ctx.write("PRESS ANY KEY TO PLAY AGAIN");
          this.reset();
        }
        break;
    }
    this.mode = mode;
  }

  handlePulse() {
    this.moveEntities();
    this.pulseEntities();
  }

  pulseEntities() {
    this.ctx.tileSize += 6;
  }

  handleNote(note) {
    switch (note.instrument) {
      case Instrument.BassBasic:
        {
          this.spawnPulse(PulseType.Axis, 1);
        }
        break;
    }
  }

  spawnPulse(type, range) {
    switch (type) {
      case PulseType.Axis:
        {
          for (
            let i = this.player.position.x - range;
            i < this.player.position.x;
            i++
          ) {
            this.createPulse({ x: i, y: this.player.position.y });
          }
          for (
            let i = this.player.position.x + 1;
            i <= this.player.position.x + range;
            i++
          ) {
            this.createPulse({ x: i, y: this.player.position.y });
          }
          for (
            let i = this.player.position.y - range;
            i < this.player.position.y;
            i++
          ) {
            this.createPulse({ x: this.player.position.x, y: i });
          }
          for (
            let i = this.player.position.y + 1;
            i <= this.player.position.y + range;
            i++
          ) {
            this.createPulse({ x: this.player.position.x, y: i });
          }
        }
        break;
    }
  }

  createPulse(position) {
    if (
      position.x < 0 ||
      position.x >= this.mapWidth ||
      position.y < 0 ||
      position.y >= this.mapHeight
    )
      return;
    let sprite = this.pulseManager.usePulse();
    if (!sprite) {
      sprite = this.ctx.createSprite(Resources.Orange);
      this.pulseManager.add(sprite);
    }
    sprite.alpha = 1;
    this.ctx.setSprite(position.x, position.y, sprite);
    this.damageAt(position, 10);
  }

  // ENEMIES AND COMBAT

  playerChanged() {
    this.updateUI();
  }

  spawnEnemies(num) {
    for (let i = 0; i < num; i++) {
      let pos = this.map.getEmpty();
      let enemy = new Entity(pos.x, pos.y, this.ctx.createSprite(Resources.Ghoul), this.entityChanged.bind(this), this.map); 
    }
  }

  entityChanged() {
    for (let entity of Entity.entities) {
      if (entity.health <= 0)
        this.killEntity(entity);
    }

    if (Entity.entities.length === 1 & Entity.entities[0] === this.player) {
      this.nextLevel();
    }
  }

  damageAt(position, damage) {
    if (this.map.grid[position.y][position.x] !== null) {
    console.log(position);
      this.map.grid[position.y][position.x].damage(damage);
    }
  }

  killEntity(entity) {
    let index = Entity.entities.indexOf(entity);
    if (index > -1) {
      Entity.entities.splice(index, 1);
    }
    if (entity.sprite) {
      entity.sprite.alpha = 0.4;
    }
    this.map.grid[entity.position.y][entity.position.x] = null;
  }

  nextLevel() {
    this.ctx.clean();
    this.ctx.removeAll(this.pulseManager.pulses);
    this.pulseManager.reset();
    this.spawnEnemies(2);
    this.audio.reset();
    this.audio.start(this.sequence, this.handlePulse.bind(this), this.handleNote.bind(this));
  }
}

const GameMode = {
  Start: 1,
  Shop: 2,
  Play: 3,
  Reset: 4,
};
