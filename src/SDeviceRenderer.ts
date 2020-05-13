import { AbstractRenderer } from "./AbstractRenderer";
import { ECS } from "./ECS";

export class SDeviceRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const ctx = this.ecs.display.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "bold 15px monospace";
    ctx.lineWidth = 2;
    for (const [entity, device] of this.ecs.devices) {
      const { x, y, w, h } = this.ecs.display.getWorldTransform(entity);

      ctx.strokeStyle = "grey";
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "#222";
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = "white";
      ctx.fillText(device.name, x + w / 2, y + 10, w - 20);
    }
  }
}
