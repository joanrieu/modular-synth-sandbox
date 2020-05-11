import { AbstractRenderer } from "./AbstractRenderer";
import { ECS } from "./ECS";

export class SKnobRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const ctx = this.ecs.display.ctx;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "10px monospace";

    const valueToAngle = (value: number) =>
      Math.PI * (value * 2 - 1) * 0.7 - Math.PI / 2;
    const minAngle = valueToAngle(0);
    const maxAngle = valueToAngle(1);

    for (const [entity, knob] of this.ecs.knobs) {
      const { x, y, w, h } = this.ecs.display.getWorldTransform(entity);
      const r = Math.min(w, h) / 2;

      const op = (x: number) =>
        knob.param.maxValue > 1000 ? Math.log10(x) : x;
      let value =
        op(knob.param.value - knob.param.minValue) /
        op(knob.param.maxValue - knob.param.minValue);
      value = Math.max(0, Math.min(1, value));
      const valueAngle = valueToAngle(value);

      ctx.strokeStyle = ctx.fillStyle =
        "hsl(180, " +
        ((value * 100) | 0) +
        "%, " +
        ((50 + value * 30) | 0) +
        "%)";

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, minAngle, maxAngle);
      ctx.stroke();

      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, minAngle, valueAngle);
      ctx.stroke();

      ctx.fillText(knob.name, x + r, y + r);

      const grabTarget = this.ecs.pointerGrabTargets.get(entity)!;
      if (grabTarget.grabbed) {
        const { x, y } = this.ecs.display.getWorldTransform(
          grabTarget.grabbed.pointer
        );
        const d = 30;

        ctx.fillStyle = "white";
        ctx.fillText(knob.param.value.toFixed(2), x + d, y + d);
      }
    }
  }
}
