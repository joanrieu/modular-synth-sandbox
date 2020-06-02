import { AudioParamId, AudioPortId } from "./SAudio";

export type CPort<T extends AudioNode> =
  | {
      name: string;
      input: AudioPortId<T> | AudioParamId<T>;
      output?: undefined;
    }
  | {
      name: string;
      input?: undefined;
      output: AudioPortId<T>;
    };
