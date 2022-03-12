import * as Tone from "tone";
import { Instrument } from "./sequence";

export default class Audio {
  constructor(bpm) {
    Tone.start()
      .then((res) => {
        this.bpm = bpm;

        this.AMSynth = new Tone.AMSynth().connect(
          new Tone.Volume(8).toDestination()
        );
        this.membraneSynth = new Tone.MembraneSynth().connect(
          new Tone.Volume(-2).toDestination()
        );
        this.sawSynth = new Tone.Synth({
          oscillator: {
            type: "sawtooth",
          },
        }).toDestination();
        this.duoSynth = new Tone.DuoSynth().connect(
          new Tone.Volume(-10).toDestination()
        );

        this.loop = null;
        Tone.Transport.bpm.value = this.bpm;

        console.log("tone context created");
      })
      .catch((err) => {
        console.err(err);
      });
  }

  reset(bpm, sequence, callback, noteHandler) {
    this.bpm = bpm;
    this.restartLoop(sequence, callback, noteHandler);
  }

  restartLoop(sequence, callback, noteHandler) {
    if (this.loop !== undefined && this.loop !== null) {
      Tone.Transport.clear(this.loop);
    }

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
            }
          }
          Tone.Transport.scheduleOnce((time) => {
            noteHandler(currentEighth.bass);
          }, `+${timeEight * i}`);
        }

        // MELODY

        if (currentEighth.melody && currentEighth.melody.note) {
          let noteLength = (Tone.Time("8n").toSeconds() * 3) / 4;
          switch (currentEighth.melody.instrument) {
            case Instrument.SynthBasic:
              {
                this.AMSynth.triggerAttackRelease(
                  currentEighth.melody.note,
                  noteLength,
                  time + i * timeEight
                );
              }
              break;
            case Instrument.SynthSaw:
              {
                this.sawSynth.triggerAttackRelease(
                  currentEighth.melody.note,
                  noteLength,
                  time + i * timeEight
                );
              }
              break;
            case Instrument.SynthDuo:
              {
                this.duoSynth.triggerAttackRelease(
                  currentEighth.melody.note,
                  noteLength,
                  time + i * timeEight
                );
              }
              break;

            default: {
              this.membraneSynth.triggerAttackRelease(
                currentEighth.melody.note,
                noteLength,
                time + i * timeEight
              );
            }
          }
          Tone.Transport.scheduleOnce((time) => {
            noteHandler(currentEighth.melody);
          }, `+${timeEight * i}`);
        }
      }
    }, "1:0:0");
  }

  start() {
    Tone.Transport.start();
  }

  pause() {
    Tone.Transport.pause();
  }

  stop() {
    Tone.Transport.stop();
  }

  schedule(callback, relativeTime) {
    if (Tone.Transport.state !== "started") callback();
    else {
      Tone.Transport.scheduleOnce((time) => {
        callback();
      }, relativeTime);
    }
  }
}
