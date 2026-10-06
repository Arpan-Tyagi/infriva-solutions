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
import { sendMetaMessage, sendWhatsAppTemplate } from '@/lib/meta';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createAiSessionId, createAiTraceId } from '@/lib/posthog-ai';

interface NormalizedMessage {
  platform: 'messenger' | 'whatsapp' | 'instagram';
  senderId: string;
  messageText: string;
  isLead: boolean;
  phoneNumberId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMetaPayload(body: any): NormalizedMessage[] {
  const messages: NormalizedMessage[] = [];

  if (body.object === 'page' || body.object === 'instagram') {
    if (Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (!Array.isArray(entry.messaging)) continue;
        
        for (const webhookEvent of entry.messaging) {
          if (webhookEvent.message?.is_echo) continue;
          
          const senderId = webhookEvent.sender?.id;
          
          if (webhookEvent.message?.text && senderId) {
            const isLead = !!(webhookEvent.referral || webhookEvent.optin);
            const platform = body.object === 'instagram' ? 'instagram' : 'messenger';
            
            messages.push({
              platform,
              senderId,
              messageText: webhookEvent.message.text,
              isLead,
            });
          }
        }
      }
    }
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

              if (message.type === 'text' && message.text?.body && senderPhone && phoneNumberId) {
                messages.push({
                  platform: 'whatsapp',
                  senderId: senderPhone,
                  messageText: message.text.body,
                  isLead: !!message.referral,
                  phoneNumberId
                });
              }
            }
          }
        }
      }
    }
  }

  return messages;
}

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
  const { error } = await supabaseAdmin.from('chat_messages').insert([{
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
    // 1. Read raw request body as buffer for cryptographic HMAC verification
    const rawBodyBuffer = Buffer.from(await request.clone().arrayBuffer());
    const rawBody = new TextDecoder().decode(rawBodyBuffer);
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.META_APP_SECRET;

    // Reject requests missing cryptographic signature headers or app secret
    if (!appSecret || !signature) {
      return new NextResponse('Unauthorized: Missing signature header or secret', { status: 401 });
    }

    // 2. Derive expected HMAC-SHA256 signature using the app secret
    const hmac = crypto.createHmac('sha256', appSecret);
    const digest = 'sha256=' + hmac.update(rawBodyBuffer).digest('hex');
    const sigBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);

    // Constant-time comparison to prevent timing attacks
    if (sigBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(sigBuffer, digestBuffer)) {
      return new NextResponse('Invalid signature: Payload verification failed', { status: 401 });
    }

    // Parse verified payload JSON
    const body = JSON.parse(rawBody);

    const messages = normalizeMetaPayload(body);

    for (const msg of messages) {
      const sessionId = createAiSessionId(msg.platform, msg.senderId);

      // Decouple AI processing from immediate webhook response
      after(async () => {
        try {
          let isRateLimited = false;
          try {
            const nowTime = Date.now();
            const { data: rlData } = await supabase.from('rate_limits').select('*').eq('ip_or_sender_id', msg.senderId).single();
            
            if (rlData && new Date(rlData.reset_time).getTime() > nowTime) {
              if (rlData.count > 50) {
                isRateLimited = true;
              } else {
                await supabaseAdmin.from('rate_limits').update({ count: rlData.count + 1 }).eq('ip_or_sender_id', msg.senderId);
              }
            } else {
              await supabaseAdmin.from('rate_limits').upsert({ ip_or_sender_id: msg.senderId, count: 1, reset_time: new Date(nowTime + 60000).toISOString() });
            }
          } catch (err) {
            console.warn('Rate limiter error, bypassing:', err);
          }

          if (isRateLimited) {
            try {
              await sendMetaMessage(
                msg.senderId,
                "You've reached the message limit for this session. Please email us at info@infrivasolutions.com for further assistance.",
                msg.platform,
                msg.phoneNumberId
              );
            } catch (fallbackErr) {
              console.error("Failed to send rate limit fallback:", fallbackErr);
            }
            return;
          }

          // Fetch conversational context: Retrieve the user's last 10 messages from Supabase
          const { data: recentHistory } = await supabase
            .from('chat_messages')
            .select('direction, message')
            .eq('sender_id', msg.senderId)
            .eq('platform', msg.platform)
            .order('created_at', { ascending: false })
            .limit(10);

          const history = (recentHistory || []).reverse().map(h => ({
            role: h.direction === 'inbound' ? ('user' as const) : ('model' as const),
            parts: [{ text: h.message }]
          }));

          // Log inbound message from the user
          await logChatMessage(msg.senderId, msg.platform, 'inbound', msg.messageText);

          if (msg.isLead) {
            try {
              const { error } = await supabaseAdmin.from('leads').insert({ platform: msg.platform, sender_id: msg.senderId, message: msg.messageText, created_at: new Date().toISOString() });
              if (error) console.error('Lead insertion error:', error);
            } catch (err) {
              console.error('Lead insertion exception:', err);
            }
          }

          // Generate agency response with Gemini 2.5 Flash
          const aiResponse = await generateContent(msg.messageText, msg.isLead, {
            sessionId,
            traceId: createAiTraceId(),
            distinctId: sessionId,
            platform: msg.platform,
          }, history);

          // Log outbound response from the AI
          await logChatMessage(msg.senderId, msg.platform, 'outbound', aiResponse);
          
          // Transmit response back via Meta Graph API v18.0
          await sendMetaMessage(msg.senderId, aiResponse, msg.platform, msg.phoneNumberId);
        } catch (err) {
          console.error(`Async ${msg.platform} AI execution error:`, err);
          try {
            await sendMetaMessage(
              msg.senderId,
              "Our digital concierge is currently unavailable. Please email us directly at info@infrivasolutions.com, and an architect will assist you shortly.",
              msg.platform,
              msg.phoneNumberId
            );
          } catch (metaErr) {
            console.error('Fallback message failed:', metaErr);
            if (msg.platform === 'whatsapp') {
              try {
                await sendWhatsAppTemplate(
                  msg.senderId,
                  "ai_downtime_alert",
                  "en_US",
                  [],
                  msg.phoneNumberId
                );
              } catch (templateErr) {
                console.error('WhatsApp template fallback failed:', templateErr);
              }
            }
          }
        }
      });
    }

    if (messages.length > 0 || body.object === 'page' || body.object === 'instagram' || body.object === 'whatsapp_business_account') {
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }

    // Unrecognized event object
    return new NextResponse('Not Found: Unhandled webhook object type', { status: 404 });
  } catch (error) {
    console.error('Meta Webhook internal server error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
