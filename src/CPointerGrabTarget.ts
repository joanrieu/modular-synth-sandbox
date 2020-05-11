import { Entity } from "./ECS";

export interface CPointerGrabTarget {
  grabbed?: {
    pointer: Entity;
    dx: number;
    dy: number;
  };
}
