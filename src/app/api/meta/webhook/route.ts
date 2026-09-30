import { NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { generateContent } from '@/lib/gemini';
import { sendMetaMessage } from '@/lib/meta';
import { supabase } from '@/lib/supabase';
import { createAiSessionId, createAiTraceId } from '@/lib/posthog-ai';

// Helper function to save chat logs to the Supabase database
async function logChatMessage(senderId: string, platform: string, direction: 'inbound' | 'outbound', messageText: string) {
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK_VERIFIED');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.clone().text();
    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.META_APP_SECRET;

    if (!appSecret || !signature) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const hmac = crypto.createHmac('sha256', appSecret);
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
    const sigBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);
    if (sigBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(sigBuffer, digestBuffer)) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.object === 'page' || body.object === 'instagram') {
      // Messenger or Instagram Direct
      if (Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          if (!Array.isArray(entry.messaging)) continue;
          for (const webhookEvent of entry.messaging) {
            if (webhookEvent.message?.is_echo) continue;
            const senderId = webhookEvent.sender?.id;
            
            if (webhookEvent.message && webhookEvent.message.text && senderId) {
              const messageText = webhookEvent.message.text;
              
              // Check context for ad or lead form origin based on referral/optin
              const isLead = !!(webhookEvent.referral || webhookEvent.optin);
              const channel = body.object === 'instagram' ? 'instagram' : 'messenger';
              
              // Wrap background async work in Next.js after() to prevent serverless freeze
              const sessionId = createAiSessionId(channel, senderId);
              after(async () => {
                try {
                  // Fetch conversational context (last 10 turns)
                  const { data: recentHistory } = await supabase
                    .from('chat_messages')
                    .select('direction, message')
                    .eq('sender_id', senderId)
                    .order('created_at', { ascending: false })
                    .limit(10);

                  const history = (recentHistory || []).reverse().map(h => ({
                    role: h.direction === 'inbound' ? ('user' as const) : ('model' as const),
                    parts: [{ text: h.message }]
                  }));

                  // Log inbound message from user
                  await logChatMessage(senderId, channel, 'inbound', messageText);

                  const aiResponse = await generateContent(messageText, isLead, {
                    sessionId,
                    traceId: createAiTraceId(),
                    distinctId: sessionId,
                  }, history);

                  // Log outbound AI response
                  await logChatMessage(senderId, channel, 'outbound', aiResponse);
                  await sendMetaMessage(senderId, aiResponse, channel);
                } catch (err) {
                  console.error(`Async ${channel} AI error:`, err);
                }
              });
            }
          }
        }
      }
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else if (body.object === 'whatsapp_business_account') {
      // WhatsApp
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
                  const messageText = message.text.body;

                  // Check if referral exists for WhatsApp
                  const isLead = !!message.referral;

                  // Wrap background async work in Next.js after() to prevent serverless freeze
                  const sessionId = createAiSessionId('whatsapp', senderPhone);
                  after(async () => {
                    try {
                      // Fetch conversational context (last 10 turns)
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

                      // Log inbound message from user
                      await logChatMessage(senderPhone, 'whatsapp', 'inbound', messageText);

                      const aiResponse = await generateContent(messageText, isLead, {
                        sessionId,
                        traceId: createAiTraceId(),
                        distinctId: sessionId,
                      }, history);

                      // Log outbound AI response
                      await logChatMessage(senderPhone, 'whatsapp', 'outbound', aiResponse);
                      await sendMetaMessage(senderPhone, aiResponse, 'whatsapp', phoneNumberId);
                    } catch (err) {
                      console.error("Async WhatsApp AI error:", err);
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

    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
