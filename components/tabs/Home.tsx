'use client';

import { useSpark, useSparkActions } from '@/lib/storeActions';
import { useSpark as useStore } from '@/lib/store';
import { dailyQuote, greeting, gearSvg, todayLabel } from '@/lib/helpers';
import { TONE_COPY } from '@/lib/data';
import { CourseCard } from '../CourseCard';
import { DailyGate } from '../DailyGate';

export function Home() {
  const user = useStore((s) => s.user);
  const tone = TONE_COPY[user.tone];
  const [g, name] = greeting(user.name);
  const openSettings = useSparkActions('openSettings');

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
            <span className="lbl">day streak</span>
          </div>
          <button
            className="iconbtn"
            onClick={openSettings}
            dangerouslySetInnerHTML={{ __html: gearSvg() }}
          />
        </div>
      </div>

      <div className="daily-prompt">
        <div className="tag">Today's Spark</div>
        <div className="serif-quote">"{dailyQuote()}"</div>
      </div>

      <div className="home-hero">
        <div className="date">
          Day {user.day} of 75 · {todayLabel()}
        </div>
        <h1>
          {g}, <em>{name}</em>
        </h1>
        <p>{tone.sub}</p>
      </div>

      {!user.dailyEntry && <DailyGate />}

      <CourseCard slot="appetizer" />
      <CourseCard slot="main" />
      <CourseCard slot="treat" />
    </>
  );
}
