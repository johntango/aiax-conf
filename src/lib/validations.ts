import { z } from "zod";

export const createValidators = () => {
  const interestSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    affiliation: z.string().max(160).optional().or(z.literal("")).transform(v => v || undefined),
    notes: z.string().max(1000).optional()
  });

  const attendeeSchema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    affiliation: z.string().max(160).optional().or(z.literal("")).transform(v => v || undefined)
  });

  return { interestSchema, attendeeSchema };
};
