import { AbstractRenderer } from "./AbstractRenderer";
import { ECS } from "./ECS";

export class SScopeRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const ctx = this.ecs.display.ctx;
    ctx.fillStyle = "black";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    for (const [entity, scope] of this.ecs.scopes) {
      const transform = this.ecs.display.getWorldTransform(entity);
      ctx.save();
      ctx.translate(transform.x, transform.y + transform.h / 2);
      ctx.scale(1, -1);
      ctx.fillRect(0, -transform.h / 2, transform.w, transform.h);

      const buffer = new Float32Array(scope.node.frequencyBinCount);
      scope.node.getFloatTimeDomainData(buffer);
      let x = 0;
      ctx.beginPath();
      for (const sample of buffer) {
        ctx.lineTo(
          (x++ * transform.w) / buffer.length,
          sample * (transform.h / 2)
        );
      }
      ctx.stroke();

      ctx.restore();
    }
  }
}
