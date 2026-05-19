'use client';

import { useSpark } from '@/lib/store';
import { SUGGESTED_FOLLOWS } from '@/lib/data';
import { updateProfile } from '@/lib/profile';
import { hasSupabase } from '@/lib/supabase';

export function FindFriends() {
  const follows = useSpark((s) => s.user.follows);
  const setUser = useSpark((s) => s.setUser);
  const setScreen = useSpark((s) => s.setScreen);

  const toggle = (name: string) => {
    const exists = follows.includes(name);
    setUser({
      follows: exists ? follows.filter((n) => n !== name) : [...follows, name],
    });
  };

  const finish = () => {
    if (hasSupabase) updateProfile({ onboarded: true });
    setScreen('app');
  };

  return (
    <div className="onb-q">
      <h1>
        Find your <em>community</em>.
      </h1>
      <p className="lede">
        People walking toward similar things. Follow whoever you'd like to see on your Discover feed.
      </p>

      {SUGGESTED_FOLLOWS.map((f) => {
        const followed = follows.includes(f.name);
        return (
          <div key={f.name} className="find-card">
            <div className="ava">{f.initials}</div>
            <div className="body">
              <b>{f.name}</b>
              <small>{f.sub}</small>
            </div>
            <button
              className={followed ? 'followed' : ''}
              onClick={() => toggle(f.name)}
            >
              {followed ? '✓ Following' : 'Follow'}
            </button>
          </div>
        );
      })}

      <div style={{ flex: 1, minHeight: 12 }} />
      <div className="onb-stick">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={finish}>
            Skip
          </button>
          <button className="btn btn-accent btn-lg" style={{ flex: 2 }} onClick={finish}>
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
