'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * On desktop / large viewports we render a fake iPhone frame (status bar, notch,
 * bezel) so the prototype reads as mobile. On an actual phone — narrow viewport
 * or PWA standalone mode — we drop the chrome and let the real OS status bar
 * show through.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const check = () => {
      const narrow = window.matchMedia('(max-width: 430px)').matches;
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        // iOS sets this when launched from home screen
        // @ts-expect-error legacy Safari API
        window.navigator.standalone === true;
      setIsPhone(narrow || standalone);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div className="phone">
      {!isPhone && (
        <div className="statusbar">
          <div>9:41</div>
          <div className="notch" />
          <div className="icons">
            <span>•••</span>
            <span>5G</span>
            <span>▮▮▮</span>
          </div>
        </div>
      )}
      <div className="screen">{children}</div>
    </div>
  );
}
