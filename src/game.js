import Context, { Resources, Icons, Colors } from "./context";
import Audio from "./audio";
import Sequence, {
  Instrument,
  createBass,
  extendRange,
  increaseDamage,
  createMelody,
} from "./sequence";
import Entity, { Arena, EntityType } from "./entity";
import Position, {
  Direction,
  randInRange,
  bresenham,
  randInUnitRange,
} from "./utils";
import PulseManager, { PulseType } from "./pulse";

export default class Game {
  constructor() {
    this.mapWidth = 16;
    this.mapHeight = 8;
    this.winDepth = 26;
    this.map = new Arena(this.mapWidth, this.mapHeight);
    this.depth = 0;
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
    this.audio.reset(
      Math.floor(Math.random() * 50) + 200,
      this.sequence,
      this.handlePulse.bind(this),
      this.handleNote.bind(this)
    );
    this.pulseManager.reset();

    Entity.entities = [];
    this.map.clear();
    this.depth = 0;

    this.player = new Entity(
      new Position(
        Math.floor(Math.random() * this.mapWidth),
        Math.floor(Math.random() * this.mapHeight)
      ),
      EntityType.Player,
      this.ctx.createSprite(Resources.Wizard),
      this.entityChanged.bind(this),
      this.map
    );

    this.nextFocus();

    this.sequence.reset();
    this.sequence.bass = createBass(this.depth, Instrument.BassBasic);
  }

  // RENDERING

  tick() {
    switch (this.mode) {
      case GameMode.Ascend:
      case GameMode.Tutorial:
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
          if (e.key === "T" || e.key == "t") this.setMode(GameMode.Tutorial);
          else if (e.key === " ") {
            this.setMode(GameMode.Play);
          }
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
            case ".":
              {
                this.clearTarget(this.player);
              }
              break;
          }
        }
        break;
      case GameMode.Tutorial:
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
            case ".":
              {
                this.clearTarget(this.player);
              }
              break;
            case " ":
              {
                if (this.mode.next()) {
                  if (this.mode.currentIndex() === 2) this.nextDepth();
                  this.updateUI();
                } else {
                  this.setMode(GameMode.Play);
                }
              }
              break;
          }
        }
        break;

      case GameMode.Ascend:
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

  clearTarget(entity) {
    entity.target = new Position();
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
    switch (this.mode) {
      case GameMode.Start:
        {
          this.ctx.write([
            "PRESS T [t/T] FOR A TUTORIAL AND SPACE [ ] TO BEGIN",
          ]);
        }
        break;
      case GameMode.Play:
        {
          let playerStatus = `Depth: ${this.depth}`;

          if (this.player.target.x > 0) {
            playerStatus += `  ${Icons.Right} ${this.player.target.x}`;
          } else if (this.player.target.x < 0) {
            playerStatus += `  ${Icons.Left} ${Math.abs(this.player.target.x)}`;
          }

          playerStatus += " ";

          if (this.player.target.y > 0) {
            playerStatus += `${Icons.Down} ${this.player.target.y}`;
          } else if (this.player.target.y < 0) {
            playerStatus += `${Icons.Up} ${Math.abs(this.player.target.y)}`;
          }

          let statusBar = "";

          statusBar += `${Icons.Heart} ${this.selectedEntity.health}`;

          let name = this.selectedEntity ? this.selectedEntity.type.name : "";

          let description = this.selectedEntity
            ? this.selectedEntity.type.description
            : "";

          this.ctx.write([playerStatus, name, statusBar, description]);
        }
        break;
      case GameMode.Reset:
        {
          this.ctx.write(["PRESS ANY KEY TO START NEW GAME"]);
        }
        break;
      case GameMode.Ascend:
        {
          this.clearTarget(this.player);
          this.ctx.write([
            "ABOMINATION EXTERMINATED. YOU HAVE ASCENDED TO THE ETERNAL REALM - CONGRATULATIONS. PRESS ANY KEY TO PLAY AGAIN.",
          ]);
        }
        break;
      case GameMode.Tutorial:
        {
          let playerStatus = "TUTORIAL ";
          let next = "SPACE [ ] FOR NEXT SECTION";

          if (this.player.target.x > 0) {
            playerStatus += `  ${Icons.Right} ${this.player.target.x}`;
          } else if (this.player.target.x < 0) {
            playerStatus += `  ${Icons.Left} ${Math.abs(this.player.target.x)}`;
          }

          playerStatus += " ";

          if (this.player.target.y > 0) {
            playerStatus += `${Icons.Down} ${this.player.target.y}`;
          } else if (this.player.target.y < 0) {
            playerStatus += `${Icons.Up} ${Math.abs(this.player.target.y)}`;
          }

          let info = GameMode.Tutorial.current();
          if (info) this.ctx.write([playerStatus, info, next]);
          else this.setMode(GameMode.Reset);
        }
        break;
    }
  }

  setMode(mode) {
    this.mode = mode;
    switch (mode) {
      case GameMode.Start:
        {
          this.updateUI();
        }
        break;
      case GameMode.Play:
        {
          this.reset();
          this.audio.start();
          this.nextDepth();
          this.updateUI();
        }
        break;
      case GameMode.Reset:
        {
          this.audio.stop();
          this.updateUI();
        }
        break;
      case GameMode.Ascend:
        {
          this.updateUI();
        }
        break;
      case GameMode.Tutorial: {
        this.reset();
        this.audio.start();
        this.updateUI();
      }
    }
  }

  handlePulse() {
    this.enemyAI();
    this.moveEntities();
    this.pulseEntities();
  }

  handleNote(note) {
    if (this.depth % 2 === 1) {
      this.spawnPulse(this.player.position, PulseType.Cross, 1, 2);
    } else {
      let pulseType = null;
      switch (note.instrument) {
        // BASS

        case Instrument.BassBasic:
          {
            pulseType = PulseType.Axis;
          }
          break;

        // SYNTH

        case Instrument.SynthDuo:
        case Instrument.SynthSaw:
        case Instrument.SynthBasic: {
          pulseType = PulseType.RandomLine;
        }
      }
      this.spawnPulse(this.player.position, pulseType, note.range, note.damage);
    }
  }

  pulseEntities() {
    this.ctx.tileSize += 6;
  }

  spawnPulse(position, type, range, damage) {
    switch (type) {
      case PulseType.Axis:
        {
          for (let i = position.x - range; i < position.x; i++) {
            this.createPulse({ x: i, y: position.y }, damage);
          }
          for (let i = position.x + 1; i <= position.x + range; i++) {
            this.createPulse({ x: i, y: position.y }, damage);
          }
          for (let i = position.y - range; i < position.y; i++) {
            this.createPulse({ x: position.x, y: i }, damage);
          }
          for (let i = position.y + 1; i <= position.y + range; i++) {
            this.createPulse({ x: position.x, y: i }, damage);
          }
        }
        break;
      case PulseType.Cross:
        {
          for (let i = 0; i < range; i++) {
            this.createPulse(
              { x: position.x - range + i, y: position.y - range + i },
              damage
            );
            this.createPulse(
              { x: position.x + range - i, y: position.y + range - i },
              damage
            );
            this.createPulse(
              { x: position.x - range + i, y: position.y + range - i },
              damage
            );
            this.createPulse(
              { x: position.x + range - i, y: position.y - range + i },
              damage
            );
          }
        }
        break;
      case PulseType.Suicide:
        {
          for (let i = position.x - range; i <= position.x + range; i++) {
            this.createPulse({ x: i, y: position.y }, damage);
          }
          for (let i = position.y - range; i <= position.y + range; i++) {
            this.createPulse({ x: position.x, y: i }, damage);
          }
        }
        break;
      case PulseType.RandomLine:
        {
          let end = randInUnitRange(range - 1, range);
          end.x = Math.round(end.x + position.x);
          end.y = Math.round(end.y + position.y);
          let results = bresenham(position, end);
          for (let target of results) {
            if (!target.equals(position)) this.createPulse(target, damage);
          }
        }
        break;
    }
  }

  createPulse(position, damage) {
    damage = damage || 1;
    let sprite = this.pulseManager.usePulse();
    if (!sprite) {
      sprite = this.ctx.createSprite(Resources.Eye, Colors.Orange);
      this.pulseManager.add(sprite);
    }
    sprite.alpha = 1;
    if (damage > 20) {
      sprite.tint = Colors.Orange;
    } else if (damage > 10) {
      sprite.tint = Colors.Red;
    } else if (damage > 5) {
      sprite.tint = Colors.Mint;
    } else {
      sprite.tint = Colors.Teal;
    }

    this.ctx.setSprite(position, sprite);
    this.damageAt(position, damage);
  }

  // ENEMIES AND COMBAT

  enemyAI() {
    if (this.depth >= this.winDepth && this.mode == GameMode.Ascend) return;
    for (let entity of Entity.entities.filter(
      (entity) =>
        entity !== this.player &&
        EntityType.getSpawnable().indexOf(entity.type) !== -1
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
    if (this.depth % 2 === 1) {
      for (let i = 1; i <= 2; i++) {
        let a = new Position(3 * i, 0);
        let b = new Position(3 * i, this.mapHeight - 1);
        let c = new Position(this.mapWidth - 1 - 3 * i, this.mapHeight - 1);
        let d = new Position(this.mapWidth - 1 - 3 * i, 0);
        let enhancementA = new Entity(
          a,
          EntityType.randomEnchantment(this.depth),
          this.ctx.createSprite(Resources.Paper),
          this.entityChanged.bind(this),
          this.map
        );
        let enhancementB = new Entity(
          b,
          EntityType.randomEnchantment(this.depth),
          this.ctx.createSprite(Resources.Paper),
          this.entityChanged.bind(this),
          this.map
        );
        let enhancementC = new Entity(
          c,
          EntityType.randomEnchantment(this.depth),
          this.ctx.createSprite(Resources.Paper),
          this.entityChanged.bind(this),
          this.map
        );
        let enhancementD = new Entity(
          d,
          EntityType.randomEnchantment(this.depth),
          this.ctx.createSprite(Resources.Paper),
          this.entityChanged.bind(this),
          this.map
        );
      }
      let bombA = new Entity(
        new Position(0, 0),
        EntityType.Bomb,
        this.ctx.createSprite(Resources.Bomb),
        this.entityChanged.bind(this),
        this.map
      );
      let bombB = new Entity(
        new Position(0, this.mapHeight - 1),
        EntityType.Bomb,
        this.ctx.createSprite(Resources.Bomb),
        this.entityChanged.bind(this),
        this.map
      );
      let bombC = new Entity(
        new Position(this.mapWidth - 1, this.mapHeight - 1),
        EntityType.Bomb,
        this.ctx.createSprite(Resources.Bomb),
        this.entityChanged.bind(this),
        this.map
      );
      let bombD = new Entity(
        new Position(this.mapWidth - 1, 0),
        EntityType.Bomb,
        this.ctx.createSprite(Resources.Bomb),
        this.entityChanged.bind(this),
        this.map
      );
    } else if (this.depth >= this.winDepth) {
      let pos = this.map.getEmpty();
      while (pos.manhattanDist(this.player.position) < 3)
        pos = this.map.getEmpty();
      let newEntity = new Entity(
        pos,
        EntityType.Abomination,
        this.ctx.createSprite(Resources.Abomination),
        this.entityChanged.bind(this),
        this.map
      );
    } else {
      for (let i = 0; i < this.depth / 2 + 1; i++) {
        let pos = this.map.getEmpty();
        while (pos.manhattanDist(this.player.position) < 3) {
          pos = this.map.getEmpty();
        }

        let types = EntityType.getSpawnableOnDepth(this.depth);
        let type = types[Math.floor(types.length * Math.random())];

        let sprite = null;
        switch (type) {
          case EntityType.Ghoul:
            {
              sprite = this.ctx.createSprite(Resources.Ghoul);
            }
            break;
          case EntityType.Wendigo:
            {
              sprite = this.ctx.createSprite(Resources.Wendigo);
            }
            break;
          case EntityType.Beholder:
            {
              sprite = this.ctx.createSprite(Resources.Beholder);
            }
            break;
          case EntityType.Wraith:
            {
              sprite = this.ctx.createSprite(Resources.Wraith);
            }
            break;
        }

        let newEntity = new Entity(
          pos,
          type,
          sprite,
          this.entityChanged.bind(this),
          this.map
        );
      }
    }
  }

  entityChanged(entity) {
    if (this.mode == GameMode.Ascend) return;
    if (entity.health <= 0) {
      this.killEntity(entity);
    } else if (this.depth % 2 === 1 && entity.health !== entity.type.health) {
      if (entity.type === EntityType.Bomb) {
        this.spawnPulse(entity.position, PulseType.Suicide, this.mapWidth, 100);
      } else {
        let spawned = false;
        switch (entity.type) {
          // ENCHANTMENTS

          case EntityType.ExtendBassRange:
            {
              extendRange(this.sequence.bass);
              spawned = true;
            }
            break;
          case EntityType.ExtendMelodyRange:
            {
              extendRange(this.sequence.melody);
              spawned = true;
            }
            break;
          case EntityType.IncreaseBassDamage:
            {
              increaseDamage(this.sequence.bass);
              spawned = true;
            }
            break;
          case EntityType.IncreaseMelodyDamage:
            {
              increaseDamage(this.sequence.melody);
              spawned = true;
            }
            break;

          // BASS

          case EntityType.BasicBass:
            {
              this.sequence.bass = createBass(this.depth, Instrument.BassBasic);
              spawned = true;
            }
            break;

          // MELODY

          case EntityType.BasicMelody:
            {
              this.sequence.melody = createMelody(
                this.sequence.pitch,
                this.sequence.progression,
                Instrument.SynthBasic
              );
              spawned = true;
            }
            break;
          case EntityType.ThunderSong:
            {
              this.sequence.melody = createMelody(
                this.sequence.pitch,
                this.sequence.progression,
                Instrument.SynthSaw
              );
              spawned = true;
            }
            break;
          case EntityType.CursedMelody:
            {
              this.sequence.melody = createMelody(
                this.sequence.pitch,
                this.sequence.progression,
                Instrument.SynthDuo
              );
              spawned = true;
            }
            break;
        }
        if (spawned) {
          this.spawnPulse(
            entity.position,
            PulseType.Suicide,
            this.mapWidth,
            100
          );
        }
      }
    }
    this.updateUI();
  }

  damageAt(position, damage) {
    if (this.map.isValid(position) && !this.map.isEmpty(position)) {
      this.map.grid[position.y][position.x].damage(damage);
    }
  }

  killEntity(entity) {
    // Entity removal

    if (entity === this.player) {
      console.log("lead");
      this.setMode(GameMode.Reset);
      return;
    } else if (entity.type === EntityType.Abomination) {
      this.setMode(GameMode.Ascend);
      return;
    }

    let index = Entity.entities.indexOf(entity);
    if (index > -1) {
      Entity.entities.splice(index, 1);
    }

    if (entity.sprite) {
      entity.sprite.alpha = 0.3;
      this.clearTint(entity);
      this.ctx.scheduleRemove(entity.sprite);
    }

    this.map.grid[entity.position.y][entity.position.x] = null;
    if (this.selectedEntity === entity) {
      this.nextFocus();
    }

    if (
      (Entity.entities.length === 1) & (Entity.entities[0] === this.player) &&
      this.mode !== GameMode.Tutorial
    ) {
      this.nextDepth();
    }
  }

  nextDepth() {
    this.depth++;
    this.ctx.clean();

    this.audio.schedule(() => {
      this.spawnEntities();
    }, "+8n");

    if (this.depth % 2 === 1) {
      let newPlayerPosition = new Position(
        randInRange(
          Math.max(this.mapWidth / 2 - 1, 0),
          Math.min(this.mapWidth / 2 + 1, this.mapWidth - 1)
        ),
        randInRange(
          Math.max(0, this.mapHeight / 2 - 1),
          Math.min(this.mapHeight / 2 + 1, this.mapHeight - 1)
        )
      );

      while (
        !this.map.isValid(newPlayerPosition) &&
        this.map.isEmpty(newPlayerPosition)
      ) {
        newPlayerPosition = new Position(
          randInRange(
            Math.max(this.mapWidth / 2 - 2, 0),
            Math.min(this.mapWidth / 2 + 2, this.mapWidth - 1)
          ),
          randInRange(
            Math.max(0, this.mapHeight / 2 - 2),
            Math.min(this.mapHeight / 2 + 2, this.mapHeight - 1)
          )
        );
      }
      this.player.position = newPlayerPosition;
    }
    this.clearTarget(this.player);
  }
}

const GameMode = {
  Start: 1,
  Play: 2,
  Reset: 3,
  Ascend: 4,
  Tutorial: {
    currentSlide: 0,

    slides: [
      `Welcome, player. This will be a brief introduction on how this game works.
      First, the movement; to move, you can either use the arrow keys or VIM keys (hjkl).`,

      `Try holding down your choice of movement key. As you can see,
      the movement system in the game is based on the pulse of the music. When playing,
      you will be able to see how many steps are left by looking at the area right
      underneath the main display; there will be arrows indicating whether you still have
      tiles to travel. You can cancel this movement by pressing period [.].
      `,
      `
      You can view/inspect different entities, be it enchantments or creatures,
      with Q [q/Q]. Note that this does not work in the tutorial. To apply enchantments, you need to attack the one you want to use.
      This promptly kills all adjacent ones, so choose wisely! If you want none of the options, just attack the bomb.
      More will be explained in the next section.
      `,
      `
      As hinted at before, you must kill or destroy all entities in a level or room before progressing (even a 'shop' room).
      Your goal is to reach the 26th floor and defeat the 'final boss'. 
      Best of luck! 
      `,
    ],
    next() {
      this.currentSlide++;
      if (this.currentSlide >= this.slides.length) {
        this.currentSlide = 0;
        return false;
      }
      return true;
    },
    current() {
      return this.slides[this.currentSlide];
    },
    currentIndex() {
      return this.currentSlide;
    },
  },
};
