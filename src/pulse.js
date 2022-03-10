export const PulseType = {
  Axis: 1,
  Random: 2,
  Cross: 3,
};

export default class PulseManager {
  constructor() {
    this.pulses = [];
  }

  add(sprite) {
    this.pulses.push(sprite);
  }

  usePulse() {
    return this.pulses.find((sprite) => sprite.alpha < 0.01);
  }

  updatePulses() {
    for (let sprite of this.pulses) {
      if (sprite.alpha > 0.001) {
        sprite.alpha /= 1.1;
      }
    }
  }

  reset() {
    this.pulses = [];
  }
}
