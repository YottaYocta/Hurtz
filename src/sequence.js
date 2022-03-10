const maxSequenceLength = 8 * 4;

export default class Sequence {
  constructor() {
    this.currentNote = 0;
    this.bass = [];
  }

  getCurrent() {
    const notes = {
      bass: this.bass[this.currentNote],
    };
    this.currentNote++;
    this.currentNote %= maxSequenceLength;
    return notes;
  }

  reset() {
    this.bass = [];
  }
}

export function createBass(strength) {
  let bass = [];
  if (!strength) {
    for (let i = 0; i < maxSequenceLength; i++) {
      // generation is done by eigth notes
      let note = null;
      if (i % 4 == 0) note = "C1";
      bass.push(new Note(note, Instrument.BassBasic));
    }
    return bass;
  }
  for (let i = 0; i < maxSequenceLength; i++) {
    // generation is done by eigth notes
    let active = strength / 20;
    if (i % 4 == 0) active = 1;
    if (i % 2 == 0) active += 0.3;
    let note = null;
    if (active > Math.random()) note = "C1";
    bass.push(new Note(note, Instrument.BassBasic));
  }
  return bass;
}

export class Note {
  constructor(note, instrument) {
    this.note = note;
    this.instrument = instrument;
  }
}

export const Instrument = {
  BassBasic: 1,
};
