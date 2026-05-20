// Web-push notification helpers — permission, service worker, subscription.

import { supabase } from './supabase';

export type NotifState = 'unsupported' | 'default' | 'granted' | 'denied';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function notifState(): NotifState {
  if (typeof window === 'undefined' || !('Notification' in window))
    return 'unsupported';
  return Notification.permission as NotifState;
}

/** Register the service worker. Called once on app start. */
export async function registerServiceWorker(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[GoodMorning] service worker registration failed:', e);
  }
}

/**
 * Full enable flow: ask permission → subscribe to push → save the subscription
 * to Supabase so the Edge Function can target this device.
 */
export async function enableNotifications(): Promise<NotifState> {
  if (notifState() === 'unsupported') return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';

  let permission: NotificationPermission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') return permission as NotifState;

  // Subscribe to push and persist — best effort.
  await subscribeToPush();
  return 'granted';
}

/** Subscribe this device to push and save the subscription to the DB. */
export async function subscribeToPush(): Promise<{ error?: string }> {
  if (
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return { error: 'Push not supported on this device' };
  }
  if (!VAPID_PUBLIC) {
    return { error: 'VAPID public key not configured' };
  }
  if (!supabase) return { error: 'Backend not configured' };

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
    }

    const json = sub.toJSON();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: 'Not signed in' };

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        endpoint: json.endpoint,
        user_id: user.id,
        p256dh: json.keys?.p256dh ?? '',
        auth: json.keys?.auth ?? '',
      },
      { onConflict: 'endpoint' },
    );
    if (error) return { error: error.message };
    return {};
  } catch (e: any) {
    return { error: e?.message || 'Could not subscribe' };
  }
}

// VAPID public key (base64url) → Uint8Array for applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
