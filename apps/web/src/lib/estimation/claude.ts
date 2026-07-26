const ANTHROPIC_MODEL = "claude-sonnet-5";

export type ExtractedLine = {
  sectionLabel: string;
  description: string;
  size: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

const SYSTEM_PROMPT = `You are a quantity surveyor assistant for a Thai construction/interior-fit-out
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

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced?.[1] ?? trimmed;
}

function isValidLine(v: unknown): v is ExtractedLine {
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

/** Extract BOQ line items from an uploaded drawing/PDF via the Claude API. */
export async function extractBoqFromDocument({
  base64,
  mimeType,
}: {
  base64: string;
  mimeType: string;
}): Promise<ExtractedLine[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const isPdf = mimeType === "application/pdf";
  const contentBlock = isPdf
    ? {
        type: "document",
        source: { type: "base64", media_type: mimeType, data: base64 },
      }
    : {
        type: "image",
        source: { type: "base64", media_type: mimeType, data: base64 },
      };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            { type: "text", text: "Extract the BOQ line items as instructed." },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Claude API failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const textBlock = data.content?.find((c) => c.type === "text");
  if (!textBlock?.text) throw new Error("Claude returned no text content");

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(textBlock.text));
  } catch {
    throw new Error("Could not parse Claude's response as JSON");
  }

  if (!Array.isArray(parsed) || !parsed.every(isValidLine)) {
    throw new Error("Claude's response did not match the expected line-item shape");
  }

  return parsed;
}
