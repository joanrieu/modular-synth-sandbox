import { CPointer } from "./CPointer";
import { CTransform } from "./CTransform";
import { ECS, Entity } from "./ECS";

export class SMouseInput {
  mouse = this.ecs.createEntity("mouse");
  transform: CTransform = { x: 0, y: 0, w: 1, h: 1 };
  pointer: CPointer = { pressed: false };
  target?: Entity;

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
    this.target = this.findTargetEntity();
  };

  findTargetEntity(parent?: Entity): Entity | undefined {
    for (const entity of this.ecs.pointerTargets) {
      if (this.ecs.pointers.has(entity)) continue;
      const transform = this.ecs.display.getWorldTransform(entity);
      if (
        transform.parent === parent &&
        transform.x <= this.transform.x &&
        transform.y <= this.transform.y &&
        transform.x + transform.w > this.transform.x &&
        transform.y + transform.h > this.transform.y
      ) {
        return this.findTargetEntity(entity);
      }
    }
    return parent;
  }
}
