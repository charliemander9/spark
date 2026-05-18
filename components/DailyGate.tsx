'use client';

import { useUi } from '@/lib/storeActions';

export function DailyGate() {
  const openDailySheet = useUi((s) => s.openDailySheet);
  return (
    <div className="daily-gate">
      <div className="gate-tag">Today's Entry</div>
      <h3>Mark the day first.</h3>
      <p>Post a photo or write a journal entry to unlock today's check-ins.</p>
      <button onClick={openDailySheet}>Capture Entry</button>
    </div>
  );
}
