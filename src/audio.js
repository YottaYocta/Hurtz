import * as Tone from "tone";
import { Instrument } from "./sequence";

export default class Audio {
  constructor(bpm) {
    Tone.start()
      .then((res) => {
        this.bpm = bpm;
        this.AMSynth = new Tone.AMSynth().toDestination();
        this.membraneSynth = new Tone.MembraneSynth().toDestination();
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
      let timeEight = Tone.Time("0:0:2").toSeconds();
      callback();

      for (let i = 0; i < 8; i++) {
        let currentEighth = sequence.getCurrent();

        // BASS

        if (currentEighth.bass && currentEighth.bass.note) {
          switch (currentEighth.bass.instrument) {
            case Instrument.BassBasic:
              {
                this.membraneSynth.triggerAttackRelease(
                  currentEighth.bass.note,
                  "8n",
                  time + i * timeEight
                );
              }
              break;
            default: {
              this.membraneSynth.triggerAttackRelease(
                currentEighth.bass.note,
                "8n",
                time + i * timeEight
              );
              console.log("instrument does not exist");
            }
          }
          Tone.Transport.scheduleOnce((time) => {
            noteHandler(currentEighth.bass);
          }, `+${timeEight * i}`);
        }
      }
    }, "1:0:0");
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
