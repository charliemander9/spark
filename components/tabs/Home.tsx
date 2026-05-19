'use client';

import { useState } from 'react';
import { useSparkActions, useUi } from '@/lib/storeActions';
import { useSpark } from '@/lib/store';
import { dailyQuote, greeting, gearSvg, todayLabel } from '@/lib/helpers';
import { TONE_COPY } from '@/lib/data';
import type { DiaryEntry } from '@/lib/types';
import { CourseCard } from '../CourseCard';
import { Media } from '../Media';

export function Home() {
  const user = useSpark((s) => s.user);
  const diary = useSpark((s) => s.diary);
  const menu = useSpark((s) => s.menu);
  const useFreeze = useSpark((s) => s.useFreeze);
  const tone = TONE_COPY[user.tone];
  const [g, name] = greeting(user.name);
  const openSettings = useSparkActions('openSettings');
  const openDailySheet = useUi((s) => s.openDailySheet);

  const hasEntry = !!user.dailyEntry;
  // Find today's entry (most-recent isDaily diary item, if any)
  const todayEntry = diary.find((d) => d.isDaily);

  const [freezePromptOpen, setFreezePromptOpen] = useState(false);

  return (
    <>
      <div className="appbar">
        <div className="left">
          <div className="avatar-sm">{(user.name[0] || 'C').toUpperCase()}</div>
        </div>
        <div className="right">
          <div className="streak-pill">
            <span className="flame">🔥</span>
            <span className="n">{user.streak}</span>
            <span className="lbl">days</span>
            {user.freezes > 0 && (
              <button
                className="freezes"
                onClick={() => setFreezePromptOpen(true)}
                title="Use a freeze"
              >
                ❄️ {user.freezes}
              </button>
            )}
          </div>
          <button
            className="iconbtn"
            onClick={openSettings}
            dangerouslySetInnerHTML={{ __html: gearSvg() }}
          />
        </div>
      </div>

      <div className="daily-prompt">
        <div className="tag">Today's Motivation</div>
        <div className="serif-quote">"{dailyQuote()}"</div>
      </div>

      {/* DAILY ENTRY CARD */}
      {!hasEntry ? (
        <div className="daily-gate" onClick={openDailySheet} style={{ cursor: 'pointer' }}>
          <div className="gate-tag">Today's Entry</div>
          <h3>Seize the Day.</h3>
          <p>Cover charge to navigate the app. Post what you&apos;re doing today for your goal.</p>
          <button onClick={(e) => { e.stopPropagation(); openDailySheet(); }}>
            Capture Entry
          </button>
        </div>
      ) : (
        <div className="daily-saved" onClick={openDailySheet}>
          <div className="ds-left">
            <DSThumb entry={todayEntry} />
          </div>
          <div className="ds-body">
            <div className="ds-tag">Today's Entry</div>
            <div className="ds-title">
              {todayEntry?.type === 'reflection' ? 'Journal saved' :
               todayEntry?.type === 'video' ? 'Video saved' : 'Photo saved'}
            </div>
            <div className="ds-sub">Tap to add more</div>
          </div>
          <div className="ds-check">✓</div>
        </div>
      )}

      <div className="home-hero">
        <div className="date">
          Day {user.day} of 75 · {todayLabel()}
        </div>
        <h1>
          {g}, <em>{name}</em>
        </h1>
        <p>{tone.sub}</p>
      </div>

      {menu.map((_, i) => (
        <CourseCard key={i} slot={i} />
      ))}

      {freezePromptOpen && (
        <div
          className="modal-bd open"
          onClick={() => setFreezePromptOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 6 }}>
              ❄️
            </div>
            <h3>
              <em>Use a freeze?</em>
            </h3>
            <p>
              You have <b>{user.freezes}</b>{' '}
              {user.freezes === 1 ? 'freeze' : 'freezes'} left this month.
              Use one to cover today without breaking your streak — your
              check-ins reset tomorrow.
            </p>
            <div className="row">
              <button
                className="btn btn-secondary"
                onClick={() => setFreezePromptOpen(false)}
              >
                Not yet
              </button>
              <button
                className="btn btn-accent"
                onClick={() => {
                  useFreeze();
                  setFreezePromptOpen(false);
                }}
              >
                Use one
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DSThumb({ entry }: { entry: DiaryEntry | undefined }) {
  if (!entry) return <div className="ds-thumb journal">✎</div>;
  if (entry.type === 'reflection' || !entry.bg)
    return <div className="ds-thumb journal">✎</div>;
  return (
    <div className={'ds-thumb' + (entry.type === 'video' ? ' video' : '')}>
      <Media bg={entry.bg} isVideo={entry.type === 'video'} />
      {entry.type === 'video' && <div className="ds-play" />}
    </div>
  );
}
