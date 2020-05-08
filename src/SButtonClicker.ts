import { AbstractUpdater } from "./AbstractUpdater";
import { ECS } from "./ECS";

export class SButtonClicker extends AbstractUpdater {
  constructor(readonly ecs: ECS) {
    super();
  }

  update() {
    for (const [entity, button] of this.ecs.buttons) {
      const grabTarget = this.ecs.pointerGrabTargets.get(entity)!;
      const clicked = grabTarget.grabbed && !button.down;
      button.down = Boolean(grabTarget.grabbed);
      if (clicked) {
        button.onClick();
      }
    }
  }
}
