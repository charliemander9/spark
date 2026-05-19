'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { updateProfile } from '@/lib/profile';
import { hasSupabase } from '@/lib/supabase';

export function Buddies() {
  const buddies = useSpark((s) => s.user.buddies);
  const setUser = useSpark((s) => s.setUser);
  const setScreen = useSpark((s) => s.setScreen);
  const privacy = useSpark((s) => s.user.privacy);
  const push = useSpark((s) => s.user.push);
  const notifBuddies = useSpark((s) => s.user.notifBuddies);
  const [draft, setDraft] = useState('');

  const finish = () => {
    if (privacy === 'private') {
      if (hasSupabase) updateProfile({ onboarded: true });
      setScreen('app');
    } else {
      setScreen('onb-find');
    }
  };

  return (
    <div className="onb-q">
      <h1>
        Your <em>accountability circle</em>.
      </h1>
      <p className="lede">
        List people you'd feel okay leaning on — partner, parent, friend, sponsor, or someone from this community.
      </p>
      <p className="lede">
        If you go quiet for a couple of days, we'll gently message them on your behalf.
      </p>

      <div className="buddy-input-row">
        <input
          type="text"
          placeholder="Name — e.g. Mom, Riley, Coach Em"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              setUser({ buddies: [...buddies, { name: draft.trim(), relation: '' }] });
              setDraft('');
            }
          }}
        />
        <button
          onClick={() => {
            if (!draft.trim()) return;
            setUser({ buddies: [...buddies, { name: draft.trim(), relation: '' }] });
            setDraft('');
          }}
        >
          ＋ Add
        </button>
      </div>

      {buddies.map((b, i) => (
        <div key={i} className="buddy-card">
          <div className="ava">{(b.name[0] || '?').toUpperCase()}</div>
          <div className="body">
            <b>{b.name}</b>
            <small>{b.relation || 'In your corner'}</small>
          </div>
          <button
            className="x"
            onClick={() => setUser({ buddies: buddies.filter((_, j) => j !== i) })}
          >
            ×
          </button>
        </div>
      ))}

      <div className="buddy-toggle-row">
        <div className="body">
          <b>Notify me to check in</b>
          <small>A gentle morning push if you haven't opened the app yet</small>
        </div>
        <div
          className={'toggle' + (push ? ' on' : '')}
          onClick={() => setUser({ push: !push })}
        />
      </div>
      <div className="buddy-toggle-row">
        <div className="body">
          <b>Nudge my buddies if I go quiet</b>
          <small>After two days of silence, we'll quietly message your circle</small>
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
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
