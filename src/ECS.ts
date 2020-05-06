import { CDevice } from "./CDevice";
import { CPointer } from "./CPointer";
import { CPort } from "./CPort";
import { CTransform } from "./CTransform";
import { CWire } from "./CWire";
import { SAudio } from "./SAudio";
import { SDebugRenderer } from "./SDebugRenderer";
import { SDeviceRenderer } from "./SDeviceRenderer";
import { SDisplay } from "./SDisplay";
import { SMouseInput } from "./SMouseInput";
import { SPortRenderer } from "./SPortRenderer";
import { SPrefabs } from "./SPrefabs";
import { SWireRenderer } from "./SWireRenderer";

export type Entity = Symbol;

export class EntitySet extends Set<Entity> {}
export class EntityComponentMap<C> extends Map<Entity, C> {}

export class ECS {
  createEntity(name: string): Entity {
    return Symbol(name + "-" + Math.random().toString(16).slice(2, 6));
  }

  transforms = new EntityComponentMap<CTransform>();
  devices = new EntityComponentMap<CDevice>();
  ports = new EntityComponentMap<CPort>();
  wires = new EntityComponentMap<CWire>();
  pointers = new EntityComponentMap<CPointer>();
  pointerTargets = new EntitySet();

  prefabs = new SPrefabs(this);
  audio = new SAudio(this);
  display = new SDisplay(this);
  mouseInput = new SMouseInput(this);
  deviceRenderer = new SDeviceRenderer(this);
  portRenderer = new SPortRenderer(this);
  wireRenderer = new SWireRenderer(this);
  debugRenderer = new SDebugRenderer(this);
}
