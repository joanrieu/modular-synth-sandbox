import { ECS } from "./ECS";
import { IUpdatable } from "./IUpdatable";

export class SKnobManager implements IUpdatable {
  constructor(readonly ecs: ECS) {}

  update() {
    for (const [entity, knob] of this.ecs.knobs) {
      const target = this.ecs.pointerGrabTargets.get(entity)!;
      if (target.grabbed) {
        const dragZone = this.ecs.knobDragZones.get(entity);
        const { y } = this.ecs.display.getWorldTransform(
          target.grabbed.pointer
        );

        const op = (x: number) => (knob.max > 1000 ? Math.log10(x) : x);
        const opInv = (x: number) => (knob.max > 1000 ? 10 ** x : x);
        if (dragZone) {
          let percent = (y - dragZone.minY) / (dragZone.maxY - dragZone.minY);
          percent = Math.max(0, Math.min(1, percent));

          this.ecs.audio.setParamValue(
            knob.param,
            knob.min + opInv(percent * op(knob.max - knob.min))
          );
        } else {
          let percent =
            op(this.ecs.audio.getParamValue(knob.param) - knob.min) /
            op(knob.max - knob.min);
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
