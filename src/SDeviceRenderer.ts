import { AbstractRenderer } from "./AbstractRenderer";
import { ECS } from "./ECS";

export class SDeviceRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const ctx = this.ecs.display.ctx;
    ctx.strokeStyle = "grey";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "15px monospace";
    ctx.fillStyle = "white";
    ctx.lineWidth = 3;
    for (const [entity, device] of this.ecs.devices) {
      const { x, y, w, h } = this.ecs.display.getWorldTransform(entity);
      ctx.strokeRect(x, y, w, h);
      ctx.fillText(device.name, x + w / 2, y + 10);
    }
  }
}
