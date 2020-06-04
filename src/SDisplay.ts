import { ECS, Entity } from "./ECS";
import { IRenderable } from "./IRenderable";
import { IUpdatable } from "./IUpdatable";

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
    this.render();
    requestAnimationFrame(this.loop);
  };

  update() {
    for (const system of Object.values(this.ecs)) {
      if ("update" in system && system !== this) {
        (system as IUpdatable).update();
      }
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = ((this.canvas.height / 8) | 0) + "px monospace";
    this.ctx.fillStyle = "hsla(0, 0%, 0%)";
    this.ctx.fillText(
      "Modular",
      this.canvas.width / 2,
      (this.canvas.height * 2) / 6
    );
    this.ctx.fillText(
      "Synth",
      this.canvas.width / 2,
      (this.canvas.height * 3) / 6
    );
    this.ctx.fillText(
      "Sandbox",
      this.canvas.width / 2,
      (this.canvas.height * 4) / 6
    );

    for (const system of Object.values(this.ecs)) {
      if ("render" in system && system !== this) {
        (system as IRenderable).render();
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
