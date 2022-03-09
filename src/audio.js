import * as Tone from "tone";

export default class Audio {
  constructor(bpm) {
    Tone.start()
      .then((res) => {
        this.bpm = bpm;
        this.AMSynth = new Tone.AMSynth().toDestination();
        this.MembraneSynth = new Tone.MembraneSynth().toDestination();
        this.loop = null;
        Tone.Transport.bpm.value = this.bpm;

        console.log("tone context created");
      })
      .catch((err) => {
        console.err(err);
      });
  }

  start(sequence, callback, noteHandler) {
    this.loop = Tone.Transport.scheduleRepeat((time) => {
      let matrix = sequence.getCurrent();
      if (matrix && matrix.bass) {
        callback();
        noteHandler(matrix.bass);
        this.MembraneSynth.triggerAttackRelease(matrix.bass.note, "8n");
      }
    }, "1:0:0", "1:0:0");
    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.stop();
  }

  reset(bpm) {
    this.bpm = bpm;
    this.stop();
    if (this.loop != undefined && this.loop != null) {
      Tone.Transport.clear(this.loop);
    }
  }
}
