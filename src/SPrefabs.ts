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

    this.createPort({
      device,
      name: "spk",
      node: this.ecs.audio.ctx.destination,
      input: 0,
      x: 20,
      y: 40,
    });

    return device;
  }

  createOscillator(audio = true) {
    const device = this.createDevice(audio ? "Osc" : "LFO");

    const node = new OscillatorNode(this.ecs.audio.ctx, {
      frequency: audio ? 440 : 1,
    });
    node.start();

    if (audio) {
      this.createPort({
        name: "freq",
        device,
        param: node.frequency,
        x: 20,
        y: 40,
      });
    }

    this.createKnob({
      name: audio ? "freq" : "rate",
      device,
      param: this.clampParam(node.frequency, 0, audio ? 20000 : 20),
      x: 70,
      y: 40,
    });

    if (audio) {
      this.createKnob({
        name: "dtn",
        device,
        param: this.clampParam(node.detune, -100, 100),
        x: 44,
        y: 90,
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

      this.createKnob({
        name: "amp",
        device,
        param: this.clampParam(gainNode.gain, 0, 100),
        x: 20,
        y: 40,
      });
    }

    this.createPort({
      name: "out",
      device,
      node: outNode,
      output: 0,
      x: 44,
      y: audio ? 240 : 190,
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

    this.createPort({
      name: "in",
      device,
      node,
      input: 0,
      x: 45,
      y: 40,
    });

    this.createPort({
      name: "fm",
      device,
      param: node.frequency,
      x: 20,
      y: 90,
    });

    this.createKnob({
      name: "freq",
      device,
      param: node.frequency,
      x: 70,
      y: 90,
    });

    this.createPort({
      name: "out",
      device,
      node,
      output: 0,
      x: 45,
      y: 140,
    });

    return device;
  }

  createGain(maxGain: number) {
    const device = this.createDevice("Gain x" + maxGain);

    const node = new GainNode(this.ecs.audio.ctx);

    this.createPort({
      name: "in",
      device,
      node,
      input: 0,
      x: 45,
      y: 40,
    });

    this.createPort({
      name: "out",
      device,
      node,
      output: 0,
      x: 20,
      y: 90,
    });

    this.createKnob({
      name: "gain",
      device,
      param: this.clampParam(node.gain, 0, maxGain),
      x: 70,
      y: 90,
    });

    return device;
  }

  createPanner() {
    const device = this.createDevice("Panner");

    const node = new StereoPannerNode(this.ecs.audio.ctx);

    this.createPort({
      name: "in",
      device,
      node,
      input: 0,
      x: 20,
      y: 40,
    });

    this.createKnob({
      name: "pan",
      device,
      param: node.pan,
      x: 20,
      y: 90,
    });

    this.createPort({
      name: "out",
      device,
      node,
      output: 0,
      x: 20,
      y: 140,
    });

    return device;
  }

  createDelay(maxDelayTime = 10) {
    const device = this.createDevice("Delay");

    const node = new DelayNode(this.ecs.audio.ctx, { maxDelayTime });

    this.createPort({
      name: "in",
      device,
      node,
      input: 0,
      x: 20,
      y: 40,
    });

    this.createKnob({
      name: "val",
      device,
      param: node.delayTime,
      x: 20,
      y: 90,
    });

    this.createPort({
      name: "out",
      device,
      node,
      output: 0,
      x: 20,
      y: 140,
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

  createPort({
    name,
    device,
    x,
    y,
    ...port
  }: { device: Entity; name: string; x: number; y: number } & CPort) {
    const entity = this.ecs.createEntity(
      device.description + "-" + name.toLowerCase()
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

  createKnob({
    name,
    device,
    x,
    y,
    ...knob
  }: { device: Entity; name: string; x: number; y: number } & CKnob) {
    const entity = this.ecs.createEntity(
      device.description + "-" + name.toLowerCase()
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
      "Osc",
      () => this.createOscillator(),
      nextPosition()
    );

    this.createSpawnButton(
      "LFO",
      () => this.createOscillator(false),
      nextPosition()
    );

    this.createSpawnButton("LPF", () => this.createLPF(), nextPosition());

    this.createSpawnButton("Gain x2", () => this.createGain(2), nextPosition());

    this.createSpawnButton(
      "Gain x100",
      () => this.createGain(100),
      nextPosition()
    );

    this.createSpawnButton("Panner", () => this.createPanner(), nextPosition());

    this.createSpawnButton("Delay", () => this.createDelay(), nextPosition());
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
