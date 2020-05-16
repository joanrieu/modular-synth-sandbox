import { ECS } from "./ECS";

enum MidiB0 {
  NOTE_ON = 144,
  NOTE_OFF = 128,
}

export class SMidiIO {
  constructor(readonly ecs: ECS) {
    let index = 0;
    navigator.requestMIDIAccess?.().then((midi) => {
      for (const port of midi.inputs.values()) {
        this.createInput(port, index++);
      }
    });
  }

  createInput(port: WebMidi.MIDIInput, index: number) {
    const device = this.ecs.prefabs.createDevice(
      port.name || "MIDI in #" + index
    );
    const width = 300;
    this.ecs.transforms.set(device, {
      x: 10,
      y: 10 + 100 * index,
      w: width,
      h: 90,
    });

    const gateNode = new ConstantSourceNode(this.ecs.audio.ctx, {
      offset: 0,
    });
    gateNode.start();
    this.ecs.prefabs.createPort(device, (width - 32) / 2 - 25, 40, {
      name: "gate",
      node: gateNode,
      output: 0,
    });

    let lastNote = 440;
    const freqNode = new ConstantSourceNode(this.ecs.audio.ctx, {
      offset: lastNote,
    });
    freqNode.start();
    this.ecs.prefabs.createPort(device, (width - 32) / 2 + 25, 40, {
      name: "freq",
      node: freqNode,
      output: 0,
    });

    port.addEventListener("midimessage", (e) => {
      const [command, note, velocity] = e.data;
      if (command === MidiB0.NOTE_ON && velocity !== 0) {
        const freq = this.noteToFrequency(note);
        gateNode.offset.value = 1;
        freqNode.offset.value = freq;
        lastNote = note;
      } else if (
        command === MidiB0.NOTE_OFF ||
        (command === MidiB0.NOTE_ON && velocity === 0)
      ) {
        if (note === lastNote) {
          gateNode.offset.value = 0;
        }
      }
    });
  }

  noteToFrequency(note: number) {
    return (440 / 32) * 2 ** ((note - 9) / 12);
  }
}
