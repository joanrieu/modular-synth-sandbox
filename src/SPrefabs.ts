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

  createOscillator() {
    const device = this.createDevice("Osc");

    const node = new OscillatorNode(this.ecs.audio.ctx);
    node.start();

    this.createOscillatorWaveButton(device, node, "sine", 0);
    this.createOscillatorWaveButton(device, node, "triangle", 1);
    this.createOscillatorWaveButton(device, node, "sawtooth", 2);
    this.createOscillatorWaveButton(device, node, "square", 3);

    this.createKnob({
      name: "dtn",
      device,
      param: this.clampParam(node.detune, -100, 100),
      x: 44,
      y: 140,
    });

    this.createPort({
      name: "out",
      device,
      node,
      output: 0,
      x: 44,
      y: 190,
    });

    return device;
  }

  createOscillatorWaveButton(
    device: Entity,
    node: OscillatorNode,
    type: OscillatorType,
    line: number
  ) {
    const button = this.ecs.createEntity("osc-waveform-" + type);
    this.ecs.transforms.set(button, {
      parent: device,
      x: 20,
      y: 40 + 19 * line,
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
      node,
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

  createGain() {
    const device = this.createDevice("Gain");

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
      param: this.clampParam(node.gain, 0, 2),
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
    let spot = 1;
    const nextPosition = () => ({
      x: this.ecs.display.canvas.width - 120 * spot++,
      y: 10,
      w: 100,
      h: 20,
    });

    this.createSpawnButton("Panner", () => this.createPanner(), nextPosition());

    this.createSpawnButton("Gain", () => this.createGain(), nextPosition());

    this.createSpawnButton("LPF", () => this.createLPF(), nextPosition());

    this.createSpawnButton(
      "Osc",
      () => this.createOscillator(),
      nextPosition()
    );

    this.createSpawnButton("Master", () => this.createMaster(), nextPosition());
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
