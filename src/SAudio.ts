import { ECS, Entity, SystemCallback } from "./ECS";
import { ISerializable } from "./ISerializable";

export type AudioDeviceId = Entity;

export type AudioNodeId<T extends AudioNode = AudioNode> = [
  AudioDeviceId,
  number
] & { __type: T };

export type AudioPortId = [AudioNodeId, number];

export type AudioParamId = [AudioNodeId, string];

function isPort(id: AudioPortId | AudioParamId): id is AudioPortId {
  const [, portOrParam] = id;
  return typeof portOrParam === "number";
}

type SerializedAudioNodeType = string & { __type: "SerializedAudioNodeType" };

type SerializedAudioNodeMap = Array<
  [AudioNodeId, [SerializedAudioNodeType, any]]
>;

type SerializedAudioConnections = string[];

type SerializedAudio = [SerializedAudioNodeMap, SerializedAudioConnections];

export class SAudio implements ISerializable<SerializedAudio> {
  constructor(private readonly ecs: ECS) {
    const interval = setInterval(() => {
      if (this.ctx.state === "running") {
        clearInterval(interval);
      } else {
        this.ctx.resume();
      }
    }, 400);
  }

  ctx = new AudioContext();

  private nodes = new Map<string, [AudioNode, Record<string, any>]>();
  private connections = new Set<string>();

  get sampleRate() {
    return this.ctx.sampleRate;
  }

  createAudioDestinationNode(device: AudioDeviceId) {
    const node = this.ctx.destination;
    return this.createAudioNode(device, node, {});
  }

  createAnalyserNode(device: AudioDeviceId, options?: AnalyserOptions) {
    const node = new AnalyserNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  getAnalyserFrequencyBinCount(nodeId: AudioNodeId<AnalyserNode>) {
    return this.getNode(nodeId).node.frequencyBinCount;
  }

  getAnalyserFloatTimeDomainData(
    nodeId: AudioNodeId<AnalyserNode>,
    array: Float32Array
  ) {
    return this.getNode(nodeId).node.getFloatTimeDomainData(array);
  }

  createBiquadFilterNode(device: AudioDeviceId, options?: BiquadFilterOptions) {
    const node = new BiquadFilterNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  createConstantSourceNode(
    device: AudioDeviceId,
    options?: ConstantSourceOptions
  ) {
    const node = new ConstantSourceNode(this.ctx, options);
    node.start();
    return this.createAudioNode(device, node, options);
  }

  createDelayNode(device: AudioDeviceId, options?: DelayOptions) {
    const node = new DelayNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  createGainNode(device: AudioDeviceId, options?: GainOptions) {
    const node = new GainNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  createOscillatorNode(device: AudioDeviceId, options?: OscillatorOptions) {
    const node = new OscillatorNode(this.ctx, options);
    node.start();
    return this.createAudioNode(device, node, options);
  }

  getOscillatorType(nodeId: AudioNodeId<OscillatorNode>) {
    return this.getNode(nodeId).node.type;
  }

  setOscillatorType(nodeId: AudioNodeId<OscillatorNode>, type: OscillatorType) {
    const { node, options } = this.getNode(nodeId);
    node.type = type;
    options.type = type;
  }

  createStereoPannerNode(device: AudioDeviceId, options?: StereoPannerOptions) {
    const node = new StereoPannerNode(this.ctx, options);
    return this.createAudioNode(device, node, options);
  }

  createConvolverNode(
    device: AudioDeviceId,
    createBuffer: SystemCallback<AudioBuffer>
  ) {
    const node = new ConvolverNode(this.ctx);
    const buffer = this.ecs.invokeCallback(createBuffer);
    Promise.resolve(buffer).then((buffer) => (node.buffer = buffer));
    return this.createAudioNode(device, node, createBuffer);
  }

  connect(
    srcPortId: AudioPortId,
    dstPortOrParamId: AudioPortId | AudioParamId,
    connect = true
  ) {
    const [srcId, srcPort] = srcPortId;
    const [dstId] = dstPortOrParamId;

    const srcNode = this.getNode(srcId).node;
    const dstNode = this.getNode(dstId).node;

    if (isPort(dstPortOrParamId)) {
      const [, dstPort] = dstPortOrParamId;
      if (connect) {
        srcNode.connect(dstNode, srcPort, dstPort);
      } else {
        srcNode.disconnect(dstNode, srcPort, dstPort);
      }
    } else {
      const dstParam = this.getParam(dstPortOrParamId);
      if (connect) {
        srcNode.connect(dstParam, srcPort);
      } else {
        srcNode.disconnect(dstParam, srcPort);
      }
    }

    const connection = JSON.stringify([srcPortId, dstPortOrParamId]);
    if (connect) {
      this.connections.add(connection);
    } else {
      this.connections.delete(connection);
    }
  }

  private createAudioNode<T extends AudioNode>(
    device: Entity,
    node: T,
    options: Record<string, any> = {}
  ) {
    const id = [device, this.nodes.size] as AudioNodeId<T>;
    this.nodes.set(JSON.stringify(id), [node, options]);
    return id;
  }

  private getNode<T extends AudioNode>(nodeId: AudioNodeId<T>) {
    const [node, options] = this.nodes.get(JSON.stringify(nodeId))!;
    return { node: node as T, options };
  }

  private getParam([nodeId, paramName]: AudioParamId) {
    const { node } = this.getNode(nodeId);
    const key = paramName as keyof AudioNode;
    const param = node[key];
    if (!(param instanceof AudioParam))
      throw new Error("invalid param name: " + paramName);
    return param;
  }

  getParamValue(paramId: AudioParamId) {
    return this.getParam(paramId).value;
  }

  setParamValue(paramId: AudioParamId, value: number) {
    const [nodeId, paramName] = paramId;
    this.getParam(paramId).value = value;
    this.getNode(nodeId).options[paramName] = value;
  }

  save(): SerializedAudio {
    return [
      [...this.nodes].map(([id, [node, options]]) => {
        const ctor = node.constructor.name as SerializedAudioNodeType;
        return [JSON.parse(id), [ctor, options]];
      }),
      [...this.connections],
    ];
  }

  restore([nodes, connections]: SerializedAudio) {
    for (const [[device, node], [ctor, options]] of nodes) {
      const create = ("create" + ctor) as keyof this;
      ((this[create] as unknown) as Function)(device, options);
    }

    for (const connection of connections) {
      const [srcPortId, dstPortId]: AudioPortId[] = JSON.parse(connection);
      this.connect(srcPortId, dstPortId);
    }
  }
}
