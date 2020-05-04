import { ECS } from "./ECS";

export class SAudio {
  ctx = new AudioContext();

  constructor(readonly ecs: ECS) {}
}
