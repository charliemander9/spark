'use client';

import { useSpark } from '@/lib/store';

export function Buddies() {
  const setScreen = useSpark((s) => s.setScreen);
  const setUser = useSpark((s) => s.setUser);
  const push = useSpark((s) => s.user.push);
  const notifBuddies = useSpark((s) => s.user.notifBuddies);

  const next = () => setScreen('onb-notifications');

  return (
    <div className="onb-q">
      <h1>
        Your <em>accountability circle</em>.
      </h1>
      <p className="lede">
        The work is yours, but you don&apos;t have to do it alone. Your circle is
        the people who keep you honest — partner, parent, sibling, coach, friend.
      </p>
      <p className="lede">
        You&apos;ll add them inside the app from <b>Settings → Accountability
        buddies</b> once you&apos;re set up. We&apos;ll quietly text them on your
        behalf if you go quiet for a couple of days.
      </p>

      <div className="buddy-toggle-row">
        <div className="body">
          <b>Notify me to check in</b>
          <small>
            A gentle morning push if you haven&apos;t opened the app yet
          </small>
        </div>
        <div
          className={'toggle' + (push ? ' on' : '')}
          onClick={() => setUser({ push: !push })}
        />
      </div>
      <div className="buddy-toggle-row">
        <div className="body">
          <b>Nudge my circle if I go quiet</b>
          <small>
            After two days of silence, we&apos;ll quietly text your circle
          </small>
        </div>
        <div
          className={'toggle' + (notifBuddies ? ' on' : '')}
          onClick={() => setUser({ notifBuddies: !notifBuddies })}
        />
      </div>

      <div style={{ flex: 1, minHeight: 12 }} />
      <div className="onb-stick">
        <button
          className="btn btn-accent btn-lg btn-block"
          onClick={next}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
