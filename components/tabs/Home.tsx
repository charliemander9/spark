'use client';

import { useSparkActions, useUi } from '@/lib/storeActions';
import { useSpark } from '@/lib/store';
import { dailyQuote, greeting, gearSvg, todayLabel } from '@/lib/helpers';
import { TONE_COPY } from '@/lib/data';
import { CourseCard } from '../CourseCard';

export function Home() {
  const user = useSpark((s) => s.user);
  const diary = useSpark((s) => s.diary);
  const tone = TONE_COPY[user.tone];
  const [g, name] = greeting(user.name);
  const openSettings = useSparkActions('openSettings');
  const openDailySheet = useUi((s) => s.openDailySheet);

  const hasEntry = !!user.dailyEntry;
  // Find today's entry (most-recent isDaily diary item, if any)
  const todayEntry = diary.find((d) => d.isDaily);

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
              <span className="freezes">❄️ {user.freezes}</span>
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
            {todayEntry?.type === 'photo' && todayEntry.bg ? (
              <div className="ds-thumb" style={{ backgroundImage: todayEntry.bg }} />
            ) : todayEntry?.type === 'video' && todayEntry.bg ? (
              <div className="ds-thumb video" style={{ backgroundImage: todayEntry.bg }}>
                <div className="ds-play" />
              </div>
            ) : (
              <div className="ds-thumb journal">✎</div>
            )}
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

      <CourseCard slot="appetizer" />
      <CourseCard slot="main" />
      <CourseCard slot="treat" />
    </>
  );
}
