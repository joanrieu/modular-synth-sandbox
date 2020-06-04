import { ECS } from "./ECS";
import { ISerializable } from "./ISerializable";

export class SAutosave {
  constructor(readonly ecs: ECS) {
    setTimeout(this.restoreAll.bind(this));
    setInterval(this.saveAll.bind(this), 1000);
  }

  restoreAll() {
    const str = localStorage.getItem("save");
    if (!str) return;

    const save = JSON.parse(str);

    Object.entries(save).map(([name, system]) =>
      (this.ecs[name as keyof ECS] as ISerializable<any>).restore(system)
    );
  }

  saveAll() {
    const save = Object.entries(this.ecs).reduce(
      (acc, [name, system]) =>
        "save" in system && "restore" in system
          ? { ...acc, [name]: (system as ISerializable<any>).save() }
          : acc,
      {}
    );

    const str = JSON.stringify(save);

    localStorage.setItem("save", str);
  }
}
