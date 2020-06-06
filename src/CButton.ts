import { SystemCallback } from "./ECS";

export interface CButton {
  label: string;
  toggle: boolean;
  down: boolean;
  onClick: SystemCallback;
}
