import { Entity } from "./ECS";

export interface CTransform {
  parent?: Entity;
  x: number;
  y: number;
  w: number;
  h: number;
}
