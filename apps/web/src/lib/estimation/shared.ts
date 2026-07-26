export type ExtractedLine = {
  sectionLabel: string;
  description: string;
  size: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type AiProvider = "claude" | "chatgpt";

export const EXTRACTION_SYSTEM_PROMPT = `You are a quantity surveyor assistant for a Thai construction/interior-fit-out
company. You will be given a construction drawing, BOQ, or supplier quotation
(as a PDF or image). Extract a Bill of Quantities as a JSON array of line
items. Each item must have exactly these fields:
- sectionLabel: string (a short grouping label, e.g. "งานโครงสร้าง", "งานสถาปัตยกรรม", "งานระบบไฟฟ้า")
- description: string (item description, in Thai if the source is Thai)
- size: string (dimensions/spec if shown, else "")
- quantity: number
- unit: string (e.g. "ตร.ม.", "ม.", "ชิ้น", "จุด")
- unitPrice: number (estimated unit price in THB; 0 if not determinable)

Respond with ONLY the JSON array — no markdown fences, no commentary, no
explanation before or after.`;

export function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced?.[1] ?? trimmed;
}

export function isValidExtractedLine(v: unknown): v is ExtractedLine {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.sectionLabel === "string" &&
    typeof o.description === "string" &&
    typeof o.size === "string" &&
    typeof o.quantity === "number" &&
    typeof o.unit === "string" &&
    typeof o.unitPrice === "number"
  );
}

export function parseExtractedLines(text: string): ExtractedLine[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(text));
  } catch {
    throw new Error("Could not parse the AI response as JSON");
  }
  if (!Array.isArray(parsed) || !parsed.every(isValidExtractedLine)) {
    throw new Error("The AI response did not match the expected line-item shape");
  }
  return parsed;
}
