import { AudioParamId } from "./SAudio";

export interface CKnob<T extends AudioNode> {
  name: string;
  param: AudioParamId;
  min: number;
  max: number;
}
