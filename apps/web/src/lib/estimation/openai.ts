import {
  EXTRACTION_SYSTEM_PROMPT,
  parseExtractedLines,
  type ExtractedLine,
} from "./shared";

const OPENAI_MODEL = "gpt-4o";

/** Extract BOQ line items from an uploaded drawing/PDF via the OpenAI API
 * (Responses API — supports both image and PDF input in one endpoint). */
export async function extractBoqFromDocument({
  base64,
  mimeType,
  fileName,
}: {
  base64: string;
  mimeType: string;
  fileName: string;
}): Promise<ExtractedLine[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const isPdf = mimeType === "application/pdf";
  const dataUrl = `data:${mimeType};base64,${base64}`;
  const fileBlock = isPdf
    ? { type: "input_file", filename: fileName, file_data: dataUrl }
    : { type: "input_image", image_url: dataUrl };

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${EXTRACTION_SYSTEM_PROMPT}\n\nExtract the BOQ line items as instructed.`,
            },
            fileBlock,
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    output_text?: string;
    output?: { content?: { type: string; text?: string }[] }[];
  };

  const text =
    data.output_text ??
    data.output
      ?.flatMap((item) => item.content ?? [])
      .find((c) => c.type === "output_text")?.text;

  if (!text) throw new Error("OpenAI returned no text content");

  return parseExtractedLines(text);
}
