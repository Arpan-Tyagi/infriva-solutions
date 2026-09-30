/**
 * @file src/lib/meta.ts
 * @description Meta Graph API Dispatch Utility
 *
 * This module provides outbound message dispatching to Meta platforms,
 * including Facebook Messenger, Instagram Direct, and WhatsApp Business Cloud API.
 *
 * Architecture & Protocol Overview:
 * 1. Facebook Messenger & Instagram Direct:
 *    - Uses the Graph API `https://graph.facebook.com/v18.0/me/messages` endpoint.
 *    - Authenticated with a Page Access Token with `pages_messaging` or `instagram_manage_messages` permissions.
 *    - Payloads require `{ recipient: { id }, message: { text }, messaging_type: "RESPONSE" }`.
 * 2. WhatsApp Business Cloud API:
 *    - Uses `https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages`.
 *    - Requires explicit `messaging_product: "whatsapp"` and `recipient_type: "individual"`.
 *    - Target recipient must be an E.164 formatted international telephone number (e.g., `+1234567890`).
 * 3. Error Handling:
 *    - Validates presence of `META_ACCESS_TOKEN`.
 *    - Inspects HTTP status codes; on failure, prints the raw JSON response from Meta to aid debugging.
 */

/**
 * Dispatches an outbound conversational message to a user on Facebook Messenger,
 * Instagram Direct, or WhatsApp Business via the Meta Graph API v18.0.
 *
 * @param recipientId - The platform-specific recipient identifier:
 *                      - Messenger: Page-Scoped ID (PSID)
 *                      - Instagram: Instagram-Scoped ID (IGSID)
 *                      - WhatsApp: E.164 formatted phone number (e.g., "+15551234567")
 * @param messageText - The UTF-8 text string to deliver to the user
 * @param platform - Target channel ('messenger' | 'whatsapp' | 'instagram'). Defaults to 'messenger'.
 * @param phoneNumberId - (Optional) WhatsApp Phone Number ID. If omitted, falls back to `META_WHATSAPP_PHONE_ID`.
 *
 * @returns The parsed JSON confirmation response from the Meta Graph API
 * @throws Error if `META_ACCESS_TOKEN` is missing, phone ID is unresolved, or the Graph API rejects the payload
 */
export async function sendMetaMessage(
  recipientId: string, 
  messageText: string, 
  platform: 'messenger' | 'whatsapp' | 'instagram' = 'messenger', 
  phoneNumberId?: string
) {
  // Retrieve the Meta System User or Page Access Token from environment variables
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("META_ACCESS_TOKEN is not configured in environment variables.");
  }

  let endpoint = "";
  let requestBody = {};

  if (platform === 'whatsapp') {
    // Resolve WhatsApp Phone Number ID: parameter takes precedence over environment variable
    const resolvedPhoneId = phoneNumberId || process.env.META_WHATSAPP_PHONE_ID;
    if (!resolvedPhoneId) {
      throw new Error("phoneNumberId parameter or META_WHATSAPP_PHONE_ID in .env is required for WhatsApp dispatches.");
    }

    // WhatsApp Cloud API v18.0 endpoint
    endpoint = `https://graph.facebook.com/v18.0/${resolvedPhoneId}/messages`;
    requestBody = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientId,
      type: "text",
      text: { body: messageText }
    };
  } else {
    // Facebook Messenger & Instagram Direct share the '/me/messages' endpoint
    endpoint = `https://graph.facebook.com/v18.0/me/messages`;
    requestBody = {
      recipient: { id: recipientId },
      message: { text: messageText },
      // messaging_type: "RESPONSE" informs Meta this is an answer to an incoming user-initiated interaction
      messaging_type: "RESPONSE"
    };
  }

  // Execute HTTP POST request against Meta Graph API
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(requestBody)
  });

  // Handle API failure responses (e.g., token expiration, permissions mismatch, invalid recipient ID)
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Meta API Error (${platform}):`, errorText);
    throw new Error(`Failed to send message via Meta API [Status: ${response.status}]: ${errorText}`);
  }

  // Return the parsed JSON response containing message_id / recipient_id
  return await response.json();
}
