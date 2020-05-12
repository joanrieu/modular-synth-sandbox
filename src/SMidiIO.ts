import { ECS } from "./ECS";

enum MidiB0 {
  NOTE_ON = 144,
  NOTE_OFF = 128,
}

export class SMidiIO {
  constructor(readonly ecs: ECS) {
    navigator.requestMIDIAccess?.().then((midi) => {
      for (const port of midi.inputs.values()) {
        this.createInput(port);
      }
    });
  }

  createInput(port: WebMidi.MIDIInput) {
    port.addEventListener("midimessage", (e) => {
      const [b0, b1, b2] = e.data;
      if (b0 === MidiB0.NOTE_ON && b2 !== 0) {
        this.noteOn(b1, b2);
      } else if (
        b0 === MidiB0.NOTE_OFF ||
        (b0 === MidiB0.NOTE_ON && b2 === 0)
      ) {
        this.noteOff(b1);
      }
    });
  }

  noteOn(note: number, velocity: number) {
    const oscillators = new Set<OscillatorNode>();

    for (const port of this.ecs.ports.values()) {
      if (port.node instanceof OscillatorNode) {
        oscillators.add(port.node);
      }
    }

    const freq = this.noteToFrequency(note);

    for (const osc of oscillators) {
      osc.frequency.value = freq;
    }
  }

  noteOff(note: number) {}

  noteToFrequency(note: number) {
    return (440 / 32) * 2 ** ((note - 9) / 12);
  }
}
