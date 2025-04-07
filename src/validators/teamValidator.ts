import { z } from "zod";

import { playerBaseSchema } from "./playerValidator";

const validShirtColors = [
  "red",
  "blue",
  "green",
  "yellow",
  "white",
  "black",
  "orange",
  "purple",
  "pink",
  "brown",
] as const;

// Common validation rules
const nameSchema = z
  .string()
  .trim()
  .min(3, "Team name must be at least 3 characters")
  .max(100, "Team name cannot exceed 100 characters")
  .regex(/^[a-zA-Z\s]+$/, "Team name must contain only letters and spaces");

const shirtColorSchema = z.enum(validShirtColors, {
  errorMap: () => ({
    message: `Shirt color must be one of: ${validShirtColors.join(", ")}`,
  }),
});

const playersSchema = z.array(playerBaseSchema).optional();

export const teamBaseSchema = z.object({
  name: nameSchema,
  shirtColor: shirtColorSchema,
});

// Schema for creating a team
export const createTeamSchema = teamBaseSchema.extend({
  players: playersSchema,
});

// Schema for updating a team
export const updateTeamSchema = teamBaseSchema.partial().extend({
  players: playersSchema,
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
