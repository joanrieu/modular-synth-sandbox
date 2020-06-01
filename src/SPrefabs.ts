import { CKnob } from "./CKnob";
import { CPointerGrabTarget } from "./CPointerGrabTarget";
import { CPort } from "./CPort";
import { CTransform } from "./CTransform";
import { ECS, Entity } from "./ECS";

export class SPrefabs {
  constructor(readonly ecs: ECS) {}

  createScene() {
    this.createToolbar();
  }

  createMaster() {
    const device = this.createDevice("Master");

    this.createPort(device, 20, 40, {
      name: "spk",
      node: this.ecs.audio.ctx.destination,
      input: 0,
    });

    return device;
  }

  createOscillator(audio = true) {
    const device = this.createDevice(audio ? "VCO" : "LFO");

    const node = new OscillatorNode(this.ecs.audio.ctx, {
      frequency: audio ? 440 : 1,
    });
    node.start();

    if (audio) {
      const gainNode = new GainNode(this.ecs.audio.ctx, {
        gain:
          2 /* make up for division caused by the knob */ *
          55 /* convert CV to Hz */,
      });
      gainNode.connect(node.frequency, 0);

      this.createPort(device, 20, 40, {
        name: "freq",
        node: gainNode,
        input: 0,
      });
    }

    this.createKnob(device, 70, 40, {
      name: audio ? "freq" : "rate",
      param: this.clampParam(node.frequency, 0, audio ? 20000 : 20),
    });

    if (audio) {
      this.createKnob(device, 44, 90, {
        name: "dtn",
        param: this.clampParam(node.detune, -100, 100),
      });
    }

    this.createOscillatorWaveButton(device, node, "sine", 0, audio);
    this.createOscillatorWaveButton(device, node, "triangle", 1, audio);
    this.createOscillatorWaveButton(device, node, "sawtooth", 2, audio);
    this.createOscillatorWaveButton(device, node, "square", 3, audio);

    let outNode: AudioNode = node;

    if (!audio) {
      const gainNode = new GainNode(this.ecs.audio.ctx, { gain: 50 });
      outNode.connect(gainNode, 0);
      outNode = gainNode;

      this.createKnob(device, 20, 40, {
        name: "amp",
        param: this.clampParam(gainNode.gain, 0, 100),
      });
    }

    this.createPort(device, 44, audio ? 240 : 190, {
      name: "out",
      node: outNode,
      output: 0,
    });

    return device;
  }

  createOscillatorWaveButton(
    device: Entity,
    node: OscillatorNode,
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
      onClick: () => {
        node.type = type;
      },
      get down() {
        return node.type === type;
      },
      set down(down) {},
    });
    this.ecs.pointerGrabTargets.set(button, {});
  }

  createLPF() {
    const device = this.createDevice("LPF");
    const node = new BiquadFilterNode(this.ecs.audio.ctx);
    this.createPort(device, 45, 40, { name: "in", node, input: 0 });
    this.createPort(device, 20, 90, { name: "fm", param: node.frequency });
    this.createKnob(device, 70, 90, { name: "freq", param: node.frequency });
    this.createPort(device, 45, 140, { name: "out", node, output: 0 });
    return device;
  }

  createVCA() {
    const device = this.createDevice("VCA");

    const node1 = new GainNode(this.ecs.audio.ctx);
    this.createPort(device, 45, 40, { name: "in", node: node1, input: 0 });
    this.createKnob(device, 70, 90, {
      name: "gain",
      param: this.clampParam(node1.gain, 0, 2),
    });

    const node2 = new GainNode(this.ecs.audio.ctx);
    this.createPort(device, 20, 90, { name: "out", node: node2, output: 0 });
    this.createVCAGainButton(device, 30, 140, node2.gain, 2);
    this.createVCAGainButton(device, 60, 140, node2.gain, 100);

    node1.connect(node2, 0, 0);

    return device;
  }

  createVCAGainButton(
    device: Entity,
    x: number,
    y: number,
    param: AudioParam,
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
    let mouseDown = false;
    const button = {
      label: "x" + gain,
      get down() {
        return mouseDown || param.value === gain;
      },
      set down(down) {
        mouseDown = down;
      },
      onClick: () => {
        param.value = gain;
      },
    };
    this.ecs.buttons.set(entity, button);
    return entity;
  }

  createPanner() {
    const device = this.createDevice("Panner");
    const node = new StereoPannerNode(this.ecs.audio.ctx);
    this.createPort(device, 20, 40, { name: "in", node, input: 0 });
    this.createKnob(device, 20, 90, { name: "pan", param: node.pan });
    this.createPort(device, 20, 140, { name: "out", node, output: 0 });
    return device;
  }

  createDelay(maxDelayTime = 10) {
    const device = this.createDevice("Delay");
    const node = new DelayNode(this.ecs.audio.ctx, { maxDelayTime });
    this.createPort(device, 20, 40, { name: "in", node, input: 0 });
    this.createKnob(device, 20, 90, { name: "val", param: node.delayTime });
    this.createPort(device, 20, 140, { name: "out", node, output: 0 });
    return device;
  }

  createScope() {
    const device = this.createDevice("Scope");
    this.ecs.transforms.set(device, { x: 0, y: 0, w: 300, h: 200 });
    const node = new AnalyserNode(this.ecs.audio.ctx);
    this.ecs.scopes.set(device, { node });
    this.createPort(device, 10, 10, {
      name: "in",
      node,
      input: 0,
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

  createPort(device: Entity, x: number, y: number, port: CPort) {
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
    this.ecs.ports.set(entity, {
      name,
      ...port,
    });
    this.ecs.pointerGrabTargets.set(entity, {});
    return entity;
  }

  createKnob(device: Entity, x: number, y: number, knob: CKnob) {
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
    this.ecs.knobs.set(entity, {
      name,
      ...knob,
    });
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
