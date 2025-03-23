import { Player } from "./playerTypes";

export interface Team {
  id: string;
  name: string;
  shirtColor: string;
  players?: Player[];
}

export interface TeamUpdateInput {
  shirtColor?: string;
}
