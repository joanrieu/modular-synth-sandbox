import { ECS } from "./ECS";
import { IRenderable } from "./IRenderable";

export default class STrashcanRenderer implements IRenderable {
  constructor(readonly ecs: ECS) {}

  render() {
    const { ctx } = this.ecs.display;
    for (const [entity, trashcan] of this.ecs.trashcans) {
      if (!trashcan.visible) continue;
      const { x, y, w, h } = this.ecs.transforms.get(entity)!;
      ctx.strokeStyle = trashcan.active
        ? "hsla(0deg, 100%, 50%, .5)"
        : "hsla(0deg, 0%, 50%, .5)";
      ctx.lineWidth = trashcan.active ? 5 : 2;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y - h / 2);
      ctx.lineTo(x + w / 2, y + h / 2);
      ctx.moveTo(x + w / 2, y - h / 2);
      ctx.lineTo(x - w / 2, y + h / 2);
      ctx.closePath();
      ctx.stroke();
    }
  }
}
