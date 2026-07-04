import { z } from "zod";

/**
 * Validation for the Clients module (docs/08_CODING_STANDARDS.md §6, §10).
 * Parses untrusted FormData; empty strings become `undefined`.
 */

const CLIENT_TYPES = ["business", "individual"] as const;

const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max).optional()
  );

const optionalEmail = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().email("Enter a valid email address.").max(160).optional()
);

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name is required.")
    .max(160, "Company name is too long."),
  type: z.enum(CLIENT_TYPES).default("business"),
  contactPerson: optionalText(120),
  phone: optionalText(40),
  email: optionalEmail,
  taxId: optionalText(60),
  address: optionalText(500),
  notes: optionalText(2000),
});

export type ClientFormInput = z.infer<typeof clientSchema>;
export { CLIENT_TYPES };
