import { CButton } from "./CButton";
import { CDevice } from "./CDevice";
import { CKnob } from "./CKnob";
import { CKnobDragZone } from "./CKnobDragZone";
import { CPointer } from "./CPointer";
import { CPointerGrabTarget } from "./CPointerGrabTarget";
import { CPort } from "./CPort";
import { CScope } from "./CScope";
import { CTransform } from "./CTransform";
import { CWire } from "./CWire";
import { SAudio } from "./SAudio";
import { SButtonClicker } from "./SButtonClicker";
import { SButtonRenderer } from "./SButtonRenderer";
import { SDeviceRenderer } from "./SDeviceRenderer";
import { SDisplay } from "./SDisplay";
import { SDragAndDrop } from "./SDragAndDrop";
import { SKnobManager } from "./SKnobManager";
import { SKnobRenderer } from "./SKnobRenderer";
import { SMidiIO } from "./SMidiIO";
import { SMouseInput } from "./SMouseInput";
import { SPointerGrabber } from "./SPointerGrabber";
import { SPortRenderer } from "./SPortRenderer";
import { SPrefabs } from "./SPrefabs";
import { SScopeRenderer } from "./SScopeRenderer";
import { SWireManager } from "./SWireManager";
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
  knobs = new EntityComponentMap<CKnob>();
  wires = new EntityComponentMap<CWire>();
  pointers = new EntityComponentMap<CPointer>();
  pointerGrabTargets = new EntityComponentMap<CPointerGrabTarget>();
  dragAndDropTargets = new EntitySet();
  knobDragZones = new EntityComponentMap<CKnobDragZone>();
  buttons = new EntityComponentMap<CButton>();
  scopes = new EntityComponentMap<CScope>();

  prefabs = new SPrefabs(this);
  audio = new SAudio(this);
  display = new SDisplay(this);
  mouseInput = new SMouseInput(this);
  pointerGrabber = new SPointerGrabber(this);
  buttonClicker = new SButtonClicker(this);
  dragAndDrop = new SDragAndDrop(this);
  wireManager = new SWireManager(this);
  knobManager = new SKnobManager(this);
  midiIO = new SMidiIO(this);
  // debugRenderer = new SDebugRenderer(this);
  scopeRenderer = new SScopeRenderer(this);
  deviceRenderer = new SDeviceRenderer(this);
  portRenderer = new SPortRenderer(this);
  knobRenderer = new SKnobRenderer(this);
  buttonRenderer = new SButtonRenderer(this);
  wireRenderer = new SWireRenderer(this);
}
