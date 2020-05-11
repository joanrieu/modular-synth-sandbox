import { AbstractUpdater } from "./AbstractUpdater";
import { ECS } from "./ECS";

export class SKnobManager extends AbstractUpdater {
  constructor(readonly ecs: ECS) {
    super();
  }

  update() {
    for (const [entity, knob] of this.ecs.knobs) {
      const target = this.ecs.pointerGrabTargets.get(entity)!;
      if (target.grabbed) {
        const dragZone = this.ecs.knobDragZones.get(entity);
        const { y } = this.ecs.display.getWorldTransform(
          target.grabbed.pointer
        );

        const op = (x: number) =>
          knob.param.maxValue > 1000 ? Math.log10(x) : x;
        const opInv = (x: number) => (knob.param.maxValue > 1000 ? 10 ** x : x);
        if (dragZone) {
          let percent = (y - dragZone.minY) / (dragZone.maxY - dragZone.minY);
          percent = Math.max(0, Math.min(1, percent));

          knob.param.value =
            knob.param.minValue +
            opInv(percent * op(knob.param.maxValue - knob.param.minValue));
        } else {
          let percent =
            op(knob.param.value - knob.param.minValue) /
            op(knob.param.maxValue - knob.param.minValue);
          percent = Math.max(0, Math.min(1, percent));

          const scale = 200;
          const minY = y + percent * scale;
          const maxY = minY - scale;

          this.ecs.knobDragZones.set(entity, { minY, maxY });
        }
      } else {
        this.ecs.knobDragZones.delete(entity);
      }
    }
  }
}
