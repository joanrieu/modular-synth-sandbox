export type CPort = {
  name: string;
  node: AudioNode;
} & (
  | {
      input: number;
      param?: undefined;
      output?: undefined;
    }
  | {
      input?: undefined;
      param: AudioParam;
      output?: undefined;
    }
  | {
      input?: undefined;
      param?: undefined;
      output: number;
    }
);
