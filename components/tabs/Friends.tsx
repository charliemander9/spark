'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { BUDDIES, FRIENDS_FEED } from '@/lib/data';

export function Friends() {
  const openSettings = useUi((s) => s.openSettings);
  const setScreen = useSpark((s) => s.setScreen);
  const buddies = useSpark((s) => s.user.buddies);
  const [modal, setModal] = useState<{ title: string; text: string } | null>(null);

  const fireOrFrost = (state: 'fire' | 'frost' | 'okay') =>
    state === 'fire' ? '🔥' : state === 'frost' ? '❄️' : '✓';

  const hasContent = BUDDIES.length > 0 || FRIENDS_FEED.length > 0 || buddies.length > 0;

  return (
    <>
      <div className="appbar">
        <div></div>
        <div className="right">
          <button
            className="iconbtn"
            onClick={() => setScreen('onb-buddies')}
          >
            <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="currentColor" strokeWidth={1.6}>
              <line x1={12} y1={5} x2={12} y2={19} strokeLinecap="round" />
              <line x1={5} y1={12} x2={19} y2={12} strokeLinecap="round" />
            </svg>
          </button>
          <button
            className="iconbtn"
            onClick={openSettings}
            dangerouslySetInnerHTML={{ __html: gearSvg() }}
          />
        </div>
      </div>

      <div className="friends-head">
        <div className="date">Your Circle</div>
        <h1>Friends</h1>
      </div>

      {!hasContent ? (
        <div className="empty-tab">
          <div className="icon">🫂</div>
          <h3>Add your circle</h3>
          <p>
            Invite the people who'll keep you honest. Their daily check-ins
            show up here, and you can send a nudge whenever someone's quiet.
          </p>
          <button
            className="empty-cta"
            onClick={() => setScreen('onb-buddies')}
          >
            Add a buddy
          </button>
        </div>
      ) : (
        <>
          {/* User-added buddies */}
          {buddies.length > 0 && (
            <>
              <div className="section-label">Your buddies</div>
              <div className="buddies-row">
                {buddies.map((b, i) => (
                  <div key={i} className="buddy no-gratitude">
                    <div className="buddy-ava-wrap">
                      <div className="buddy-ava sage">
                        {(b.name[0] || '?').toUpperCase()}
                      </div>
                      <button
                        className="nudge-dot"
                        onClick={() =>
                          setModal({
                            title: 'Send ' + b.name + ' a gentle hello',
                            text: 'A short "I\'m thinking of you, keep going" note?',
                          })
                        }
                      >
                        <svg viewBox="0 0 24 24" width={11} height={11} fill="currentColor">
                          <path d="M13 2l-9 12h7l-1 8 9-12h-7z" />
                        </svg>
                      </button>
                    </div>
                    <span className="name">{b.name}</span>
                    <span className="streak-mini">
                      <span className="mono">—</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Curated mock feed — if any seeded */}
          {FRIENDS_FEED.length > 0 && (
            <>
              <div className="section-label">Today</div>
              {FRIENDS_FEED.map((p, idx) => {
                const ico = fireOrFrost(p.state);
                return (
                  <div key={p.name + idx} className="fpost">
                    <div className="fpost-head">
                      <div className="fpost-id">
                        <div className={'ava ' + (p.avaColor === 'sage' ? '' : p.avaColor === 'rose' ? 'rose' : 'terra')}>
                          {p.initials}
                        </div>
                        <div>
                          <div className="name">{p.name}</div>
                          <div className="sub">
                            {p.when} ·{' '}
                            <span className="streak-chip">
                              {ico} <span className="mono">{p.streak}d</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {p.type === 'reflection' ? (
                      <div className="fpost-reflection">
                        <div className="chip">{p.course}</div>
                        <div className="body">{p.reflection}</div>
                      </div>
                    ) : (
                      <>
                        <div className="fpost-frame">
                          <div className="fpost-photo" style={{ backgroundImage: p.bg }}>
                            <div className="fpost-chip">{p.course}</div>
                          </div>
                        </div>
                        <div className="fpost-caption">{p.caption}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </>
      )}

      {modal && (
        <div className="modal-bd open" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3><em>{modal.title}</em></h3>
            <p>{modal.text}</p>
            <div className="row">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Not now</button>
              <button
                className="btn btn-accent"
                onClick={() => {
                  setModal(null);
                  setTimeout(() => alert('Sent.'), 80);
                }}
              >
                Yes, send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
