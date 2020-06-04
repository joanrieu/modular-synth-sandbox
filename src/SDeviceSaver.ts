import { ECS, Entity, EntityComponentMap, EntitySet } from "./ECS";
import { ISerializable } from "./ISerializable";

type SerializedUI = Array<[string, Array<Entity> | Array<[Entity, any]>]>;

export class SDeviceSaver implements ISerializable<SerializedUI> {
  constructor(readonly ecs: ECS) {}

  save() {
    const {
      buttons,
      dragAndDropTargets,
      devices,
      knobs,
      knobDragZones,
      pointerGrabTargets,
      ports,
      scopes,
      transforms,
      wires,
    } = this.ecs;

    const entities = [...devices.keys()];
    for (const parent of entities) {
      for (const [child, transform] of transforms) {
        if (transform.parent === parent) {
          entities.push(child);
        }
      }
    }

    return Object.entries({
      buttons,
      devices,
      dragAndDropTargets,
      knobs,
      knobDragZones,
      pointerGrabTargets,
      ports,
      scopes,
      transforms,
      wires,
    }).map(([name, system]) => [
      name,
      [...system].filter(
        (entry) =>
          entities.includes(
            (typeof entry === "string" ? entry : entry[0]) as Entity
          ) || name === "wires"
      ),
    ]) as SerializedUI;
  }

  restore(save: SerializedUI) {
    for (const [k, v] of save) {
      const key = k as keyof ECS;
      if (this.ecs[key] instanceof EntitySet) {
        const set = this.ecs[key] as EntitySet;
        for (const entity of v as Array<Entity>) set.add(entity);
      } else if (this.ecs[key] instanceof EntityComponentMap) {
        const map = this.ecs[key] as EntityComponentMap<any>;
        for (const [entity, component] of v as Array<[Entity, any]>)
          map.set(entity, component);
      }
    }
  }
}
