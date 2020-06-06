import { ECS, SystemCallback } from "./ECS";
import { ISerializable } from "./ISerializable";

export type AudioNodeId<T extends AudioNode = AudioNode> = number & {
  __tag: "AudioNodeId";
  __type: T;
};

export type AudioParamId<T extends AudioNode = AudioNode> = [
  AudioNodeId<T>,
  string
];

export type AudioPortId<T extends AudioNode = AudioNode> = [
  AudioNodeId<T>,
  number
];

type SerializedAudioNodeType = string & { __tag: "SerializedAudioNodeType" };

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

  private nodes = new Map<AudioNodeId, [AudioNode, any]>([
    [this.getMasterNode(), [this.ctx.destination, {}]],
  ]);
  private connections = new Set<string>();

  get sampleRate() {
    return this.ctx.sampleRate;
  }

  getMasterNode() {
    return 0 as AudioNodeId<AudioDestinationNode>;
  }

  createAnalyserNode(options?: AnalyserOptions) {
    const id = this.nodes.size as AudioNodeId<AnalyserNode>;
    const node = new AnalyserNode(this.ctx, options);
    this.nodes.set(id, [node, options || {}]);
    return id;
  }

  getAnalyserFrequencyBinCount(nodeId: AudioNodeId<AnalyserNode>) {
    return this.getNode(nodeId).frequencyBinCount;
  }

  getAnalyserFloatTimeDomainData(
    nodeId: AudioNodeId<AnalyserNode>,
    array: Float32Array
  ) {
    return this.getNode(nodeId).getFloatTimeDomainData(array);
  }

  createBiquadFilterNode(options?: BiquadFilterOptions) {
    const id = this.nodes.size as AudioNodeId<BiquadFilterNode>;
    const node = new BiquadFilterNode(this.ctx, options);
    this.nodes.set(id, [node, options || {}]);
    return id;
  }

  createConstantSourceNode(options?: ConstantSourceOptions) {
    const id = this.nodes.size as AudioNodeId<ConstantSourceNode>;
    const node = new ConstantSourceNode(this.ctx, options);
    node.start();
    this.nodes.set(id, [node, options || {}]);
    return id;
  }

  createDelayNode(options?: DelayOptions) {
    const id = this.nodes.size as AudioNodeId<DelayNode>;
    const node = new DelayNode(this.ctx, options);
    this.nodes.set(id, [node, options || {}]);
    return id;
  }

  createGainNode(options?: GainOptions) {
    const id = this.nodes.size as AudioNodeId<GainNode>;
    const node = new GainNode(this.ctx, options);
    this.nodes.set(id, [node, options || {}]);
    return id;
  }

  createOscillatorNode(options?: OscillatorOptions) {
    const id = this.nodes.size as AudioNodeId<OscillatorNode>;
    const node = new OscillatorNode(this.ctx, options);
    node.start();
    this.nodes.set(id, [node, options || {}]);
    return id;
  }

  getOscillatorType(nodeId: AudioNodeId<OscillatorNode>) {
    return this.getNode(nodeId).type;
  }

  setOscillatorType(nodeId: AudioNodeId<OscillatorNode>, type: OscillatorType) {
    this.getNode(nodeId).type = type;
    this.nodes.get(nodeId)![1].type = type;
  }

  createStereoPannerNode(options?: StereoPannerOptions) {
    const id = this.nodes.size as AudioNodeId<StereoPannerNode>;
    const node = new StereoPannerNode(this.ctx, options);
    this.nodes.set(id, [node, options || {}]);
    return id;
  }

  createConvolverNode(createBuffer: SystemCallback<AudioBuffer>) {
    const id = this.nodes.size as AudioNodeId<StereoPannerNode>;
    const node = new ConvolverNode(this.ctx);
    const buffer = this.ecs.invokeCallback(createBuffer);
    Promise.resolve(buffer).then((buffer) => (node.buffer = buffer));
    this.nodes.set(id, [node, createBuffer]);
    return id;
  }

  connect<T1 extends AudioNode, T2 extends AudioNode>(
    [srcId, srcPort]: AudioPortId<T1>,
    [dstId, dstPortOrParam]: AudioPortId<T2> | AudioParamId<T2>,
    connect = true
  ) {
    const srcNode = this.nodes.get(srcId)![0] as T1;
    const dstNode = this.nodes.get(dstId)![0] as T2;

    if (typeof dstPortOrParam === "number") {
      if (connect) {
        srcNode.connect(dstNode, srcPort, dstPortOrParam);
      } else {
        srcNode.disconnect(dstNode, srcPort, dstPortOrParam);
      }
    } else {
      const dstParam = this.getParam([dstId, dstPortOrParam]);
      if (connect) {
        srcNode.connect(dstParam, srcPort);
      } else {
        srcNode.disconnect(dstParam, srcPort);
      }
    }

    const connection = [srcId, srcPort, dstId, dstPortOrParam].join();
    if (connect) {
      this.connections.add(connection);
    } else {
      this.connections.delete(connection);
    }
  }

  private getNode<T extends AudioNode>(nodeId: AudioNodeId<T>) {
    return this.nodes.get(nodeId)![0] as T;
  }

  private getParam<T extends AudioNode>([nodeId, paramName]: AudioParamId<T>) {
    const node = this.getNode(nodeId);
    const key = paramName as keyof T;
    const param = node[key];
    if (!(param instanceof AudioParam))
      throw new Error("invalid param name: " + paramName);
    return param;
  }

  getParamValue<T extends AudioNode>(paramId: AudioParamId<T>) {
    return this.getParam(paramId).value;
  }

  setParamValue<T extends AudioNode>(paramId: AudioParamId<T>, value: number) {
    this.getParam(paramId).value = value;
    this.nodes.get(paramId[0])![1][paramId[1]] = value;
  }

  save(): SerializedAudio {
    return [
      [...this.nodes].map(([id, [node, options]]) => {
        const ctor = node.constructor.name as SerializedAudioNodeType;
        return [id, [ctor, options]];
      }),
      [...this.connections],
    ];
  }

  restore([nodes, connections]: SerializedAudio) {
    for (const [id, [ctor, options]] of nodes) {
      if (id > 0) {
        const create = ("create" + ctor) as keyof this;
        ((this[create] as unknown) as (options: any) => AudioNode)(options);
      }
    }

    for (const connection of connections) {
      const [srcId, srcPort, dstId, dstPortOrParam] = connection.split(",");
      const src: AudioPortId = [Number(srcId) as AudioNodeId, Number(srcPort)];
      const dst = [
        Number(dstId) as AudioNodeId,
        isNaN(Number(dstPortOrParam)) ? dstPortOrParam : Number(dstPortOrParam),
      ] as AudioPortId<any> | AudioParamId<any>;
      this.connect(src, dst);
    }
  }
}
