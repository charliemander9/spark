'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { updateProfile } from '@/lib/profile';
import { hasSupabase } from '@/lib/supabase';
import { enableNotifications, notifState } from '@/lib/notifications';

export function Notifications() {
  const setScreen = useSpark((s) => s.setScreen);
  const setUser = useSpark((s) => s.setUser);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState(notifState());

  const enable = async () => {
    setBusy(true);
    const result = await enableNotifications();
    setState(result);
    setUser({ push: result === 'granted' });
    setBusy(false);
  };

  const finish = async () => {
    if (hasSupabase) await updateProfile({ onboarded: true });
    setScreen('app');
  };

  return (
    <div className="onb-q">
      <h1>
        Turn on <em>nudges</em>.
      </h1>
      <p className="lede">
        Daily reminders to capture your entry, plus a ping when a friend cheers
        you. We won&apos;t spam — just the things that matter.
      </p>

      <div
        style={{
          marginTop: 22,
          padding: 22,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 10 }}>🔔</div>
        {state === 'granted' ? (
          <p
            style={{
              fontFamily: "'Fraunces',serif",
              fontStyle: 'italic',
              color: 'var(--sage, #A8E060)',
              fontSize: 15,
            }}
          >
            Notifications on. You&apos;re set.
          </p>
        ) : state === 'denied' ? (
          <p
            style={{
              fontFamily: "'Fraunces',serif",
              fontStyle: 'italic',
              color: 'var(--ink-3)',
              fontSize: 14,
            }}
          >
            Notifications were blocked. To turn them on later, head to Settings
            → Notifications on your phone and allow them for GoodMorning.
          </p>
        ) : state === 'unsupported' ? (
          <p
            style={{
              fontFamily: "'Fraunces',serif",
              fontStyle: 'italic',
              color: 'var(--ink-3)',
              fontSize: 14,
            }}
          >
            Notifications aren&apos;t supported in this browser. Try adding to
            home screen first, then opening from there.
          </p>
        ) : (
          <button
            className="btn btn-accent"
            onClick={enable}
            disabled={busy}
            style={{ padding: '12px 26px' }}
          >
            {busy ? 'Asking…' : 'Enable notifications'}
          </button>
        )}
      </div>

      <p
        style={{
          marginTop: 14,
          fontSize: 12,
          color: 'var(--ink-3)',
          fontStyle: 'italic',
          fontFamily: "'Fraunces',serif",
          textAlign: 'center',
        }}
      >
        You can change this anytime in Settings.
      </p>

      <div style={{ flex: 1, minHeight: 12 }} />
      <div className="onb-stick">
        <button
          className="btn btn-accent btn-lg btn-block"
          onClick={finish}
        >
          Done — let me in
        </button>
      </div>
    </div>
  );
}
