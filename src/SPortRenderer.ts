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

    for (const [entity, port] of this.ecs.ports) {
      const { x, y, w, h } = this.ecs.display.getWorldTransform(entity);
      const r = Math.min(w, h) / 2;

      let value = 1;
      if (port.param) {
        const op = port.param.maxValue > 1000 ? Math.log : Math.abs;
        value =
          op(port.param.value - port.param.minValue) /
          op(port.param.maxValue - port.param.minValue);
        value = Math.max(0, Math.min(1, value));
      }

      ctx.strokeStyle = ctx.fillStyle =
        "hsl(180, " +
        ((value * 100) | 0) +
        "%, " +
        ((50 + value * 30) | 0) +
        "%)";

      const valueToAngle = (value: number) =>
        Math.PI * (value * 2 - 1) * 0.7 - Math.PI / 2;

      const minAngle = valueToAngle(0);
      const valueAngle = valueToAngle(value);
      const maxAngle = valueToAngle(1);

      if (port.param) {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + r, y + r, r, minAngle, maxAngle);
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + r, y + r, r, minAngle, valueAngle);
        ctx.stroke();
      } else {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + r, y + r, r, -Math.PI, Math.PI);
        ctx.stroke();
      }

      ctx.fillText(port.name, x + r, y + r);
    }
  }
}
