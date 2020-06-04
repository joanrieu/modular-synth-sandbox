import { AbstractUpdater } from "./AbstractUpdater";
import { ECS, Entity } from "./ECS";

export class SButtonClicker extends AbstractUpdater {
  constructor(readonly ecs: ECS) {
    super();
  }

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
        const [system, method, args] = button.onClick;
        ((this.ecs[system] as unknown) as Record<
          string,
          (...args: any) => void
        >)[method as keyof typeof system](...args);
      } else if (!grabTarget.grabbed && this.held.has(entity)) {
        this.held.delete(entity);
        if (!button.toggle) {
          button.down = false;
        }
      }
      // const clicked = grabTarget.grabbed && !button.down;
      // button.down = Boolean(grabTarget.grabbed);
      // if (clicked) {
      //   const [system, method, args] = button.onclick;
      //   ((this.ecs[system] as unknown) as record<
      //     string,
      //     (...args: any) => void
      //   >)[method as keyof typeof system](...args);
      // }
    }
  }
}
