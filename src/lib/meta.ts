export async function sendMetaMessage(
  recipientId: string, 
  messageText: string, 
  platform: 'messenger' | 'whatsapp' | 'instagram' = 'messenger', 
  phoneNumberId?: string
) {
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("META_ACCESS_TOKEN is not configured.");
  }

  let endpoint = "";
  let requestBody = {};

  if (platform === 'whatsapp') {
    const resolvedPhoneId = phoneNumberId || process.env.META_WHATSAPP_PHONE_ID;
    if (!resolvedPhoneId) {
      throw new Error("phoneNumberId or META_WHATSAPP_PHONE_ID in .env is required for WhatsApp.");
    }
    endpoint = `https://graph.facebook.com/v18.0/${resolvedPhoneId}/messages`;
    requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientId,
      type: "text",
      text: { body: messageText }
    };
  } else {
    // Messenger or IG
    endpoint = `https://graph.facebook.com/v18.0/me/messages`;
    requestBody = {
      recipient: { id: recipientId },
      message: { text: messageText },
      messaging_type: "RESPONSE"
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Meta API Error (${platform}):`, errorText);
    throw new Error("Failed to send message via Meta API.");
  }

  return await response.json();
}
