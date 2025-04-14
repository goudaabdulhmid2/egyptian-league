import { z } from "zod";

// Common validation rules
const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name cannot exceed 100 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces");

const ageSchema = z
  .number()
  .int("Age must be a whole number")
  .min(16, "Player must be at least 16 years old")
  .max(45, "Player must be under 45 years old");

const salarySchema = z.number().positive("Salary must be positive");

const positionSchema = z.enum(
  ["Goalkeeper", "Defender", "Midfielder", "Forward"],
  {
    errorMap: () => ({
      message:
        "Invalid position. Must be Goalkeeper, Defender, Midfielder, or Forward",
    }),
  }
);

const teamIdSchema = z.object({
  teamId: z.string().uuid("Invalid team ID format"),
});

// Base schema for player
export const playerBaseSchema = z.object({
  name: nameSchema,
  age: ageSchema,
  salary: salarySchema,
  position: positionSchema,
});

// Create schema
export const createPlayerSchema = playerBaseSchema.merge(teamIdSchema);

// Update schema
export const updatePlayerSchema = playerBaseSchema
  .merge(teamIdSchema)
  .partial();

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
