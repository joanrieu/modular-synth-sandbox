export interface ISerializable<T> {
  save(): T;
  restore(save: T): void;
}
