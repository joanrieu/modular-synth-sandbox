import { Entity } from "./ECS";

export interface CGrabTarget {
  grabbed?: {
    pointer: Entity;
    dx: number;
    dy: number;
  };
}
