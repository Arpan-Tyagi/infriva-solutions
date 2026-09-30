/**
 * @file src/app/api/meta/webhook/route.ts
 * @description Meta Omnichannel Webhook Gateway & AI Automation Engine
 *
 * This Next.js Route Handler implements the complete bidirectional webhook integration
 * for Meta platforms: Facebook Messenger, Instagram Direct, and WhatsApp Business Cloud API.
 *
 * Architectural Workflow:
 * 1. Webhook Handshake (`GET`):
 *    - Meta initiates a GET request when configuring webhooks in the Meta App Dashboard.
 *    - Validates `hub.verify_token` against `META_WEBHOOK_VERIFY_TOKEN`.
 *    - Responds with `hub.challenge` to prove endpoint authenticity.
 *
 * 2. Cryptographic Security & Signature Verification (`POST`):
 *    - Meta signs all webhook payloads with the App Secret using HMAC-SHA256 (`x-hub-signature-256`).
 *    - This handler derives the expected digest and compares it using `crypto.timingSafeEqual()`.
 *    - This prevents timing side-channel attacks that could allow forged payloads.
 *
 * 3. Echo-Loop Prevention:
 *    - Ignores messages marked `is_echo === true` (messages sent by the bot itself).
 *    - Bypasses empty, sticker, or reaction events to focus strictly on text conversations.
 *
 * 4. Asynchronous Decoupling via Next.js `after()`:
 *    - Meta mandates a 200 OK acknowledgment within a few seconds, or it re-attempts delivery.
 *    - Next.js `after()` acknowledges the HTTP request immediately while keeping the serverless
 *      microtask alive in the background to fetch chat history, query Gemini, and dispatch replies.
 *
 * 5. Conversational Memory:
 *    - Retrieves the sender's last 10 messages from Supabase `chat_messages` table.
 *    - Maps 'inbound' to Gemini 'user' and 'outbound' to Gemini 'model' for coherent multi-turn context.
 */

import { NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { generateContent } from '@/lib/gemini';
import { sendMetaMessage } from '@/lib/meta';
import { supabase } from '@/lib/supabase';
import { createAiSessionId, createAiTraceId } from '@/lib/posthog-ai';

/**
 * Persists an inbound or outbound message event into Supabase for audit logging and context memory.
 *
 * @param senderId - Unique platform user identifier (PSID, IGSID, or phone number)
 * @param platform - Channel origin ('messenger' | 'whatsapp' | 'instagram')
 * @param direction - 'inbound' (from user) or 'outbound' (from Infriva AI)
 * @param messageText - Raw text content of the message
 */
async function logChatMessage(
  senderId: string, 
  platform: string, 
  direction: 'inbound' | 'outbound', 
  messageText: string
) {
  const { error } = await supabase.from('chat_messages').insert([{
    sender_id: senderId,
    platform,
    direction,
    message: messageText
  }]);
  
  if (error) {
    console.error("Supabase Chat Logging Error:", error);
  }
}

/**
 * GET Handler: Meta Webhook Verification Handshake
 *
 * Invoked by Meta developers dashboard when establishing or renewing webhook subscriptions.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  // Verify that mode is 'subscribe' and token matches our configured secret
  if (mode === 'subscribe' && token === verifyToken) {
    console.log('META_WEBHOOK_VERIFIED: Successfully established subscription handshake.');
    // Respond directly with the challenge string received from Meta
    return new NextResponse(challenge, { status: 200 });
  }

  // Token mismatch or invalid mode: reject request
  return new NextResponse('Forbidden: Invalid verification token', { status: 403 });
}

/**
 * POST Handler: Inbound Meta Event Processing & AI Dispatch
 *
 * Receives incoming messages from Messenger, Instagram Direct, and WhatsApp,
 * verifies HMAC signatures, generates context-aware AI answers, and dispatches replies.
 */
export async function POST(request: Request) {
  try {
    // 1. Read raw request body as text for cryptographic HMAC verification
    const rawBody = await request.clone().text();
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.META_APP_SECRET;

    // Reject requests missing cryptographic signature headers or app secret
    if (!appSecret || !signature) {
      return new NextResponse('Unauthorized: Missing signature header or secret', { status: 401 });
    }

    // 2. Derive expected HMAC-SHA256 signature using the app secret
    const hmac = crypto.createHmac('sha256', appSecret);
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
    const sigBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);

    // Constant-time comparison to prevent timing attacks
    if (sigBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(sigBuffer, digestBuffer)) {
      return new NextResponse('Invalid signature: Payload verification failed', { status: 401 });
    }

    // Parse verified payload JSON
    const body = JSON.parse(rawBody);

    // 3. Process Facebook Messenger or Instagram Direct Events
    if (body.object === 'page' || body.object === 'instagram') {
      if (Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          if (!Array.isArray(entry.messaging)) continue;
          
          for (const webhookEvent of entry.messaging) {
            // Guard: Ignore echoes (messages sent by our own page) to prevent infinite loops
            if (webhookEvent.message?.is_echo) continue;
            
            const senderId = webhookEvent.sender?.id;
            
            if (webhookEvent.message && webhookEvent.message.text && senderId) {
              const messageText = webhookEvent.message.text;
              
              // Detect if conversation originated from an ad click or lead ad opt-in
              const isLead = !!(webhookEvent.referral || webhookEvent.optin);
              const channel = body.object === 'instagram' ? 'instagram' : 'messenger';
              const sessionId = createAiSessionId(channel, senderId);
              
              // Asynchronous background execution: Decoupled to acknowledge Meta within 2000ms
              after(async () => {
                try {
                  // Fetch conversational context: Retrieve the user's last 10 messages from Supabase
                  const { data: recentHistory } = await supabase
                    .from('chat_messages')
                    .select('direction, message')
                    .eq('sender_id', senderId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                  // Map database directions to Gemini-compatible conversation history turns
                  const history = (recentHistory || []).reverse().map(h => ({
                    role: h.direction === 'inbound' ? ('user' as const) : ('model' as const),
                    parts: [{ text: h.message }]
                  }));

                  // Log inbound message from the user
                  await logChatMessage(senderId, channel, 'inbound', messageText);

                  // Generate agency response with Gemini 2.5 Flash
                  const aiResponse = await generateContent(messageText, isLead, {
                    sessionId,
                    traceId: createAiTraceId(),
                    distinctId: sessionId,
                  }, history);

                  // Log outbound response from the AI
                  await logChatMessage(senderId, channel, 'outbound', aiResponse);
                  
                  // Transmit response back to user via Meta Graph API v18.0
                  await sendMetaMessage(senderId, aiResponse, channel);
                } catch (err) {
                  console.error(`Async ${channel} AI execution error:`, err);
                }
              });
            }
          }
        }
      }
      // Return 200 OK immediately so Meta recognizes the event as successfully delivered
      return new NextResponse('EVENT_RECEIVED', { status: 200 });

    // 4. Process WhatsApp Business Account Cloud API Events
    } else if (body.object === 'whatsapp_business_account') {
      if (Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          if (!Array.isArray(entry.changes)) continue;
          
          for (const change of entry.changes) {
            const value = change.value;
            if (value && Array.isArray(value.messages)) {
              for (const message of value.messages) {
                const senderPhone = message.from;
                const phoneNumberId = value.metadata?.phone_number_id;

                // Process inbound text messages with a valid sender and phone number ID
                if (message.type === 'text' && message.text?.body && senderPhone && phoneNumberId) {
                  const messageText = message.text.body;
                  const isLead = !!message.referral;
                  const sessionId = createAiSessionId('whatsapp', senderPhone);

                  // Decouple AI processing from immediate webhook response
                  after(async () => {
                    try {
                      // Fetch conversational context: Retrieve the user's last 10 messages from Supabase
                      const { data: recentHistory } = await supabase
                        .from('chat_messages')
                        .select('direction, message')
                        .eq('sender_id', senderPhone)
                        .order('created_at', { ascending: false })
                        .limit(10);

                      const history = (recentHistory || []).reverse().map(h => ({
                        role: h.direction === 'inbound' ? ('user' as const) : ('model' as const),
                        parts: [{ text: h.message }]
                      }));

                      // Log inbound message from WhatsApp user
                      await logChatMessage(senderPhone, 'whatsapp', 'inbound', messageText);

                      // Generate agency response with Gemini 2.5 Flash
                      const aiResponse = await generateContent(messageText, isLead, {
                        sessionId,
                        traceId: createAiTraceId(),
                        distinctId: sessionId,
                      }, history);

                      // Log outbound response from AI
                      await logChatMessage(senderPhone, 'whatsapp', 'outbound', aiResponse);
                      
                      // Transmit response back via WhatsApp Business Cloud API
                      await sendMetaMessage(senderPhone, aiResponse, 'whatsapp', phoneNumberId);
                    } catch (err) {
                      console.error("Async WhatsApp AI execution error:", err);
                    }
                  });
                }
              }
            }
          }
        }
      }
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }

    // Unrecognized event object
    return new NextResponse('Not Found: Unhandled webhook object type', { status: 404 });
  } catch (error) {
    console.error('Meta Webhook internal server error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
