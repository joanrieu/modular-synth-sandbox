import { AbstractRenderer } from "./AbstractRenderer";
import { ECS } from "./ECS";

export class SWireRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const ctx = this.ecs.display.ctx;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 255, 255, .3)";
    for (const [entity, wire] of this.ecs.wires) {
      const source = this.ecs.display.getWorldTransform(wire.source);
      const destination = this.ecs.display.getWorldTransform(wire.destination);
      ctx.beginPath();
      ctx.moveTo(source.x + source.w / 2, source.y + source.h * 0.8);
      ctx.bezierCurveTo(
        source.x + source.w / 2,
        source.y + source.h * 0.8 + 100,
        destination.x + destination.w / 2,
        destination.y + destination.h * 0.8 + 100,
        destination.x + destination.w / 2,
        destination.y + destination.h * 0.8
      );
      ctx.stroke();
    }
  }
}
