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

      const size = this.ecs.audio.getAnalyserFrequencyBinCount(scope.node);
      const buffer = new Float32Array(size);
      this.ecs.audio.getAnalyserFloatTimeDomainData(scope.node, buffer);

      const zx = buffer.findIndex((sample) => ((sample * 100) | 0) === 0);
      const ox = buffer.findIndex(
        (sample, x) => x > zx && ((sample * 100) | 0) > 0
      );

      ctx.beginPath();
      for (let x = 0; x < buffer.length; ++x) {
        ctx.lineTo(
          (x++ * transform.w) / buffer.length,
          buffer[(ox + x) % buffer.length] * (transform.h / 2)
        );
      }
      ctx.stroke();

      ctx.restore();
    }
  }
}
