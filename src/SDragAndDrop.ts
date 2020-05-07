import { AbstractUpdater } from "./AbstractUpdater";
import { ECS } from "./ECS";

export class SDragAndDrop extends AbstractUpdater {
  constructor(readonly ecs: ECS) {
    super();
  }

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
