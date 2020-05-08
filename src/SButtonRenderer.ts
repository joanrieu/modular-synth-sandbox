import { AbstractRenderer } from "./AbstractRenderer";
import { ECS } from "./ECS";

export class SButtonRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const ctx = this.ecs.display.ctx;
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const [entity, button] of this.ecs.buttons) {
      const { x, y, w, h } = this.ecs.display.getWorldTransform(entity);
      ctx.fillStyle = button.down ? "#555" : "#333";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "#777";
      ctx.strokeRect(x, y, w, h);
      ctx.strokeStyle = "white";
      ctx.strokeText(button.label, x + w / 2, y + h / 2);
    }
  }
}
