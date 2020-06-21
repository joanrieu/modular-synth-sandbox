import { Entity } from "./ECS";

export interface CTransform {
  parent?: Entity;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function intersection(point: CTransform, rect: CTransform) {
  return (
    point.x >= rect.x &&
    point.y >= rect.y &&
    point.x < rect.x + rect.w &&
    point.y < rect.y + rect.h
  );
}
