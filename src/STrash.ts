import { intersection, CTransform } from "./CTransform";
import { ECS, Entity, EntityComponentMap, EntitySet } from "./ECS";
import { IUpdatable } from "./IUpdatable";

export default class STrash implements IUpdatable {
  constructor(readonly ecs: ECS) {
    const entity = this.ecs.createEntity("trashcan");
    ecs.transforms.set(entity, {
      get x() {
        return (ecs.display.canvas.width - 50) / 2;
      },
      get y() {
        return ecs.display.canvas.height - 75;
      },
      w: 50,
      h: 50,
    });
    ecs.trashcans.set(entity, {
      visible: false,
      active: false,
    });
  }

  update() {
    let deviceGrabbed = false;
    for (const [entity] of this.ecs.devices) {
      if (this.ecs.pointerGrabTargets.get(entity)!.grabbed) {
        deviceGrabbed = true;
        break;
      }
    }

    for (const [entity, trashcan] of this.ecs.trashcans) {
      const transform = this.ecs.transforms.get(entity)!;
      trashcan.visible = deviceGrabbed;
      const wasActive = trashcan.active;
      trashcan.active = false;
      for (const [entity2] of this.ecs.devices) {
        const transform2 = this.ecs.transforms.get(entity2)!;
        const overlap = intersection(transform, transform2);
        const grabbed = this.ecs.pointerGrabTargets.get(entity2)!.grabbed;
        if (overlap && grabbed) {
          trashcan.active = overlap;
        } else if (wasActive && overlap) {
          this.deleteDevice(entity2);
        }
      }
    }
  }

  deleteDevice(entity: Entity) {
    let count = 0;
    const trash = new Set([entity]);
    while (trash.size !== count) {
      count = trash.size;
      for (const [entity, { parent }] of this.ecs.transforms) {
        if (parent && trash.has(parent)) {
          trash.add(entity);
        }
      }
    }

    for (const [entity, wire] of this.ecs.wires) {
      if (trash.has(wire.source) || trash.has(wire.destination)) {
        trash.add(entity);
      }
    }

    for (const entity of trash) {
      if (this.ecs.devices.has(entity)) {
        this.ecs.audio.deleteDevice(entity);
        this.ecs.midi.deleteDevice(entity);
      }

      for (const v of Object.values(this.ecs)) {
        if (v instanceof EntitySet || v instanceof EntityComponentMap) {
          v.delete(entity);
        }
      }
    }
  }
}
