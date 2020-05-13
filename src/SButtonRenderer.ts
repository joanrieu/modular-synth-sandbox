import { AbstractRenderer } from "./AbstractRenderer";
import { ECS } from "./ECS";

export class SButtonRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const ctx = this.ecs.display.ctx;
    ctx.lineWidth = 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "10px monospace";

    for (const [entity, button] of this.ecs.buttons) {
      const { x, y, w, h } = this.ecs.display.getWorldTransform(entity);

      ctx.strokeStyle = "grey";
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = button.down ? "grey" : "#222";
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = "white";
      ctx.fillText(button.label, x + w / 2, y + h / 2);
    }
  }
}
