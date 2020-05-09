import { ECS } from "./ECS";
import { AbstractRenderer } from "./AbstractRenderer";

export class SPortRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const ctx = this.ecs.display.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "10px monospace";

    for (const [entity, port] of this.ecs.ports) {
      const { x, y, w, h } = this.ecs.display.getWorldTransform(entity);
      const r = Math.min(w, h) / 2;
      const color =
        typeof port.input === "number" ? "lime" : port.param ? "cyan" : "red";

      const valueToAngle = (value: number) =>
        Math.PI * (value * 2 - 1) * 0.7 - Math.PI / 2;

      if (port.param) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + r, y + r, r, valueToAngle(0), valueToAngle(1));
        ctx.stroke();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + r, y + r, r, valueToAngle(0), valueToAngle(0.5));
        ctx.stroke();
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + r, y + r, r, -Math.PI, Math.PI);
        ctx.stroke();
      }

      ctx.fillStyle = color;
      ctx.fillText(port.name, x + r, y + r);
    }
  }
}
