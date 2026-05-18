'use client';

import { useState } from 'react';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { BUDDIES, FRIENDS_FEED } from '@/lib/data';

export function Friends() {
  const openSettings = useUi((s) => s.openSettings);
  const [modal, setModal] = useState<{ title: string; text: string } | null>(null);

  const fireOrFrost = (state: 'fire' | 'frost' | 'okay') =>
    state === 'fire' ? '🔥' : state === 'frost' ? '❄️' : '✓';

  return (
    <>
      <div className="appbar">
        <div></div>
        <div className="right">
          <button className="iconbtn">
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

      <div className="section-label">Buddies — tap to nudge</div>
      <div className="buddies-row">
        {BUDDIES.map((b) => {
          const ico = fireOrFrost(b.state);
          return (
            <div
              key={b.name}
              className={'buddy' + (b.todayCheck ? ' has-note' : ' no-gratitude')}
            >
              {b.todayCheck && (
                <div
                  className="gratitude-note"
                  onClick={() =>
                    setModal({
                      title: b.name + "'s check-in today",
                      text: '"' + b.todayCheck + '"',
                    })
                  }
                >
                  {b.todayCheck}
                </div>
              )}
              <div className="buddy-ava-wrap">
                <div
                  className={
                    'buddy-ava ' + b.avaColor + (b.todayCheck ? ' has-gratitude' : '')
                  }
                >
                  {b.initials}
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
                <span>{ico}</span>
                <span className="mono">{b.streak}d</span>
              </span>
            </div>
          );
        })}
        <div
          className="buddy"
          onClick={() =>
            setModal({
              title: 'Add to your circle',
              text: 'Invite someone to your accountability circle?',
            })
          }
        >
          <div className="buddy-ava-wrap">
            <div className="buddy-ava add">+</div>
          </div>
          <span className="name">Add</span>
        </div>
      </div>

      <div className="nudge-bar">
        <div className="text">
          <b>Need a push today?</b> Ask a buddy to check in on you.
        </div>
        <button
          onClick={() =>
            setModal({
              title: 'Send a gentle ask',
              text: "We'll let Riley know you'd love a check-in.",
            })
          }
        >
          Ask
        </button>
      </div>

      <div className="section-label">Today</div>
      {FRIENDS_FEED.map((p, idx) => {
        const ico = fireOrFrost(p.state);
        return (
          <div key={p.name + idx} className="fpost">
            <div className="fpost-head">
              <div className="fpost-id">
                <div
                  className={
                    'ava ' +
                    (p.avaColor === 'sage' ? '' : p.avaColor === 'rose' ? 'rose' : 'terra')
                  }
                >
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
              <button
                className="fpost-nudge"
                onClick={() =>
                  setModal({
                    title: 'Send ' + p.name + ' a cheer',
                    text: 'A small "I see you doing this — keep going" note?',
                  })
                }
              >
                Cheer
              </button>
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

            <div className="fpost-actions">
              <div>♡ <span className="mono">{Math.floor(Math.random() * 40) + 5}</span></div>
              <div>↩ Reply</div>
              <div>Cheer</div>
            </div>
          </div>
        );
      })}

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
