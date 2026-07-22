async function linePost(path: string, body: unknown): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE not configured");

  const res = await fetch(`https://api.line.me/v2/bot/message/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`LINE ${path} failed: ${res.status} ${await res.text()}`);
  }
}

/** Push a plain text message to the shared LINE group configured for this app. */
export async function sendLineMessage(text: string): Promise<void> {
  const groupId = process.env.LINE_GROUP_ID;
  if (!groupId) throw new Error("LINE not configured");
  await linePost("push", { to: groupId, messages: [{ type: "text", text }] });
}

/**
 * Push a project trigger reminder as a Flex bubble with a "Done" button
 * (a plain Buttons Template caps its body text at 160 chars, which project
 * messages can exceed — Flex has no such limit).
 */
export async function sendLineTriggerMessage(
  projectName: string,
  message: string,
  triggerId: string
): Promise<void> {
  const groupId = process.env.LINE_GROUP_ID;
  if (!groupId) throw new Error("LINE not configured");

  const altText = `${projectName}: ${message}`.slice(0, 400);
  await linePost("push", {
    to: groupId,
    messages: [
      {
        type: "flex",
        altText,
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: projectName,
                weight: "bold",
                size: "sm",
                color: "#1b4f91",
              },
              { type: "text", text: message, wrap: true, margin: "md" },
            ],
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                style: "primary",
                color: "#1b4f91",
                action: {
                  type: "postback",
                  label: "Done",
                  data: `action=done&id=${triggerId}`,
                },
              },
            ],
          },
        },
      },
    ],
  });
}

/** Reply to a LINE event using its one-time replyToken. */
export async function replyLineMessage(
  replyToken: string,
  text: string
): Promise<void> {
  await linePost("reply", { replyToken, messages: [{ type: "text", text }] });
}
