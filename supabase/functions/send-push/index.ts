// GoodMorning — send-push Edge Function
// ----------------------------------------------------------------------
// Triggered by a Supabase Database Webhook on INSERT to public.nudges.
// Looks up the recipient's push subscriptions and sends a web-push to each.
//
// Deploy:  supabase functions deploy send-push --no-verify-jwt
// Secrets the function needs (Project Settings → Edge Functions → Secrets):
//   VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY
//   VAPID_SUBJECT          e.g. mailto:you@example.com
//   (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically)
// ----------------------------------------------------------------------

import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@goodmorning.app',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

interface PushTarget {
  userId: string;
  title: string;
  body: string;
  url?: string;
}

async function sendToUser(t: PushTarget) {
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', t.userId);

  if (!subs || subs.length === 0) return;

  const payload = JSON.stringify({
    title: t.title,
    body: t.body,
    url: t.url || '/',
  });

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload,
      );
    } catch (err) {
      // 404/410 = subscription is dead; clean it up.
      const code = (err as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', sub.endpoint);
      } else {
        console.error('push send failed:', err);
      }
    }
  }
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    // Case 1: Database Webhook on nudges INSERT → payload has `record`
    if (payload.record && payload.table === 'nudges') {
      const nudge = payload.record;
      // Look up the sender's name for a friendly title
      const { data: sender } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', nudge.from_user)
        .maybeSingle();
      const senderName = sender?.name || 'A friend';
      await sendToUser({
        userId: nudge.to_user,
        title: `${senderName} cheered you on 🔥`,
        body: nudge.message || 'Keep going.',
        url: '/',
      });
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Case 2: direct call → { userId, title, body, url }
    if (payload.userId && payload.title) {
      await sendToUser(payload as PushTarget);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Unrecognized payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
