import { AbstractRenderer } from "./AbstractRenderer";
import { ECS, EntityComponentMap } from "./ECS";

export class SDebugRenderer extends AbstractRenderer {
  constructor(readonly ecs: ECS) {
    super();
  }

  draw() {
    const {
      display: { ctx },
    } = this.ecs;

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
                ["Object", "Array", "Number"].includes(v.constructor.name)
                  ? v
                  : v.toString()
              )
          );
        write("");
      }
    }
  }
}
