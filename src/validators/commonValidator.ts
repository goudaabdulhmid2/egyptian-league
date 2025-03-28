import { z } from "zod";

export const idSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export type IdInput = z.infer<typeof idSchema>;
