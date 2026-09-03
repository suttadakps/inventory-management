const ANTHROPIC_MODEL = "claude-sonnet-5";

const EXTRACTION_SYSTEM_PROMPT = `You are reading a photo of a Thai expense receipt/slip (ใบเสร็จ/สลิป) for a
construction/interior-fit-out company's cost tracking. Extract the following
as a single JSON object with exactly these fields:
- amount: number (the total amount paid, in THB; null if not legible)
- vendor: string or null (the shop/supplier name on the receipt)
- description: string or null (a short Thai description of what was bought, e.g. "ค่าวัสดุก่อสร้าง")
- date: string or null (the receipt's date as YYYY-MM-DD if shown, else null)

Respond with ONLY the JSON object — no markdown fences, no commentary.`;

export type ExtractedReceipt = {
  amount: number | null;
  vendor: string | null;
  description: string | null;
  date: string | null;
};

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced?.[1] ?? trimmed;
}

function isValidExtractedReceipt(v: unknown): v is ExtractedReceipt {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  const ok = (x: unknown, t: "string" | "number") =>
    x === null || typeof x === t;
  return (
    ok(o.amount, "number") &&
    ok(o.vendor, "string") &&
    ok(o.description, "string") &&
    ok(o.date, "string")
  );
}

/** Extract amount/vendor/description/date from a photo of a receipt via Claude. */
export async function extractReceiptFromImage({
  base64,
  mimeType,
}: {
  base64: string;
  mimeType: string;
}): Promise<ExtractedReceipt> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType, data: base64 },
            },
            { type: "text", text: "Extract the receipt fields as instructed." },
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
    throw new Error("Could not parse the AI response as JSON");
  }
  if (!isValidExtractedReceipt(parsed)) {
    throw new Error("The AI response did not match the expected receipt shape");
  }
  return parsed;
}
