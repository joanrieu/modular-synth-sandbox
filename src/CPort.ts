export interface CPort {
  name: string;
  node: AudioNode;
  input?: number;
  param?: AudioParam;
  output?: number;
}
