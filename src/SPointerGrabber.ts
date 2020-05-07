import { AbstractUpdater } from "./AbstractUpdater";
import { ECS, Entity } from "./ECS";

export class SPointerGrabber extends AbstractUpdater {
  constructor(readonly ecs: ECS) {
    super();
  }

  dummyGrabTargets = new Set<Entity>();

  update() {
    const freePointers = new Map(this.ecs.pointers);
    const freeTargets = new Set(this.ecs.pointerGrabTargets.keys());

    for (const [grabbedEntity, grabTarget] of this.ecs.pointerGrabTargets) {
      if (grabTarget.grabbed) {
        const { pressed } = this.ecs.pointers.get(grabTarget.grabbed.pointer)!;
        if (pressed) {
          freePointers.delete(grabTarget.grabbed.pointer);
          freeTargets.delete(grabbedEntity);
        } else {
          delete grabTarget.grabbed;
          if (this.dummyGrabTargets.has(grabbedEntity)) {
            this.dummyGrabTargets.delete(grabbedEntity);
            this.ecs.pointerGrabTargets.delete(grabbedEntity);
          }
        }
      }
    }

    for (const [pointer, { target, pressed }] of freePointers) {
      if (pressed && target && freeTargets.has(target)) {
        const pointerTransform = this.ecs.transforms.get(pointer)!;
        const grabbedTransform = this.ecs.transforms.get(target)!;
        const dx = grabbedTransform.x - pointerTransform.x;
        const dy = grabbedTransform.y - pointerTransform.y;
        this.ecs.pointerGrabTargets.get(target)!.grabbed = { pointer, dx, dy };
      } else if (pressed) {
        this.cancelGrab(pointer);
      }
    }
  }

  cancelGrab(pointer: Entity) {
    const dummy = this.ecs.createEntity("cancelled-grab-target");
    this.dummyGrabTargets.add(dummy);
    this.ecs.pointerGrabTargets.set(dummy, {
      grabbed: {
        pointer,
        dx: 0,
        dy: 0,
      },
    });
  }
}
