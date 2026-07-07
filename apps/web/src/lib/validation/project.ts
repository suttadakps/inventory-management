import { z } from "zod";

/**
 * Validation for the Projects module (docs/08_CODING_STANDARDS.md §6, §10).
 * Parses untrusted FormData: numbers/dates arrive as strings, and empty
 * strings are normalised to `undefined`.
 */

const PROJECT_STATUSES = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "warranty",
  "closed",
] as const;

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalUuid = z.preprocess(
  emptyToUndefined,
  z.string().uuid("Invalid selection.").optional()
);

const optionalString = z.preprocess(
  emptyToUndefined,
  z.string().trim().max(2000).optional()
);

const optionalDate = z.preprocess(
  emptyToUndefined,
  z.coerce.date({ invalid_type_error: "Invalid date." }).optional()
);

const optionalMoney = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ invalid_type_error: "Enter a valid amount." })
    .nonnegative("Amount cannot be negative.")
    .max(999_999_999_999, "Amount is too large.")
    .optional()
);

const progress = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? 0 : v),
  z.coerce
    .number({ invalid_type_error: "Enter a valid number." })
    .min(0, "Progress cannot be below 0.")
    .max(100, "Progress cannot exceed 100.")
);

const commissionRate = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? 0 : v),
  z.coerce
    .number({ invalid_type_error: "Enter a valid percentage." })
    .min(0, "Commission cannot be below 0%.")
    .max(100, "Commission cannot exceed 100%.")
);

export const projectBaseSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, "Project code is required.")
      .max(40, "Project code is too long.")
      .regex(
        /^[A-Za-z0-9][A-Za-z0-9-_/]*$/,
        "Use letters, numbers, and - _ / only."
      ),
    name: z
      .string()
      .trim()
      .min(2, "Project name is required.")
      .max(160, "Project name is too long."),
    clientId: z.string().uuid("Select a client."),
    address: optionalString,
    status: z.enum(PROJECT_STATUSES),
    budget: optionalMoney,
    contractValue: optionalMoney,
    commissionRate,
    startDate: optionalDate,
    endDate: optionalDate,
    progress,
    managerId: optionalUuid,
    siteEngineerId: optionalUuid,
  })
  .refine(
    (d) => !d.startDate || !d.endDate || d.endDate >= d.startDate,
    { path: ["endDate"], message: "End date must be on or after the start date." }
  );

// On update the code is immutable, so it is not part of the editable payload.
export const projectUpdateSchema = projectBaseSchema;

export type ProjectFormInput = z.infer<typeof projectBaseSchema>;
export { PROJECT_STATUSES };
