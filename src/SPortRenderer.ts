import { ECS } from "./ECS";
import { IRenderable } from "./IRenderable";

export class SPortRenderer implements IRenderable {
  constructor(readonly ecs: ECS) {}

  render() {
    const ctx = this.ecs.display.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "10px monospace";
    ctx.lineWidth = 1;

    const connectedPorts = new Set(
      [...this.ecs.wires.values()].flatMap((wire) => [
        wire.source,
        wire.destination,
      ])
    );

    for (const [entity, port] of this.ecs.ports) {
      const { x, y, w, h } = this.ecs.display.getWorldTransform(entity);
      const r = Math.min(w, h) / 2;

      const on = connectedPorts.has(entity);
      ctx.strokeStyle = ctx.fillStyle = on ? "white" : "grey";

      ctx.beginPath();
      ctx.arc(x + r, y + r, r, -Math.PI, Math.PI);
      ctx.stroke();

      ctx.fillText(port.name, x + r, y + r);
    }
  }
}
