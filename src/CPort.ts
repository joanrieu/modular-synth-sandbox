type Base = {
  name: string;
  node: AudioNode;
  input: number;
  param: AudioParam;
  output: number;
};

type Take<K extends keyof Base> = Pick<Base, K> &
  Partial<Record<Exclude<keyof Base, K>, undefined>>;

type NodeInput = Take<"name" | "node" | "input">;
type Param = Take<"name" | "param">;
type NodeOutput = Take<"name" | "node" | "output">;

export type CPort = NodeInput | Param | NodeOutput;
