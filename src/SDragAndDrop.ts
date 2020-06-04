import { ECS } from "./ECS";
import { IUpdatable } from "./IUpdatable";

export class SDragAndDrop implements IUpdatable {
  constructor(readonly ecs: ECS) {}

  update() {
    for (const entity of this.ecs.dragAndDropTargets) {
      const grabTarget = this.ecs.pointerGrabTargets.get(entity)!;
      if (grabTarget.grabbed) {
        const pointerTransform = this.ecs.transforms.get(
          grabTarget.grabbed.pointer
        )!;
        const transform = this.ecs.transforms.get(entity)!;
        transform.x = pointerTransform.x + grabTarget.grabbed.dx;
        transform.y = pointerTransform.y + grabTarget.grabbed.dy;
      }
    }
  }
}
