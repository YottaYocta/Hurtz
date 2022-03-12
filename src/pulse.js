export const PulseType = {
  Axis: 1,
  Random: 2,
  Cross: 3,
  Suicide: 4,
  RandomLine: 5,
};

export default class PulseManager {
  constructor() {
    this.pulses = [];
  }

  add(sprite) {
    this.pulses.push(sprite);
  }

  usePulse(color) {
    return this.pulses.find((sprite) => sprite.alpha < 0.01 && sprite.tint === color);
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
