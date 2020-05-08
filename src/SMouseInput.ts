import { CPointer } from "./CPointer";
import { CTransform } from "./CTransform";
import { ECS, Entity } from "./ECS";

export class SMouseInput {
  mouse = this.ecs.createEntity("mouse");
  transform: CTransform = { x: 0, y: 0, w: 1, h: 1 };
  pointer: CPointer = { pressed: false };

  constructor(readonly ecs: ECS) {
    ecs.transforms.set(this.mouse, this.transform);
    ecs.pointers.set(this.mouse, this.pointer);
    ecs.display.canvas.addEventListener("mousedown", this.onMouseDown);
    ecs.display.canvas.addEventListener("mouseup", this.onMouseUp);
    ecs.display.canvas.addEventListener("mousemove", this.onMouseMove);
  }

  onMouseDown = (e: MouseEvent): void => {
    this.pointer.pressed = true;
  };

  onMouseUp = () => {
    this.pointer.pressed = false;
  };

  onMouseMove = (e: MouseEvent) => {
    this.transform.x = e.clientX;
    this.transform.y = e.clientY;
    this.pointer.target = this.findTargetEntity(this.transform);
  };

  findTargetEntity(
    pointerTransform: CTransform,
    parent?: Entity
  ): Entity | undefined {
    for (const targetEntity of this.ecs.pointerGrabTargets.keys()) {
      const targetTransform = this.ecs.display.getWorldTransform(targetEntity);
      if (
        targetTransform.parent === parent &&
        targetTransform.x <= this.transform.x &&
        targetTransform.y <= this.transform.y &&
        targetTransform.x + targetTransform.w > this.transform.x &&
        targetTransform.y + targetTransform.h > this.transform.y
      ) {
        return this.findTargetEntity(pointerTransform, targetEntity);
      }
    }
    return parent;
  }
}
