import { CKnob } from "./CKnob";
import { CPointerGrabTarget } from "./CPointerGrabTarget";
import { CPort } from "./CPort";
import { CTransform } from "./CTransform";
import { ECS, Entity } from "./ECS";
import { AudioNodeId, AudioParamId } from "./SAudio";

export class SPrefabs {
  constructor(readonly ecs: ECS) {}

  createScene() {
    this.createToolbar();
  }

  createMaster() {
    const device = this.createDevice("Master");

    this.createPort(device, 20, 40, {
      name: "spk",
      input: [this.ecs.audio.getMasterNode(), 0],
    });

    return device;
  }

  createOscillator(audioRange: boolean) {
    const device = this.createDevice(audioRange ? "VCO" : "LFO");

    const node = this.ecs.audio.createOscillatorNode({
      frequency: audioRange ? 440 : 1,
    });

    if (audioRange) {
      const gainNode = this.ecs.audio.createGainNode({
        gain:
          2 /* make up for division caused by the knob */ *
          55 /* convert CV to Hz */,
      });
      this.ecs.audio.connect([gainNode, 0], [node, "frequency"]);

      this.createPort(device, 20, 40, {
        name: "freq",
        input: [gainNode, 0],
      });
    }

    this.createKnob(device, 70, 40, {
      name: audioRange ? "freq" : "rate",
      param: [node, "frequency"],
      min: audioRange ? 20 : 0,
      max: audioRange ? 20000 : 20,
    });

    if (audioRange) {
      this.createKnob(device, 44, 90, {
        name: "dtn",
        param: [node, "detune"],
        min: -100,
        max: 100,
      });
    }

    this.createOscillatorWaveButton(device, node, "sine", 0, audioRange);
    this.createOscillatorWaveButton(device, node, "triangle", 1, audioRange);
    this.createOscillatorWaveButton(device, node, "sawtooth", 2, audioRange);
    this.createOscillatorWaveButton(device, node, "square", 3, audioRange);

    let outNode: AudioNodeId = node;

    if (!audioRange) {
      const gainNode = this.ecs.audio.createGainNode({ gain: 50 });

      this.ecs.audio.connect([outNode, 0], [gainNode, 0]);
      outNode = gainNode;

      this.createKnob(device, 20, 40, {
        name: "amp",
        param: [gainNode, "gain"],
        min: 0,
        max: 100,
      });
    }

    this.createPort(device, 44, audioRange ? 240 : 190, {
      name: "out",
      output: [outNode, 0],
    });

    return device;
  }

  createOscillatorWaveButton(
    device: Entity,
    node: AudioNodeId<OscillatorNode>,
    type: OscillatorType,
    line: number,
    audio: boolean
  ) {
    const button = this.ecs.createEntity("osc-waveform-" + type);
    this.ecs.transforms.set(button, {
      parent: device,
      x: 20,
      y: (audio ? 140 : 90) + 19 * line,
      w: 80,
      h: 20,
    });
    this.ecs.buttons.set(button, {
      label: type,
      toggle: true,
      down: type === "sine",
      onClick: [
        "prefabs",
        this.onOscillatorWaveButtonClick.name,
        [device, node, type],
      ],
    });
    this.ecs.pointerGrabTargets.set(button, {});
  }

  onOscillatorWaveButtonClick(
    device: Entity,
    node: AudioNodeId<OscillatorNode>,
    type: OscillatorType
  ) {
    this.ecs.audio.setOscillatorType(node, type);
    for (const [entity, transform] of this.ecs.transforms) {
      if (transform.parent === device && this.ecs.buttons.has(entity)) {
        const button = this.ecs.buttons.get(entity)!;
        if (button.label !== type) {
          button.down = false;
        }
      }
    }
  }

  createVCO() {
    return this.createOscillator(true);
  }

  createLFO() {
    return this.createOscillator(false);
  }

  createLPF() {
    const device = this.createDevice("LPF");
    const node = this.ecs.audio.createBiquadFilterNode();
    this.createPort(device, 45, 40, { name: "in", input: [node, 0] });
    this.createPort(device, 20, 90, { name: "fm", input: [node, "frequency"] });
    this.createKnob(device, 70, 90, {
      name: "freq",
      param: [node, "frequency"],
      min: 0,
      max: 20000,
    });
    this.createPort(device, 45, 140, { name: "out", output: [node, 0] });
    return device;
  }

  createVCA() {
    const device = this.createDevice("VCA");

    const node1 = this.ecs.audio.createGainNode();
    this.createPort(device, 45, 40, { name: "in", input: [node1, 0] });
    this.createPort(device, 20, 90, { name: "mod", input: [node1, "gain"] });
    this.createKnob(device, 70, 90, {
      name: "gain",
      param: [node1, "gain"],
      min: 0,
      max: 2,
    });

    const node2 = this.ecs.audio.createGainNode();
    this.ecs.audio.setParamValue([node2, "gain"], 1);
    this.createPort(device, 20, 140, { name: "out", output: [node2, 0] });
    this.createVCAGainButton(device, 70, 140, [node2, "gain"], 100);

    this.ecs.audio.connect([node1, 0], [node2, 0]);

    return device;
  }

  createVCAGainButton(
    device: Entity,
    x: number,
    y: number,
    param: AudioParamId<GainNode>,
    gain: number
  ) {
    const entity = this.ecs.createEntity("button");
    const grabTarget: CPointerGrabTarget = {};
    this.ecs.transforms.set(entity, {
      parent: device,
      x,
      y,
      w: 32,
      h: 32,
    });
    this.ecs.pointerGrabTargets.set(entity, grabTarget);
    this.ecs.buttons.set(entity, {
      label: "x" + gain,
      toggle: true,
      down: false,
      onClick: ["prefabs", this.onVCAGainButtonClick.name, [param, gain]],
    });
    return entity;
  }

  onVCAGainButtonClick(param: AudioParamId, gain: number) {
    this.ecs.audio.setParamValue(
      param,
      this.ecs.audio.getParamValue(param) === 1 ? gain : 1
    );
  }

  createPanner() {
    const device = this.createDevice("Panner");
    const node = this.ecs.audio.createStereoPannerNode();
    this.createPort(device, 20, 40, { name: "in", input: [node, 0] });
    this.createKnob(device, 20, 90, {
      name: "pan",
      param: [node, "pan"],
      min: -1,
      max: 1,
    });
    this.createPort(device, 20, 140, { name: "out", output: [node, 0] });
    return device;
  }

  createDelay(maxDelayTime = 10) {
    const device = this.createDevice("Delay");
    const node = this.ecs.audio.createDelayNode({ maxDelayTime });
    this.createPort(device, 20, 40, { name: "in", input: [node, 0] });
    this.createKnob(device, 20, 90, {
      name: "val",
      param: [node, "delayTime"],
      min: 0,
      max: maxDelayTime,
    });
    this.createPort(device, 20, 140, { name: "out", output: [node, 0] });
    return device;
  }

  createScope() {
    const device = this.createDevice("Scope");
    this.ecs.transforms.set(device, { x: 0, y: 0, w: 300, h: 200 });
    const node = this.ecs.audio.createAnalyserNode();
    this.ecs.scopes.set(device, { node });
    this.createPort(device, 10, 10, {
      name: "in",
      input: [node, 0],
    });
    return device;
  }

  createDevice(name: string) {
    const getContentBox = this.getContentBox;
    const entity = this.ecs.createEntity(name.toLowerCase());
    this.ecs.devices.set(entity, { name });
    this.ecs.transforms.set(entity, {
      x: 0,
      y: 0,
      // FIXME the getters are replaced by their values when serialized
      // (it works, but it could cause problems in the future)
      get w() {
        return getContentBox(entity, "w");
      },
      get h() {
        return getContentBox(entity, "h");
      },
    });
    this.ecs.pointerGrabTargets.set(entity, {});
    this.ecs.dragAndDropTargets.add(entity);
    return entity;
  }

  createPort<T extends AudioNode>(
    device: Entity,
    x: number,
    y: number,
    port: CPort<T>
  ) {
    const entity = this.ecs.createEntity(
      device + "-" + port.name.toLowerCase()
    );
    this.ecs.transforms.set(entity, {
      parent: device,
      x,
      y,
      w: 32,
      h: 32,
    });
    this.ecs.ports.set(entity, port);
    this.ecs.pointerGrabTargets.set(entity, {});
    return entity;
  }

  createKnob<T extends AudioNode>(
    device: Entity,
    x: number,
    y: number,
    knob: CKnob<T>
  ) {
    const entity = this.ecs.createEntity(
      device + "-" + knob.name.toLowerCase()
    );
    this.ecs.transforms.set(entity, {
      parent: device,
      x,
      y,
      w: 32,
      h: 32,
    });
    this.ecs.knobs.set(entity, knob);
    this.ecs.pointerGrabTargets.set(entity, {});
    return entity;
  }

  createToolbar() {
    let spot = 0;
    const self = this;
    const nextPosition = () => ({
      get x() {
        return self.ecs.display.canvas.width - 110;
      },
      y: 10 + 20 * spot++,
      w: 100,
      h: 20,
    });

    this.createSpawnButton("Master", nextPosition());
    this.createSpawnButton("VCO", nextPosition());
    this.createSpawnButton("LFO", nextPosition());
    this.createSpawnButton("LPF", nextPosition());
    this.createSpawnButton("VCA", nextPosition());
    this.createSpawnButton("Panner", nextPosition());
    this.createSpawnButton("Delay", nextPosition());
    this.createSpawnButton("Scope", nextPosition());
  }

  createSpawnButton(name: string, transform: CTransform) {
    const entity = this.ecs.createEntity("button");
    const grabTarget: CPointerGrabTarget = {};
    this.ecs.transforms.set(entity, transform);
    this.ecs.pointerGrabTargets.set(entity, grabTarget);
    this.ecs.buttons.set(entity, {
      label: name,
      toggle: false,
      down: false,
      onClick: ["prefabs", this.onSpawnButtonClick.name, [entity, name]],
    });
    return entity;
  }

  onSpawnButtonClick(entity: Entity, type: string) {
    const key = ("create" + type) as keyof this;
    const spawn = ((this[key] as unknown) as () => Entity).bind(this);
    const spawnedEntity = spawn();
    const transform = this.ecs.transforms.get(spawnedEntity)!;
    const buttonGrabTarget = this.ecs.pointerGrabTargets.get(entity)!;
    const spawnedGrabTarget = this.ecs.pointerGrabTargets.get(spawnedEntity)!;
    spawnedGrabTarget.grabbed = {
      pointer: buttonGrabTarget.grabbed!.pointer,
      dx: -transform.w / 2,
      dy: -transform.h / 4,
    };
    delete buttonGrabTarget.grabbed;
  }

  getContentBox = (entity: Entity, size: "w" | "h") => {
    const position = size === "w" ? "x" : "y";
    const children = [...this.ecs.transforms.values()].filter(
      (t) => t.parent === entity
    );
    const margin = Math.min(...children.map((t) => t.x));
    const dimension = Math.max(...children.map((t) => t[position] + t[size]));
    return dimension + margin;
  };
}
