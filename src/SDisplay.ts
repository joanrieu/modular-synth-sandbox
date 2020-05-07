import { AbstractRenderer } from "./AbstractRenderer";
import { AbstractUpdater } from "./AbstractUpdater";
import { ECS, Entity } from "./ECS";

export class SDisplay {
  canvas = document.createElement("canvas");
  ctx = this.canvas.getContext("2d")!;

  constructor(readonly ecs: ECS) {
    document.body.appendChild(this.canvas);
    window.addEventListener("resize", this.resize);
    this.resize();
    requestAnimationFrame(this.loop);
  }

  resize = () => {
    this.canvas.width = document.body.clientWidth;
    this.canvas.height = document.body.clientHeight;
  };

  loop = () => {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  };

  update() {
    for (const system of Object.values(this.ecs)) {
      if (system instanceof AbstractUpdater) {
        system.update();
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const system of Object.values(this.ecs)) {
      if (system instanceof AbstractRenderer) {
        system.draw();
      }
    }
  }

  getWorldTransform(entity: Entity) {
    const transform = { ...this.ecs.transforms.get(entity)! };
    if (transform.parent) {
      const parent = this.getWorldTransform(transform.parent);
      transform.x += parent.x;
      transform.y += parent.y;
    }
    return transform;
  }
}
