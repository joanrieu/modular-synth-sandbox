import { ECS } from "./ECS";
import { ISerializable } from "./ISerializable";
import { AudioNodeId } from "./SAudio";

enum MidiB0 {
  NOTE_ON = 144,
  NOTE_OFF = 128,
}

type SerializedMidiNodes = [
  AudioNodeId<ConstantSourceNode>,
  AudioNodeId<ConstantSourceNode>
];

export class SMidi implements ISerializable<SerializedMidiNodes> {
  constructor(readonly ecs: ECS) {
    navigator.requestMIDIAccess?.().then((midi) => {
      for (const port of midi.inputs.values()) {
        port.addEventListener("midimessage", this.onMidiMessage.bind(this));
      }
    });
  }

  lastNote = 0;
  gateNode?: AudioNodeId<ConstantSourceNode>;
  cvNode?: AudioNodeId<ConstantSourceNode>;

  createGateNode() {
    if (!this.gateNode) {
      this.gateNode = this.ecs.audio.createConstantSourceNode();
    }
    return this.gateNode;
  }

  createCVNode() {
    if (!this.cvNode) {
      this.cvNode = this.ecs.audio.createConstantSourceNode();
    }
    return this.cvNode;
  }

  onMidiMessage(event: WebMidi.MIDIMessageEvent) {
    const gateNode = this.createGateNode();
    const cvNode = this.createCVNode();
    const [command, note, velocity] = event.data;
    if (command === MidiB0.NOTE_ON && velocity > 0) {
      this.ecs.audio.setParamValue([cvNode, "offset"], this.noteToCV(note));
      this.ecs.audio.setParamValue([gateNode, "offset"], 1);
      this.lastNote = note;
    } else if (
      command === MidiB0.NOTE_OFF ||
      (command === MidiB0.NOTE_ON && velocity === 0)
    ) {
      if (note === this.lastNote) {
        this.ecs.audio.setParamValue([gateNode, "offset"], 0);
      }
    }
  }

  noteToCV(note: number) {
    return 2 ** ((note - 33) / 12);
  }

  save(): SerializedMidiNodes {
    return [this.gateNode!, this.cvNode!];
  }

  restore([gateNode, cvNode]: SerializedMidiNodes) {
    this.gateNode = gateNode;
    this.cvNode = cvNode;
  }
}
