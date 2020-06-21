import { AudioParamId, AudioPortId } from "./SAudio";

export type CPort<T extends AudioNode> =
  | {
      name: string;
      input: AudioPortId | AudioParamId;
      output?: undefined;
    }
  | {
      name: string;
      input?: undefined;
      output: AudioPortId;
    };
