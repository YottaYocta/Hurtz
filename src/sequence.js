export default class Sequence {
  constructor() {
    this.currentNote = 0;
    this.base = []; 
  }

  createMeasure() {
    for (let i = 0; i < 4; i++) {
      this.base.push(new Note('C1', Instruments.Bass));
    }
  }

  getCurrent() {
    const notes = {
      bass: this.base[this.currentNote]
    };
    this.currentNote++;
    this.currentNote %= this.base.length;
    return notes;
  }
}

export class Note {
  constructor(note, instrument) {
    this.note = note;
    this.instrument = instrument;
  }
}

export const Instruments = {
  Bass: 1, 
}
