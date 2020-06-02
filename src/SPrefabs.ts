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

  createOscillator(audio = true) {
    const device = this.createDevice(audio ? "VCO" : "LFO");

    const node = this.ecs.audio.createOscillatorNode({
      frequency: audio ? 440 : 1,
    });

    if (audio) {
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
      name: audio ? "freq" : "rate",
      param: [node, "frequency"],
      min: 0,
      max: audio ? 20000 : 20,
    });

    if (audio) {
      this.createKnob(device, 44, 90, {
        name: "dtn",
        param: [node, "detune"],
        min: -100,
        max: 100,
      });
    }

    this.createOscillatorWaveButton(device, node, "sine", 0, audio);
    this.createOscillatorWaveButton(device, node, "triangle", 1, audio);
    this.createOscillatorWaveButton(device, node, "sawtooth", 2, audio);
    this.createOscillatorWaveButton(device, node, "square", 3, audio);

    let outNode: AudioNodeId = node;

    if (!audio) {
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

    this.createPort(device, 44, audio ? 240 : 190, {
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
    const ecs = this.ecs;
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
      onClick: () => {
        ecs.audio.setOscillatorType(node, type);
      },
      get down() {
        return ecs.audio.getOscillatorType(node) === type;
      },
      set down(down) {},
    });
    this.ecs.pointerGrabTargets.set(button, {});
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
    const audio = this.ecs.audio;
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
    let mouseDown = false;
    const button = {
      label: "x" + gain,
      get down() {
        if ((new Error().stack || "").includes("SButtonRenderer"))
          return mouseDown || audio.getParamValue(param) === gain;
        return mouseDown;
      },
      set down(down) {
        mouseDown = down;
      },
      onClick: () => {
        audio.setParamValue(param, audio.getParamValue(param) === 1 ? gain : 1);
      },
    };
    this.ecs.buttons.set(entity, button);
    return entity;
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

  clampParam(param: AudioParam, minValue: number, maxValue: number) {
    return new Proxy(param, {
      get(target, p) {
        if (p === "minValue") return minValue;
        if (p === "maxValue") return maxValue;
        return (target as any)[p];
      },
      set(target, p, value) {
        (target as any)[p] = value;
        return true;
      },
    });
  }

  createDevice(name: string) {
    const getContentBox = this.getContentBox;
    const entity = this.ecs.createEntity(name.toLowerCase());
    this.ecs.devices.set(entity, { name });
    this.ecs.transforms.set(entity, {
      x: 0,
      y: 0,
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
      device.description + "-" + port.name.toLowerCase()
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
      device.description + "-" + knob.name.toLowerCase()
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

    this.createSpawnButton("Master", () => this.createMaster(), nextPosition());

    this.createSpawnButton(
      "VCO",
      () => this.createOscillator(),
      nextPosition()
    );

    this.createSpawnButton(
      "LFO",
      () => this.createOscillator(false),
      nextPosition()
    );

    this.createSpawnButton("LPF", () => this.createLPF(), nextPosition());

    this.createSpawnButton("VCA", () => this.createVCA(), nextPosition());

    this.createSpawnButton("Panner", () => this.createPanner(), nextPosition());

    this.createSpawnButton("Delay", () => this.createDelay(), nextPosition());

    this.createSpawnButton("Scope", () => this.createScope(), nextPosition());
  }

  createSpawnButton(name: string, spawn: () => Entity, transform: CTransform) {
    const entity = this.ecs.createEntity("button");
    const grabTarget: CPointerGrabTarget = {};
    this.ecs.transforms.set(entity, transform);
    this.ecs.pointerGrabTargets.set(entity, grabTarget);
    this.ecs.buttons.set(entity, {
      label: name,
      down: false,
      onClick: () => {
        const entity = spawn();
        const transform = this.ecs.transforms.get(entity)!;
        this.ecs.pointerGrabTargets.get(entity)!.grabbed = {
          pointer: grabTarget.grabbed!.pointer,
          dx: -transform.w / 2,
          dy: -transform.h / 4,
        };
        delete grabTarget.grabbed;
      },
    });
    return entity;
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
