'use client';

import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';

export function Friends() {
  const openSettings = useUi((s) => s.openSettings);
  return (
    <>
      <div className="appbar">
        <div></div>
        <div className="right">
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
      <p className="lede" style={{ padding: '12px 22px' }}>
        Buddy nudges + friend feed come online in the next push.
      </p>
    </>
  );
}
