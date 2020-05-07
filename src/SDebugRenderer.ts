import { AbstractRenderer } from "./AbstractRenderer";
import { ECS, EntityComponentMap } from "./ECS";

export class SDebugRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const ctx = this.ecs.display.ctx;
    ctx.fillStyle = "lime";
    const fontSize = 10;
    const lineHeight = fontSize * 1.5;
    ctx.font = fontSize + "px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    let lineNo = 1;
    function write(text: string) {
      for (const line of text.split("\n")) {
        ctx.fillText(line, lineHeight, lineNo++ * lineHeight);
      }
    }

    for (const [key, map] of Object.entries(this.ecs)) {
      if (map instanceof EntityComponentMap) {
        write("-- " + key + " --");
        for (const [key, value] of map)
          write(
            key.toString().padEnd(40, " ") +
              JSON.stringify(value, (k, v) =>
                v && !["Object", "Array", "Number"].includes(v.constructor.name)
                  ? v.toString()
                  : v
              )
          );
        write("");
      }
    }

    for (const [entity, pointer] of this.ecs.pointers) {
      const { x, y, w, h } = this.ecs.transforms.get(entity)!;
      ctx.strokeStyle = pointer.pressed ? "red" : "lime";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x, y + 10);
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.rect(x, y, w, h);
      ctx.stroke();
    }
  }
}
