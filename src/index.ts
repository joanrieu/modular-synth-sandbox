import { ECS } from "./ECS";

const button = document.createElement("button");
button.innerText = "Start";
button.style.width = "100%";
button.style.height = "100%";
button.onclick = function () {
  document.body.removeChild(button);
  const ecs = new ECS();
  Object.assign(window, { ecs });
  ecs.prefabs.createScene();
};
document.body.appendChild(button);
