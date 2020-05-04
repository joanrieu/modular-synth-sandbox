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
    ctx.font = "12px monospace";
    for (const [entity, port] of this.ecs.ports) {
      const { x, y, w, h } = this.ecs.display.getWorldTransform(entity);
      ctx.strokeStyle = typeof port.input === "number" ? "lime" : "red";
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      const r = Math.min(w, h) / 2;
      ctx.arc(x + r, y + r, r, -Math.PI, Math.PI);
      ctx.stroke();
      ctx.fillText(port.name, x + r, y + r);
    }
  }
}
