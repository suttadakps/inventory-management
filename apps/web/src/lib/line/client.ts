/** Push a text message to the shared LINE group configured for this app. */
export async function sendLineMessage(text: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const groupId = process.env.LINE_GROUP_ID;
  if (!token || !groupId) throw new Error("LINE not configured");

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to: groupId, messages: [{ type: "text", text }] }),
  });
  if (!res.ok) {
    throw new Error(`LINE push failed: ${res.status} ${await res.text()}`);
  }
}
