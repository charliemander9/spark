'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { updateProfile } from '@/lib/profile';
import { hasSupabase } from '@/lib/supabase';

export function Buddies() {
  const buddies = useSpark((s) => s.user.buddies);
  const setUser = useSpark((s) => s.setUser);
  const setScreen = useSpark((s) => s.setScreen);
  const push = useSpark((s) => s.user.push);
  const notifBuddies = useSpark((s) => s.user.notifBuddies);
  const [draftName, setDraftName] = useState('');
  const [draftPhone, setDraftPhone] = useState('');

  const addBuddy = () => {
    const name = draftName.trim();
    if (!name) return;
    setUser({
      buddies: [
        ...buddies,
        { name, relation: '', phone: draftPhone.trim() || undefined },
      ],
    });
    setDraftName('');
    setDraftPhone('');
  };

  const removeBuddy = (i: number) => {
    setUser({ buddies: buddies.filter((_, j) => j !== i) });
  };

  const inviteBuddy = (phone: string, name: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const text =
      `Hey ${name} — I'm doing a 75-day challenge on GM ⚡. ` +
      `If you can, nudge me when I go quiet? ${origin}`;
    if (phone) {
      window.location.href =
        `sms:${encodeURIComponent(phone)}&body=${encodeURIComponent(text)}`;
    } else if ((navigator as any).share) {
      (navigator as any)
        .share({ title: 'GM', text, url: origin })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Invite copied — paste it in a text to them.');
    }
  };

  const finish = () => {
    if (hasSupabase) updateProfile({ onboarded: true });
    setScreen('app');
  };

  return (
    <div className="onb-q">
      <h1>
        Your <em>accountability circle</em>.
      </h1>
      <p className="lede">
        Add a few people who can keep you honest. If you go quiet for a couple
        of days, we&apos;ll quietly text them on your behalf.
      </p>

      <div className="buddy-add-form">
        <input
          type="text"
          placeholder="Name — e.g. Mom, Riley, Coach Em"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
        />
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Phone (optional, US format)"
          value={draftPhone}
          onChange={(e) => setDraftPhone(e.target.value)}
        />
        <button className="btn btn-accent" onClick={addBuddy} disabled={!draftName.trim()}>
          ＋ Add
        </button>
      </div>

      {buddies.map((b, i) => (
        <div key={i} className="buddy-card">
          <div className="ava">{(b.name[0] || '?').toUpperCase()}</div>
          <div className="body">
            <b>{b.name}</b>
            <small>{b.phone ? b.phone : 'No phone yet — add one to text them invites'}</small>
          </div>
          <button
            className="bc-text"
            onClick={() => inviteBuddy(b.phone || '', b.name)}
            title="Text them an invite"
          >
            <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M21 11.5c0 4.14-4.03 7.5-9 7.5a9.7 9.7 0 0 1-3.6-.69L3 20l1.27-3.62A7.5 7.5 0 0 1 3 11.5C3 7.36 7.03 4 12 4s9 3.36 9 7.5z" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="x" onClick={() => removeBuddy(i)}>×</button>
        </div>
      ))}

      <p
        style={{
          marginTop: 4,
          fontFamily: "'Fraunces',serif",
          fontStyle: 'italic',
          fontSize: 12,
          color: 'var(--ink-3)',
          textAlign: 'center',
        }}
      >
        Tip: tap the message icon to text them an invite right now.
      </p>

      <div className="buddy-toggle-row">
        <div className="body">
          <b>Notify me to check in</b>
          <small>A gentle morning push if you haven&apos;t opened the app yet</small>
        </div>
        <div
          className={'toggle' + (push ? ' on' : '')}
          onClick={() => setUser({ push: !push })}
        />
      </div>
      <div className="buddy-toggle-row">
        <div className="body">
          <b>Nudge my circle if I go quiet</b>
          <small>After two days of silence, we&apos;ll quietly text your circle</small>
        </div>
        <div
          className={'toggle' + (notifBuddies ? ' on' : '')}
          onClick={() => setUser({ notifBuddies: !notifBuddies })}
        />
      </div>

      <div style={{ flex: 1, minHeight: 12 }} />
      <div className="onb-stick">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={finish}>
            Skip
          </button>
          <button className="btn btn-accent btn-lg" style={{ flex: 2 }} onClick={finish}>
            I&apos;m in
          </button>
        </div>
      </div>
    </div>
  );
}
