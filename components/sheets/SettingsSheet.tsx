'use client';

import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';

export function SettingsSheet() {
  const open = useUi((s) => s.settingsOpen);
  const close = useUi((s) => s.closeSettings);
  const user = useSpark((s) => s.user);
  const setUser = useSpark((s) => s.setUser);
  const setScreen = useSpark((s) => s.setScreen);
  const beginAnother75 = useSpark((s) => s.beginAnother75);
  const setDay75 = useSpark((s) => s.setDay75);

  if (!open) return null;

  return (
    <>
      <div className="sheet-bd open" onClick={close} />
      <div className="sheet open">
        <div className="sheet-handle" />
        <h2><em>Settings</em></h2>

        <div
          className="set-row nav-row"
          onClick={() => {
            close();
            setScreen('onb-challenge');
          }}
        >
          <div className="body">
            <b>Edit my challenge</b>
            <small>Switch programs or tweak the daily check-ins</small>
          </div>
          <div className="arrow">›</div>
        </div>
        <div
          className="set-row nav-row"
          onClick={() => {
            close();
            setScreen('onb-buddies');
          }}
        >
          <div className="body">
            <b>Accountability buddies</b>
            <small>Edit your circle</small>
          </div>
          <div className="arrow">›</div>
        </div>
        <div
          className="set-row nav-row"
          onClick={() => {
            close();
            setScreen('onb-find');
          }}
        >
          <div className="body">
            <b>Find more people</b>
            <small>Discover others on the same path</small>
          </div>
          <div className="arrow">›</div>
        </div>

        <div className="set-row">
          <div className="body">
            <b>Your name</b>
            <small>Used in the morning greeting</small>
          </div>
          <input
            value={user.name}
            onChange={(e) => setUser({ name: e.target.value || 'You' })}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink)', padding: '8px 12px', borderRadius: 999, width: 130, textAlign: 'right', fontSize: 13, fontFamily: "'Fraunces',serif" }}
          />
        </div>

        <div className="set-row">
          <div className="body">
            <b>Tone of voice</b>
            <small>How the app speaks to you</small>
          </div>
          <div className="seg">
            {(['feather','balanced','rock'] as const).map(v => (
              <button
                key={v}
                className={user.tone === v ? 'active' : ''}
                onClick={() => setUser({ tone: v })}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="set-row">
          <div className="body">
            <b>Privacy</b>
            <small>Who sees your posts</small>
          </div>
          <div className="seg">
            {(['private','friends','open'] as const).map(v => (
              <button
                key={v}
                className={user.privacy === v ? 'active' : ''}
                onClick={() => setUser({ privacy: v })}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="set-row">
          <div className="body">
            <b>Strict streaks</b>
            <small>Miss a day, restart. Or use "this month" softer view.</small>
          </div>
          <div
            className={'toggle' + (user.strict ? ' on' : '')}
            onClick={() => setUser({ strict: !user.strict })}
          />
        </div>

        <div className="set-row">
          <div className="body">
            <b>Clear today's entry</b>
            <small>Test the 24h gate — fires the daily prompt again</small>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '9px 16px', fontSize: 12.5 }}
            onClick={() => {
              close();
              setUser({ dailyEntry: null });
            }}
          >
            Clear
          </button>
        </div>

        <div className="set-row">
          <div className="body">
            <b>Test: Day 75 finish</b>
            <small>Jump to day 75 to preview the celebration</small>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '9px 16px', fontSize: 12.5 }}
            onClick={() => {
              close();
              setUser({ day: 75 });
              setDay75(true);
            }}
          >
            Trigger
          </button>
        </div>

        <div className="set-row">
          <div className="body">
            <b>Restart setup</b>
            <small>Re-do onboarding from the beginning</small>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '9px 16px', fontSize: 12.5 }}
            onClick={() => {
              close();
              setUser({ buddies: [], follows: [], day: 1, streak: 0, dailyEntry: null });
              beginAnother75();
              setScreen('onb-welcome');
            }}
          >
            Restart
          </button>
        </div>

        <div style={{ height: 30 }} />
      </div>
    </>
  );
}
