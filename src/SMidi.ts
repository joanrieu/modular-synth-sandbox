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

function isMidiInput(port: WebMidi.MIDIPort): port is WebMidi.MIDIInput {
  return port.type === "input";
}

export class SMidi implements ISerializable<SerializedMidiNodes> {
  constructor(readonly ecs: ECS) {
    this.onMidiMessage = this.onMidiMessage.bind(this);
    navigator.requestMIDIAccess?.().then((midi) => {
      for (const port of midi.inputs.values()) {
        port.addEventListener("midimessage", this.onMidiMessage);
      }
      midi.addEventListener("statechange", (event) => {
        if (event.port.state === "connected" && isMidiInput(event.port)) {
          event.port.addEventListener("midimessage", this.onMidiMessage);
        }
      });
    });
  }

  lastNote = 0;
  gateNode?: AudioNodeId<ConstantSourceNode>;
  cvNode?: AudioNodeId<ConstantSourceNode>;

  getGateNode() {
    if (!this.gateNode) {
      this.gateNode = this.ecs.audio.createConstantSourceNode();
    }
    return this.gateNode;
  }

  getCVNode() {
    if (!this.cvNode) {
      this.cvNode = this.ecs.audio.createConstantSourceNode();
    }
    return this.cvNode;
  }

  onMidiMessage(event: WebMidi.MIDIMessageEvent) {
    const gateNode = this.getGateNode();
    const cvNode = this.getCVNode();
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
