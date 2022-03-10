import Context, { Resources, Icons, Colors } from "./context";
import Audio from "./audio";
import Sequence, { Instrument, createBass } from "./sequence";
import Entity, { Arena, EntityType } from "./entity";
import Position, { Direction } from "./utils";
import PulseManager, { PulseType } from "./pulse";

export default class Game {
  constructor() {
    this.mapWidth = 16;
    this.mapHeight = 8;
    this.map = new Arena(this.mapWidth, this.mapHeight);
    this.round = 0;
    this.player = null;
    this.selectedEntity = null;

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
    this.round = 0;

    this.player = new Entity(
      new Position(
        Math.floor(Math.random() * this.mapWidth),
        Math.floor(Math.random() * this.mapHeight)
      ),
      this.ctx.createSprite(Resources.Wizard),
      this.entityChanged.bind(this),
      this.map,
      EntityType.Player
    );

    this.nextFocus();

    this.sequence.reset();
    this.sequence.bass = createBass(this.round);
  }

  // RENDERING

  tick() {
    switch (this.mode) {
      case GameMode.Play:
        {
          this.updateScene();
          window.requestAnimationFrame(this.tick.bind(this));
        }
        break;
    }
  }

  updateScene() {
    for (let entity of Entity.entities) {
      this.ctx.updateSprite(entity.position, entity.sprite);
    }
    this.ctx.updateTileSize();
    this.pulseManager.updatePulses();
  }

  clearTint(entity) {
    if (entity.sprite) {
      switch (entity.type) {
        default:
          {
            entity.sprite.tint = Colors.Mid;
          }
          break;
      }
    }
  }

  // INPUT AND TURNS

  processKey(e) {
    e.preventDefault();
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
            case "ArrowLeft":
            case "h":
              {
                this.scheduleMove(this.player, Direction.Left);
              }
              break;
            case "ArrowDown":
            case "j":
              {
                this.scheduleMove(this.player, Direction.Down);
              }
              break;
            case "ArrowUp":
            case "k":
              {
                this.scheduleMove(this.player, Direction.Up);
              }
              break;
            case "ArrowRight":
            case "l":
              {
                this.scheduleMove(this.player, Direction.Right);
              }
              break;
            case "q":
              {
                this.nextFocus(true);
              }
              break;
            case "Q":
              {
                this.nextFocus(false);
              }
              break;
          }
        }
        break;
      case GameMode.Reset:
        {
          this.setMode(GameMode.Play);
          this.audio.stop();
          window.requestAnimationFrame(this.tick.bind(this));
        }
        break;
    }
  }

  scheduleMove(entity, direction) {
    switch (direction) {
      case Direction.Left:
        {
          if (entity.position.x > 0) entity.target = entity.target.add(-1, 0);
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
          if (entity.position.y > 0) entity.target = entity.target.add(0, -1);
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

  nextFocus(forward) {
    if (Entity.entities.length > 0) {
      let index = Entity.entities.indexOf(this.selectedEntity);
      if (index >= 0) {
        if (forward) index++;
        else index--;
        if (index < 0) index = Entity.entities.length - 1;
        else index %= Entity.entities.length;
        this.clearTint(this.selectedEntity);
        this.selectedEntity = Entity.entities[index];
      } else {
        this.selectedEntity = this.player;
      }
      this.selectedEntity.sprite.tint = Colors.Light;
      this.updateUI();
    }
  }

  updateUI() {
    let statusBar = "";

    statusBar += `
      ${Icons.Heart} ${this.selectedEntity.health}
    `;

    if (this.selectedEntity.target.x > 0) {
      statusBar += `${Icons.Right}
                  ${this.selectedEntity.target.x}`;
    } else if (this.selectedEntity.target.x < 0) {
      statusBar += `${Icons.Left}
                  ${Math.abs(this.selectedEntity.target.x)}`;
    }

    statusBar += "\n";

    if (this.selectedEntity.target.y > 0) {
      statusBar += `${Icons.Down}
                  ${this.selectedEntity.target.y}`;
    } else if (this.selectedEntity.target.y < 0) {
      statusBar += `${Icons.Up}
                  ${Math.abs(this.selectedEntity.target.y)}`;
    }

    let name = this.selectedEntity ? this.selectedEntity.type.name : "";

    let description = this.selectedEntity
      ? this.selectedEntity.type.description
      : "";

    this.ctx.write([name, statusBar, description]);
  }

  setMode(mode) {
    switch (mode) {
      case GameMode.Start:
        {
          this.ctx.write(["PRESS ANY KEY TO BEGIN"]);
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
          this.nextRound();
        }
        break;
      case GameMode.Reset:
        {
          this.ctx.write(["PRESS ANY KEY TO PLAY AGAIN"]);
          this.audio.stop();
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

  handleNote(note) {
    if (this.round % 2 === 0) {
      this.spawnPulse(this.player.position, PulseType.Cross, 1);
    } else {
      switch (note.instrument) {
        case Instrument.BassBasic:
          {
            this.spawnPulse(this.player.position, PulseType.Axis, 1);
          }
          break;
      }
    }
  }

  pulseEntities() {
    this.ctx.tileSize += 6;
  }

  spawnPulse(position, type, range) {
    switch (type) {
      case PulseType.Axis:
        {
          for (let i = position.x - range; i < position.x; i++) {
            this.createPulse({ x: i, y: position.y });
          }
          for (let i = position.x + 1; i <= position.x + range; i++) {
            this.createPulse({ x: i, y: position.y });
          }
          for (let i = position.y - range; i < position.y; i++) {
            this.createPulse({ x: position.x, y: i });
          }
          for (let i = position.y + 1; i <= position.y + range; i++) {
            this.createPulse({ x: position.x, y: i });
          }
        }
        break;
      case PulseType.Cross: {
        for (let i = 0; i < range; i++) {
          this.createPulse(
            { x: position.x - range + i, y: position.y - range + i },
            1
          );
          this.createPulse(
            { x: position.x + range - i, y: position.y + range - i },
            1
          );
          this.createPulse(
            { x: position.x - range + i, y: position.y + range - i },
            1
          );
          this.createPulse(
            { x: position.x + range - i, y: position.y - range + i },
            1
          );
        }
      }
    }
  }

  createPulse(position, damage) {
    damage = damage || 1;
    if (
      position.x < 0 ||
      position.x >= this.mapWidth ||
      position.y < 0 ||
      position.y >= this.mapHeight
    )
      return;
    let sprite = this.pulseManager.usePulse();
    if (!sprite) {
      sprite = this.ctx.createSprite(Resources.Eye, Colors.Orange);
      this.pulseManager.add(sprite);
    }
    sprite.alpha = 1;
    this.ctx.setSprite(position, sprite);
    this.damageAt(position, damage);
  }

  // ENEMIES AND COMBAT

  enemyAI() {
    for (let entity of Entity.entities.filter(
      (entity) => entity !== this.player && entity.type !== EntityType.NewBass
    )) {
      if (entity.position.manhattanDist(this.player.position) <= 1) {
        this.damageAt(this.player.position, 3);
        continue;
      }

      if (entity.position.x < this.player.position.x)
        entity.target = entity.target.add(1, 0);
      else if (entity.position.x > this.player.position.x)
        entity.target = entity.target.add(-1, 0);

      if (entity.position.y < this.player.position.y)
        entity.target = entity.target.add(0, 1);
      else if (entity.position.y > this.player.position.y)
        entity.target = entity.target.add(0, -1);
    }
  }

  spawnEntities() {
    if (this.round % 2 === 0) {
      let a = new Position(1, 1);
      let b = new Position(1, this.mapHeight - 2);
      let c = new Position(this.mapWidth - 2, this.mapHeight - 2);
      let d = new Position(this.mapWidth - 2, 1);
      let enhancementA = new Entity(
        a,
        this.ctx.createSprite(Resources.Eye),
        this.entityChanged.bind(this),
        this.map,
        EntityType.NewBass
      );
      let enhancementB = new Entity(
        b,
        this.ctx.createSprite(Resources.Eye),
        this.entityChanged.bind(this),
        this.map,
        EntityType.NewBass
      );
      let enhancementC = new Entity(
        c,
        this.ctx.createSprite(Resources.Eye),
        this.entityChanged.bind(this),
        this.map,
        EntityType.NewBass
      );
      let enhancementD = new Entity(
        d,
        this.ctx.createSprite(Resources.Eye),
        this.entityChanged.bind(this),
        this.map,
        EntityType.NewBass
      );
    } else {
      for (let i = 0; i < this.round / 2 + 1; i++) {
        let pos = this.map.getEmpty();
        let enemy = new Entity(
          pos,
          this.ctx.createSprite(Resources.Ghoul),
          this.entityChanged.bind(this),
          this.map,
          EntityType.Ghoul
        );
      }
    }
  }

  entityChanged(entity) {
    if (!this.player) {
      this.ctx.write(["PRESS ANY KEY TO START GAME"]);
      return;
    }
    if (this.player.health <= 0) {
      this.ctx.write(["PRESS ANY KEY TO PLAY AGAIN"]);
      this.setMode(GameMode.Reset);
      return;
    }
    if (entity.health <= 0) {
      this.killEntity(entity);
    }
    this.updateUI();
  }

  damageAt(position, damage) {
    if (this.map.grid[position.y][position.x] !== null) {
      this.map.grid[position.y][position.x].damage(damage);
    }
  }

  killEntity(entity) {
    // Entity removal

    let index = Entity.entities.indexOf(entity);
    if (index > -1) {
      Entity.entities.splice(index, 1);
    }

    if (entity.sprite) {
      entity.sprite.alpha = 0.3;
      this.ctx.scheduleRemove(entity.sprite);
    }

    this.map.grid[entity.position.y][entity.position.x] = null;
    if ((this.selectedEntity = entity)) {
      this.nextFocus();
    }

    if ((Entity.entities.length === 1) & (Entity.entities[0] === this.player)) {
      this.nextRound();
    }
  }

  nextRound() {
    this.round++;
    this.ctx.clean();
    this.spawnEntities(2);
    this.audio.reset();
    setTimeout(() => {
      if (this.round % 2 === 0) {
        this.sequence;
      } else {
      }
      this.audio.start(
        this.sequence,
        this.handlePulse.bind(this),
        this.handleNote.bind(this)
      );
    }, 500);
  }
}

const GameMode = {
  Start: 1,
  Shop: 2,
  Play: 3,
  Reset: 4,
};
