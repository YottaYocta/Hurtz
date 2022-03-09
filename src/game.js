import Context, { Resources, Icons } from "./context";
import Audio from "./audio";
import Sequence, { Instrument } from "./sequence";
import Entity, {Arena} from "./entity";
import Position, { Direction } from "./utils";
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
      new Position(Math.floor(Math.random() * this.mapWidth),
      Math.floor(Math.random() * this.mapHeight)),
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
        entity.position,
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
            entity.target = entity.target.add(-1, 0);
        }
        break;
      case Direction.Down:
        {
          if (entity.position.y < this.mapHeight - 1)
            entity.target = entity.target.add(0, 1);
        }
        break;
      case Direction.Up:
        {
          if (entity.position.y > 0)
            entity.target = entity.target.add(0, -1);
        }
        break;
      case Direction.Right:
        {
          if (entity.position.x < this.mapWidth - 1)
            entity.target = entity.target.add(1, 0);
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
    
    output += `
      ${Icons.Heart} ${this.player.health}
    `;

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
        }
        break;
    }
    this.mode = mode;
  }

  handlePulse() {
    this.enemyAI();
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
    this.ctx.setSprite(position, sprite);
    this.damageAt(position, Math.random() * 5 + 6);
  }

  // ENEMIES AND COMBAT

  enemyAI() {
    for (let entity of Entity.entities.filter(entity => entity !== this.player)) {
      if (entity.position.x < this.player.position.x)
        entity.target = entity.target.add(1, 0);
      else if (entity.position.x > this.player.position.x)
        entity.target = entity.target.add(-1, 0);

      if (entity.position.y < this.player.position.y)
        entity.target = entity.target.add(0, 1);
      else if (entity.position.y > this.player.position.y)
        entity.target = entity.target.add(0, -1);

      if (entity.position.manhattanDist(this.player.position) <= 1) {
        this.damageAt(this.player.position, 3);
      }
    }
  }

  playerChanged() {
    if (this.player.health <= 0) 
      this.setMode(GameMode.Reset);
    else
      this.updateUI();
  }

  spawnEnemies(num) {
    for (let i = 0; i < num; i++) {
      let pos = this.map.getEmpty();
      let enemy = new Entity(pos, this.ctx.createSprite(Resources.Ghoul), this.entityChanged.bind(this), this.map); 
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
      this.map.grid[position.y][position.x].damage(damage);
    }
  }

  killEntity(entity) {
    let index = Entity.entities.indexOf(entity);
    if (index > -1) {
      Entity.entities.splice(index, 1);
    }
    if (entity.sprite) {
      entity.sprite.alpha = 0.3;
      this.ctx.scheduleRemove(entity.sprite);
    }
    this.map.grid[entity.position.y][entity.position.x] = null;
  }

  nextLevel() {
    this.ctx.clean();
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
