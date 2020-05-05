import { CPointer } from "./CPointer";
import { CPointerTarget } from "./CPointerTarget";
import { CTransform } from "./CTransform";
import { ECS, Entity } from "./ECS";

export class SMouseInput {
  mouse = this.ecs.createEntity("mouse");
  transform: CTransform = { x: 0, y: 0, w: 1, h: 1 };
  pointer: CPointer = { pressed: false };
  pointerTarget?: CPointerTarget;

  constructor(readonly ecs: ECS) {
    ecs.transforms.set(this.mouse, this.transform);
    ecs.pointers.set(this.mouse, this.pointer);
    ecs.display.canvas.addEventListener("mousedown", (e) => {
      this.pointer.pressed = true;
      this.updatePointerTarget({ pressed: true });
    });
    ecs.display.canvas.addEventListener("mouseup", () => {
      this.pointer.pressed = false;
      this.updatePointerTarget({ pressed: false });
    });
    ecs.display.canvas.addEventListener("mousemove", (e) => {
      this.transform.x = e.clientX;
      this.transform.y = e.clientY;
      this.updatePointerTarget({
        dx: e.movementX,
        dy: e.movementY,
      });
    });
  }

  updatePointerTarget(diff: Partial<CPointerTarget>) {
    const target = this.findTargetEntity(this.transform);
    const newPointerTarget = target && this.ecs.pointerTargets.get(target)!;
    if (newPointerTarget !== this.pointerTarget && this.pointerTarget) {
      this.pointerTarget.pressed = false;
      this.pointerTarget.dx = 0;
      this.pointerTarget.dy = 0;
    }
    this.pointerTarget = newPointerTarget;
    if (this.pointerTarget) {
      Object.assign(this.pointerTarget, diff);
    }
  }

  findTargetEntity(transform: CTransform, parent?: Entity): Entity | undefined {
    for (const [entity2] of this.ecs.pointerTargets) {
      if (this.ecs.pointers.has(entity2)) continue;
      const transform2 = this.ecs.display.getWorldTransform(entity2);
      if (
        transform2.parent === parent &&
        transform2.x <= transform.x &&
        transform2.y <= transform.y &&
        transform2.x + transform2.w > transform.x &&
        transform2.y + transform2.h > transform.y
      ) {
        return this.findTargetEntity(transform, entity2);
      }
    }
    return parent;
  }
}
