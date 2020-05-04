import { ECS, Entity } from "./ECS";

export class SPrefabs {
  constructor(readonly ecs: ECS) {}

  createScene() {
    const [master, speakers] = this.createMaster({ x: 300, y: 300 });
    const [osc, out] = this.createOscillator({ x: 500, y: 300 });
    this.createWire(out, speakers);
  }

  createMaster({ x, y }: { x: number; y: number }) {
    const {
      ecs: { devices, transforms, ports, createEntity, audio },
      getContentBox,
    } = this;
    const device = createEntity("master");
    const speakers = createEntity("master-speakers");

    transforms.set(device, {
      x,
      y,
      get w() {
        return getContentBox(device, "w");
      },
      get h() {
        return getContentBox(device, "h");
      },
    });
    devices.set(device, {
      name: "Master",
      ports: [speakers],
    });

    transforms.set(speakers, {
      parent: device,
      x: 20,
      y: 40,
      w: 32,
      h: 32,
    });
    ports.set(speakers, {
      name: "spk",
      node: audio.ctx.destination,
      input: 0,
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
    const {
      ecs: {
        createEntity,
        transforms,
        devices,
        ports,
        audio: { ctx },
      },
      getContentBox,
    } = this;

    const device = createEntity("osc");
    const port = createEntity(device.description + "-out");

    const node = new OscillatorNode(ctx, options);
    node.start();

    transforms.set(device, {
      x,
      y,
      get w() {
        return getContentBox(device, "w");
      },
      get h() {
        return getContentBox(device, "h");
      },
    });
    devices.set(device, {
      name: "Osc",
      ports: [port],
    });

    transforms.set(port, {
      parent: device,
      x: 20,
      y: 40,
      w: 32,
      h: 32,
    });
    ports.set(port, {
      name: "out",
      node,
      output: 0,
    });

    return [device, port];
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
