import { ECS, Entity } from "./ECS";
import { IUpdatable } from "./IUpdatable";

export class SButtonClicker implements IUpdatable {
  constructor(readonly ecs: ECS) {}

  held = new Set<Entity>();

  update() {
    for (const [entity, button] of this.ecs.buttons) {
      const grabTarget = this.ecs.pointerGrabTargets.get(entity)!;
      if (grabTarget.grabbed && !this.held.has(entity)) {
        this.held.add(entity);
        if (button.toggle) {
          button.down = !button.down;
        } else {
          button.down = true;
        }
        this.ecs.invokeCallback(button.onClick);
      } else if (!grabTarget.grabbed && this.held.has(entity)) {
        this.held.delete(entity);
        if (!button.toggle) {
          button.down = false;
        }
      }
    }
  }
}
