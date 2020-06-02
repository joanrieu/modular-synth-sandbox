import { AudioParamId } from "./SAudio";

export interface CKnob<T extends AudioNode> {
  name: string;
  param: AudioParamId<T>;
  min: number;
  max: number;
}
