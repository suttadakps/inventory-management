import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const optionalDate = z.preprocess(
  emptyToUndefined,
  z.coerce.date({ invalid_type_error: "Invalid date." }).optional()
);

export const quotationSchema = z
  .object({
    title: optionalText(160),
    issueDate: optionalDate,
    expiryDate: optionalDate,
    paymentTerms: optionalText(1000),
    warranty: optionalText(1000),
    scope: optionalText(4000),
    excludedItems: optionalText(4000),
    notes: optionalText(4000),
    discountType: z.enum(["percent", "amount"]).default("amount"),
    discountValue: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? 0 : v),
      z.coerce.number().min(0, "Discount cannot be negative.")
    ),
    taxPct: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? 0 : v),
      z.coerce
        .number()
        .min(0, "VAT cannot be negative.")
        .max(100, "VAT cannot exceed 100%.")
    ),
  })
  .refine(
    (d) => !d.issueDate || !d.expiryDate || d.expiryDate >= d.issueDate,
    { path: ["expiryDate"], message: "Expiry must be on or after the issue date." }
  );

export type QuotationFormInput = z.infer<typeof quotationSchema>;
