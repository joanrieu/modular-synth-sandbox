import { Entity } from "./ECS";

export interface CButton {
  label: string;
  down: boolean;
  onClick: () => void;
}
