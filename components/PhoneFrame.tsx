'use client';

import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone">
      <div className="statusbar">
        <div>9:41</div>
        <div className="notch" />
        <div className="icons">
          <span>•••</span><span>5G</span><span>▮▮▮</span>
        </div>
      </div>
      <div className="screen">{children}</div>
    </div>
  );
}
