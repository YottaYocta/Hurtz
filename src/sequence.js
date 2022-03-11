const MeasureLength = 8;

const Progressions = {
  BasicMinor: [
    [12, 15, 19, 24],
    [12, 15, 19, 24],
    [24, 27, 31, 26],
    [24, 27, 31, 26],
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
  "C7",
];

export const Instrument = {
  BassBasic: 1,
  SynthBasic: 2,
};

export default class Sequence {
  constructor() {
    this.currentNote = 0;
    this.bass = [];
    this.melody = [];
    this.chordProgression = Progressions.BasicMinor;
    this.startingPitch = Math.floor(Math.random() * 12);
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
    this.currentNote = 0;
  }

  get melody() {
    return this._melody;
  }

  set melody(melody) {
    this._melody = melody;
    this.currentNote = 0;
  }

  reset() {
    this.bass = [];
    this.melody = [];
    this.chordProgression = Progressions.BasicMinor;
    this.startingPitch = Math.floor(Math.random() * 12);
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
      case Instrument.SynthBasic: {
        this.range = 2; 
      }
      break;
    }
  }
}
// Enchantments

export function createBass(strength) {
  let bass = [];
  if (!strength) {
    for (let i = 0; i < MeasureLength * 4; i++) {
      // generation is done by eigth notes

      let note = null;
      if (i % 4 === 0) note = "C1";
      bass.push(new Note(note, Instrument.BassBasic));
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
    bass.push(new Note(note, Instrument.BassBasic));
  }
  return bass;
}

export function extendRange(bass, strength) {
  let increase = Math.ceil(strength / 2);
  for (let note of bass) {
    if (note.note) {
      note.range += increase;
    }
  }
}

export function createMelody(startingPitch, progression) {
  startingPitch = startingPitch || 0;
  progression = progression || Progressions.BasicMinor;
  let melody = [];
  for (let chord of progression) {
    let randomPattern = Patterns[Math.floor(Math.random() * Patterns.length)];
    for (let j = 0; j < MeasureLength; j++) {
      if (j % 2 == 0) {
        melody.push(new Note(MelodyPitches[startingPitch + chord[randomPattern[j / 2]]], Instrument.SynthBasic));
      } else {
        melody.push(new Note(null, Instrument.SynthBasic));
      }
    }
  }
  console.log(melody);
  return melody;
}
