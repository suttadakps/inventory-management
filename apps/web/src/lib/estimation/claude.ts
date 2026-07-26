import {
  EXTRACTION_SYSTEM_PROMPT,
  parseExtractedLines,
  type ExtractedLine,
} from "./shared";

const ANTHROPIC_MODEL = "claude-sonnet-5";

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
      system: EXTRACTION_SYSTEM_PROMPT,
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

  return parseExtractedLines(textBlock.text);
}
