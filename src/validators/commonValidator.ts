import { z } from "zod";

export const idSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
});

export const queryStringSchema = z
  .object({
    page: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Number(val)),
        "Page must be a valid number"
      )
      .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : undefined)),

    limit: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Number(val)),
        "Limit must be a valid number"
      )
      .transform((val) => {
        if (!val) return undefined;
        const num = parseInt(val, 10);
        return Math.min(Math.max(1, num), 100); // Ensures limit is between 1 and 100
      }),

    sort: z
      .string()
      .optional()
      .refine((val) => !val || /^[-\w,]+$/.test(val), "Invalid sort format"),

    fields: z
      .string()
      .optional()
      .refine((val) => !val || /^[\w,]+$/.test(val), "Invalid fields format"),

    keyword: z
      .string()
      .optional()
      .transform((val) => val?.trim()),

    // Dynamic field validation
    [String(z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/))]: z
      .union([
        z.string(),
        z.number(),
        z.record(
          z.enum(["gt", "gte", "lt", "lte"]),
          z.union([z.string(), z.number()])
        ),
      ])
      .optional(),
  })
  .strict(); // The .strict() method enforces that no additional properties are allowed in the query parameters beyond those defined in the schema

export type IdInput = z.infer<typeof idSchema>;
