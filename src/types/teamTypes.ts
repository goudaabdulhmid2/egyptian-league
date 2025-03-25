import { Player } from "./playerTypes";

export interface Team {
  id: string;
  name: string;
  shirtColor: string;
  players?: Player[];
}

export interface TeamUpdateInput {
  name?: string;
  shirtColor?: string;
}

export interface TeamCreateInput {
  name: string;
  shirtColor: string;
}
