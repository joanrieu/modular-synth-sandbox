import { Entity } from "./ECS";

export interface CWire {
  source: Entity;
  destination: Entity;
  hue: number;
}
