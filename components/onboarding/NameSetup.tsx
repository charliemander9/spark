'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { updateProfile } from '@/lib/profile';
import { hasSupabase } from '@/lib/supabase';

export function NameSetup() {
  const user = useSpark((s) => s.user);
  const setUser = useSpark((s) => s.setUser);
  const setScreen = useSpark((s) => s.setScreen);

  // Seed with the current profile name (which the trigger sets to the email
  // local-part by default). The user can keep it or type a fresh display name.
  const [name, setName] = useState(user.name || '');
  const [busy, setBusy] = useState(false);

  const handleContinue = async () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return;
    setBusy(true);
    setUser({ name: trimmed });
    if (hasSupabase) await updateProfile({ name: trimmed });
    setBusy(false);
    setScreen('onb-challenge');
  };

  return (
    <div className="onb-hero">
      <p
        className="lede"
        style={{ marginTop: 18, maxWidth: 320, textAlign: 'center' }}
      >
        What should your friends call you?
      </p>
      <p
        style={{
          marginTop: 6,
          fontSize: 12.5,
          color: 'var(--ink-3)',
          fontFamily: "'Inter',sans-serif",
          textAlign: 'center',
          maxWidth: 300,
        }}
      >
        This is what shows up on your profile and in your friends&apos; feeds.
        You can change it later in Settings.
      </p>

      <div style={{ width: '100%', marginTop: 22 }}>
        <input
          type="text"
          autoComplete="given-name"
          placeholder="Your first name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim().length >= 2) handleContinue();
          }}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            fontFamily: "'Fraunces',serif",
            fontSize: 18,
            color: 'var(--ink)',
            textAlign: 'center',
          }}
          autoFocus
        />
      </div>

      <div style={{ flex: 1 }} />
      <button
        className="btn btn-accent btn-lg btn-block"
        disabled={name.trim().length < 2 || busy}
        onClick={handleContinue}
      >
        {busy ? 'Saving…' : 'Continue'}
      </button>
    </div>
  );
}
