export default class Sequence {
  constructor() {
    this.currentNote = 0;
    this.bass = [];
  }

  createBass() {
    for (let i = 0; i < 4; i++) {
      this.bass.push(new Note("C1", Instrument.BassBasic));
    }
  }

  getCurrent() {
    const notes = {
      bass: this.bass[this.currentNote],
    };
    this.currentNote++;
    this.currentNote %= this.bass.length;
    return notes;
  }

  reset() {
    this.bass = [];
  }
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
