import { ECS } from "./ECS";

const ecs = new ECS();
Object.assign(window, { ecs });
ecs.prefabs.createScene();
