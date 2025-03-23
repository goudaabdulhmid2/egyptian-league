import { Team } from "./teamTypes";

export interface Player {
  id: string;
  name: string;
  salary: number;
  teamId: string;
  position: string;
  team?: Team;
}

export interface PlayerCreateInput {
  id: string;
  name: string;
  salary: number;
  teamId: string;
  position: string;
}

export interface PlayerUpdateInput {
  salary?: number;
  teamId?: string;
}
