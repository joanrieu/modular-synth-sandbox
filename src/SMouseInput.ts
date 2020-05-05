import { ECS } from "./ECS";

export class SMouseInput {
  constructor(readonly ecs: ECS) {
    const mouse = ecs.createEntity("mouse");
    const transform = { x: 0, y: 0, w: 1, h: 1 };
    const pointer = { pressed: false };
    ecs.transforms.set(mouse, transform);
    ecs.pointers.set(mouse, pointer);
    ecs.display.canvas.addEventListener("mousedown", (e) => {
      pointer.pressed = true;
    });
    ecs.display.canvas.addEventListener("mouseup", () => {
      pointer.pressed = false;
    });
    ecs.display.canvas.addEventListener("mousemove", (e) => {
      transform.x = e.clientX;
      transform.y = e.clientY;
    });
  }
}
