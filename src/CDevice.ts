import { Entity } from "./ECS";

export interface CDevice {
  name: string;
  ports: Entity[];
}
