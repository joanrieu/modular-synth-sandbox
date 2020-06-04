import { ECS } from "./ECS";

export interface CButton {
  label: string;
  toggle: boolean;
  down: boolean;
  onClick: [keyof ECS, string, any[]];
}
