import { Entity } from "./ECS";

export interface CPointer {
  target?: Entity;
  pressed: boolean;
}
