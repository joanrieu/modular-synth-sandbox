import { AbstractRenderer } from "./AbstractRenderer";
import { ECS } from "./ECS";

export class SPortRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const ctx = this.ecs.display.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "10px monospace";
    ctx.lineWidth = 1;
    ctx.strokeStyle = ctx.fillStyle = "grey";

    for (const [entity, port] of this.ecs.ports) {
      const { x, y, w, h } = this.ecs.display.getWorldTransform(entity);
      const r = Math.min(w, h) / 2;

      ctx.beginPath();
      ctx.arc(x + r, y + r, r, -Math.PI, Math.PI);
      ctx.stroke();

      ctx.fillText(port.name, x + r, y + r);
    }
  }
}
