const MeasureLength = 8;

const Progressions = {
  BasicMinor: [
    [0, 3, 7, 12],
    [12, 15, 19, 24],
    [0, 3, 7, 12],
    [12, 15, 19, 24],
    [5, 8, 12, 17],
    [17, 20, 24, 29],
    [7, 11, 14, 17],
    [19, 23, 26, 29],
  ],
};

const Patterns = [
  [0, 1, 2, 3],
  [3, 2, 1, 0],
  [0, 1, 0, 0],
  [3, 2, 1, 2],
];

const MelodyPitches = [
  "C3",
  "C#3",
  "D3",
  "D#3",
  "E3",
  "F3",
  "F#3",
  "G3",
  "G#3",
  "A3",
  "A#3",
  "B3",
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
  "A4",
  "A#4",
  "B4",
  "C5",
  "C#5",
  "D5",
  "D#5",
  "E5",
  "F5",
  "F#5",
  "G5",
  "G#5",
  "A5",
  "A#5",
  "B5",
  "C6",
  "C#6",
  "D6",
  "D#6",
  "E6",
  "F6",
  "F#6",
  "G6",
  "G#6",
  "A6",
  "A#6",
  "B6",
  "C7",
  "D7",
  "D#7",
  "E7",
  "F7",
  "F#7",
  "G7",
  "G#7",
  "A7",
  "A#7",
  "B7",
  "C8",
];

// Register in Note, Audio, and handleNote

export const Instrument = {

  // BASS

  BassBasic: {
    damage: 3,
  },

  // SYNTH

  SynthBasic: {
    damage: 6,
    activationThreshold: 0.2,
  },
  SynthDuo: {
    damage: 24,
    activationThreshold: 0,
  },
  SynthSaw: {
    damage: 12,
    activationThreshold: 0.9,
  },
};

export default class Sequence {
  constructor() {
    this.currentNote = 0;
    this._bass = [];
    this._melody = [];
    this.progression = Progressions.BasicMinor;
    this.pitch = Math.floor(Math.random() * 12);
  }

  getCurrent() {
    const notes = {
      bass: this.bass[this.currentNote % this.bass.length],
      melody: this.melody[this.currentNote % this.melody.length],
    };
    this.currentNote++;
    this.currentNote %= Math.max(this.bass.length, this.melody.length);
    return notes;
  }

  get bass() {
    return this._bass;
  }

  set bass(bass) {
    this._bass = bass;
  }

  get melody() {
    return this._melody;
  }

  set melody(melody) {
    if (this._melody.length === 0) this.currentNote = 0;
    this._melody = melody;
  }

  reset() {
    this.bass = [];
    this.melody = [];
    this.progression = Progressions.BasicMinor;
    this.pitch = Math.floor(Math.random() * 12);
  }
}

export class Note {
  constructor(note, instrument) {
    this.note = note;
    this.instrument = instrument;
    switch (instrument) {
      case Instrument.BassBasic:
        {
          this.range = 1;
        }
        break;
      case Instrument.SynthBasic:
        {
          this.range = 3;
        }
        break;
      case Instrument.SynthSaw:
        {
          this.range = 5;
        }
        break;
      case Instrument.SynthDuo: 
        {
          this.range = 10;
        }
        break;
    }
  }
}
// Enchantments

export function createBass(strength, instrument) {
  let bass = [];
  if (!strength) {
    for (let i = 0; i < MeasureLength * 4; i++) {

      // generation is done by eigth notes

      let note = null;
      if (i % 4 === 0) note = "C1";
      bass.push(new Note(note, instrument));
    }
    return bass;
  }
  for (let i = 0; i < MeasureLength * 4; i++) {
    // generation is done by eigth notes

    let active = strength / 20;
    if (i % 4 === 0) active = 2;
    if (i % 2 === 0) active += 0.3;
    let note = null;
    if (active > Math.random() * 2) note = "C1";
    bass.push(new Note(note, instrument));
  }
  return bass;
}

export function extendRange(notes) {
  for (let note of notes) {
    if (note.note) {
      note.range += 1;
    }
  }
}

export function createMelody(pitch, progression, instrument) {
  pitch = pitch || 0;
  progression = progression || Progressions.BasicMinor;
  let melody = [];
  for (let chord of progression) {
    let randomPattern = Patterns[Math.floor(Math.random() * Patterns.length)];
    for (let j = 0; j < MeasureLength; j++) {
      if (j % 2 === 0 || Math.random() < instrument.activationThreshold) {
        melody.push(
          new Note(
            MelodyPitches[pitch + chord[randomPattern[Math.floor(j / 2)]]],
            instrument
          )
        );
      } else {
        melody.push(new Note(null, instrument));
      }
    }
  }
  return melody;
}
