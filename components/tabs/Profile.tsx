'use client';

import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { Calendar } from '../Calendar';

export function Profile() {
  const user = useSpark((s) => s.user);
  const diary = useSpark((s) => s.diary);
  const newestId = useSpark((s) => s.newestDiaryId);
  const openSettings = useUi((s) => s.openSettings);

  return (
    <>
      <div className="appbar">
        <div></div>
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

      <div className="fy-hero">
        <div className="avatar-lg">{(user.name[0] || 'C').toUpperCase()}</div>
        <div>
          <div className="date">Profile</div>
          <h1>{user.name}</h1>
          <p>Day {user.day} of 75 · {user.tone}</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="v"><em>{user.day}</em></div>
          <div className="l">Day of 75</div>
        </div>
        <div className="stat">
          <div className="v">{user.streak}</div>
          <div className="l">Day Streak</div>
        </div>
        <div className="stat">
          <div className="v">{user.buddies.length}</div>
          <div className="l">Buddies</div>
        </div>
      </div>

      <Calendar />

      <div className="section-label">Diary</div>
      <div className="diary-grid">
        {diary.map((d) => {
          if (d.type === 'reflection') {
            return (
              <div
                key={d.id}
                className={'diary-tile reflection' + (d.id === newestId ? ' new' : '')}
              >
                <div className="body">{d.body ?? ''}</div>
                <div className="meta">
                  <span className="day">{d.day}</span>
                </div>
              </div>
            );
          }
          return (
            <div
              key={d.id}
              className={'diary-tile ' + d.type + (d.id === newestId ? ' new' : '')}
              style={{ backgroundImage: d.bg }}
            >
              {d.type === 'video' ? <div className="play" /> : <div />}
              <div className="meta">
                <span className="day">{d.day}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
