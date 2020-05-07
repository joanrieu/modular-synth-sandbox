import { CDevice } from "./CDevice";
import { CPort } from "./CPort";
import { ECS, Entity } from "./ECS";

export class SPrefabs {
  constructor(readonly ecs: ECS) {}

  createScene() {
    const [master, speakers] = this.createMaster({ x: 300, y: 300 });
    const [osc, out] = this.createOscillator({ x: 500, y: 300 });
    this.createWire(out, speakers);
  }

  createMaster({ x, y }: { x: number; y: number }) {
    const device = this.createDevice({
      name: "Master",
      x,
      y,
    });

    const speakers = this.createPort({
      device,
      name: "spk",
      node: this.ecs.audio.ctx.destination,
      input: 0,
      x: 20,
      y: 40,
    });

    return [device, speakers];
  }

  createOscillator({
    x,
    y,
    options,
  }: {
    x: number;
    y: number;
    options?: OscillatorOptions;
  }) {
    const device = this.createDevice({
      name: "Osc",
      x,
      y,
    });

    const node = new OscillatorNode(this.ecs.audio.ctx, options);
    node.start();

    const port = this.createPort({
      name: "out",
      device,
      node,
      output: 0,
      x: 20,
      y: 40,
    });

    return [device, port];
  }

  createDevice({
    name,
    x,
    y,
    ...device
  }: { name: string; x: number; y: number } & Omit<CDevice, "ports">) {
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
    this.ecs.pointerTargets.add(entity);
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
    this.ecs.pointerTargets.add(entity);
    this.ecs.pointerGrabTargets.set(entity, {});
    return entity;
  }

  createWire(source: Entity, destination: Entity) {
    const {
      ecs: { ports },
    } = this;
    const sourcePort = ports.get(source)!;
    const destinationPort = ports.get(destination)!;
    if (
      sourcePort.output !== undefined &&
      destinationPort.input !== undefined
    ) {
      sourcePort.node.connect(
        destinationPort.node,
        sourcePort.output,
        destinationPort.input
      );
      this.ecs.wires.set(this.ecs.createEntity("wire"), {
        source,
        destination,
      });
    } else if (
      sourcePort.input !== undefined &&
      destinationPort.output !== undefined
    ) {
      this.createWire(destination, source);
    }
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
