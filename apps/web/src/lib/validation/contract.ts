import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const optionalDate = z.preprocess(
  emptyToUndefined,
  z.coerce.date({ invalid_type_error: "Invalid date." }).optional()
);

export const contractHeaderSchema = z
  .object({
    title: optionalText(160),
    scope: optionalText(4000),
    paymentTerms: optionalText(2000),
    warranty: optionalText(2000),
    notes: optionalText(4000),
    startDate: optionalDate,
    endDate: optionalDate,
  })
  .refine(
    (d) => !d.startDate || !d.endDate || d.endDate >= d.startDate,
    { path: ["endDate"], message: "End date must be on or after the start date." }
  );

export const milestoneSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(160),
  percentage: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? 0 : v),
    z.coerce.number().min(0).max(100)
  ),
  amount: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? 0 : v),
    z.coerce.number().min(0, "Amount cannot be negative.")
  ),
  dueDate: optionalDate,
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty.").max(4000),
});

export const fileSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required.").max(200),
  fileUrl: z.string().trim().url("Enter a valid URL.").max(2000),
});

export type ContractHeaderInput = z.infer<typeof contractHeaderSchema>;
export type MilestoneFormInput = z.infer<typeof milestoneSchema>;
