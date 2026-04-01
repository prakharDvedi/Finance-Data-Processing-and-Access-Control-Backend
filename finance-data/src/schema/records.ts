import { z } from "zod";

export const recordSchema = z.enum(["INCOME", "EXPENSE"]);

export const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: recordSchema,
  category: z.string().min(1),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

export const updateRecordSchema = z.object({
    amount: z.number().positive().optional(),
    type: recordSchema.optional(),
    category: z.string().min(1).optional(),
    date: z.string().datetime().optional(),
    notes: z.string().optional(),
})