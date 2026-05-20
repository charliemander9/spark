// GoodMorning — push sender API route.
// Called by a Supabase Database Webhook when a row is inserted into `nudges`.
// Looks up the recipient's saved push subscriptions and sends a web-push.
//
// Env vars needed on Vercel:
//   VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY
//   VAPID_SUBJECT                e.g. mailto:you@example.com
//   SUPABASE_SERVICE_ROLE_KEY    (Supabase → Settings → API → service_role key)
//   NEXT_PUBLIC_SUPABASE_URL     (already set)

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// web-push relies on Node crypto — force the Node.js runtime, not Edge.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function vapidReady(): boolean {
  // Public key can come from either env name — reuse the client one if set.
  const pub =
    process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:hello@goodmorning.app',
    pub,
    priv,
  );
  return true;
}

async function sendToUser(
  userId: string,
  title: string,
  body: string,
  url = '/',
) {
  const supabase = getSupabase();
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (!subs || subs.length === 0) return 0;

  const payload = JSON.stringify({ title, body, url });
  let sent = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      );
      sent++;
    } catch (err: any) {
      const code = err?.statusCode;
      // 404/410 → dead subscription, clean it out
      if (code === 404 || code === 410) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint);
      } else {
        console.error('push send failed:', err?.message || err);
      }
    }
  }
  return sent;
}

export async function POST(req: NextRequest) {
  if (!vapidReady()) {
    return NextResponse.json(
      { ok: false, error: 'VAPID keys not configured' },
      { status: 500 },
    );
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad JSON' }, { status: 400 });
  }

  try {
    // Case 1: Supabase Database Webhook on nudges INSERT
    if (payload?.table === 'nudges' && payload?.record) {
      const nudge = payload.record;
      const supabase = getSupabase();
      const { data: sender } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', nudge.from_user)
        .maybeSingle();
      const senderName = sender?.name || 'A friend';
      const sent = await sendToUser(
        nudge.to_user,
        `${senderName} cheered you on 🔥`,
        nudge.message || 'Keep going.',
        '/',
      );
      return NextResponse.json({ ok: true, sent });
    }

    // Case 2: direct call → { userId, title, body, url }
    if (payload?.userId && payload?.title) {
      const sent = await sendToUser(
        payload.userId,
        payload.title,
        payload.body || '',
        payload.url || '/',
      );
      return NextResponse.json({ ok: true, sent });
    }

    return NextResponse.json(
      { ok: false, error: 'Unrecognized payload' },
      { status: 400 },
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 },
    );
  }
}

// Simple GET so you can sanity-check the route is live in a browser.
export async function GET() {
  return NextResponse.json({
    ok: true,
    route: 'send-push',
    vapid: vapidReady() ? 'configured' : 'missing',
  });
}
