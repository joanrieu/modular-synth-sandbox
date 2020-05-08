import { CDevice } from "./CDevice";
import { CGrabTarget } from "./CGrabTarget";
import { CPort } from "./CPort";
import { CTransform } from "./CTransform";
import { ECS, Entity } from "./ECS";

export class SPrefabs {
  constructor(readonly ecs: ECS) {}

  createScene() {
    this.createToolbar();
    this.createMaster({ x: 300, y: 300 });
  }

  createMaster({ x, y }: { x: number; y: number }) {
    const device = this.createDevice({ name: "Master", x, y });

    const speakers = this.createPort({
      device,
      name: "spk",
      node: this.ecs.audio.ctx.destination,
      input: 0,
      x: 20,
      y: 40,
    });

    return device;
  }

  createOscillator(options?: OscillatorOptions) {
    const device = this.createDevice({ name: "Osc" });

    const node = new OscillatorNode(this.ecs.audio.ctx, options);
    node.start();

    this.createPort({
      name: "out",
      device,
      node,
      output: 0,
      x: 20,
      y: 40,
    });

    return device;
  }

  createLPF(options?: BiquadFilterOptions) {
    const device = this.createDevice({ name: "LPF" });

    const node = new BiquadFilterNode(this.ecs.audio.ctx, options);

    this.createPort({
      name: "in",
      device,
      node,
      input: 0,
      x: 20,
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

    return device;
  }

  createDevice({
    name,
    x = 0,
    y = 0,
    ...device
  }: { name: string; x?: number; y?: number } & Omit<CDevice, "ports">) {
    const getContentBox = this.getContentBox;
    const entity = this.ecs.createEntity(name.toLowerCase());
    this.ecs.devices.set(entity, { name, ports: [], ...device });
    this.ecs.transforms.set(entity, {
      x,
      y,
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
    this.ecs.devices.get(device)!.ports.push(entity);
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

  createToolbar() {
    let spot = 1;
    const nextPosition = () => ({
      x: this.ecs.display.canvas.width - 120 * spot++,
      y: 10,
      w: 100,
      h: 20,
    });

    this.createSpawnButton(
      "Osc",
      () => this.createOscillator(),
      nextPosition()
    );
    this.createSpawnButton("LPF", () => this.createLPF(), nextPosition());
  }

  createSpawnButton(name: string, spawn: () => Entity, transform: CTransform) {
    const entity = this.ecs.createEntity("button");
    const grabTarget: CGrabTarget = {};
    this.ecs.transforms.set(entity, transform);
    this.ecs.pointerGrabTargets.set(entity, grabTarget);
    this.ecs.buttons.set(entity, {
      label: name,
      down: false,
      onClick: () => {
        const entity = spawn();
        this.ecs.pointerGrabTargets.get(entity)!.grabbed = {
          pointer: grabTarget.grabbed!.pointer,
          dx: 0,
          dy: 0,
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
