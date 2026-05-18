'use client';

import { useSpark } from '@/lib/store';
import type { Privacy as PrivacyT } from '@/lib/types';

const OPTIONS: { id: PrivacyT; label: string; sub: string }[] = [
  { id: 'private', label: 'Private',      sub: 'A journal for one. Hold yourself accountable.' },
  { id: 'friends', label: 'Friends Only', sub: 'A small circle. Cheer each other on.' },
  { id: 'open',    label: 'Open',         sub: 'Discover others working toward similar things.' },
];

export function Privacy() {
  const privacy = useSpark((s) => s.user.privacy);
  const setUser = useSpark((s) => s.setUser);
  const setScreen = useSpark((s) => s.setScreen);

  return (
    <div className="onb-q">
      <h1>
        Who can see your <em>reflections</em>?
      </h1>
      <p className="lede">You can change this any time, globally or per post.</p>

      {OPTIONS.map((p) => {
        const sel = privacy === p.id;
        return (
          <button
            key={p.id}
            className={'opt' + (sel ? ' selected' : '')}
            onClick={() => setUser({ privacy: p.id })}
          >
            <div className="opt-label">
              <b>{p.label}</b>
              <small>{p.sub}</small>
            </div>
            <div className="opt-check" />
          </button>
        );
      })}

      <div style={{ flex: 1 }} />
      <div className="onb-stick">
        <button
          className="btn btn-accent btn-lg btn-block"
          onClick={() => setScreen('onb-buddies')}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
