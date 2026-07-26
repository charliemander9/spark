'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { CATEGORIES, CHALLENGE_LENGTH } from '@/lib/data';
import type { CalendarDay } from '@/lib/types';

export function Calendar() {
  const user = useSpark((s) => s.user);
  const calendar = useSpark((s) => s.calendar);
  const menu = useSpark((s) => s.menu);

  // Which day's detail popup is open (day-of-month number), or null.
  const [openDay, setOpenDay] = useState<number | null>(null);

  // Real calendar — current month with today = today's actual date.
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  // Colors come from the current menu's slot categories so the legend always
  // matches what the user is tracking.
  const colors = menu.map((c) => CATEGORIES[c.category]?.ringColor || '#999');
  const labels = menu.map((c) => c.label);

  const todayData: CalendarDay = {
    done: menu.map((c) => c.completed),
  };

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="profile-calendar">
      <div className="cal-header">
        <div className="cal-month">{monthName}</div>
        <div className="cal-day-count">Day {user.day} of {CHALLENGE_LENGTH}</div>
      </div>
      <div className="cal-dow">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="cal-cell empty" />;
          const isToday = d === today;
          const isFuture = d > today;
          const data = isToday ? todayData : calendar[d];
          const hasData = !!data && data.done.some(Boolean);
          const cls = ['cal-cell'];
          if (isFuture) cls.push('future');
          if (isToday) cls.push('today');
          if (hasData) cls.push('has-data');
          return (
            <button
              key={i}
              className={cls.join(' ')}
              disabled={isFuture || !data}
              onClick={() => data && setOpenDay(d)}
            >
              <TallySvg data={data} colors={colors} />
              <div className="cal-day-num">{d}</div>
            </button>
          );
        })}
      </div>
      <div className="cal-legend">
        {labels.map((l, i) => (
          <div key={i}>
            <span className="swatch" style={{ color: colors[i] }} /> {l}
          </div>
        ))}
      </div>

      {openDay !== null && (
        <DayDetail
          day={openDay}
          date={new Date(year, month, openDay)}
          data={openDay === today ? todayData : calendar[openDay]}
          labels={labels}
          colors={colors}
          onClose={() => setOpenDay(null)}
        />
      )}
    </div>
  );
}

function DayDetail({
  day,
  date,
  data,
  labels,
  colors,
  onClose,
}: {
  day: number;
  date: Date;
  data: CalendarDay | undefined;
  labels: string[];
  colors: string[];
  onClose: () => void;
}) {
  const flags = data?.done ?? [];
  const doneCount = flags.filter(Boolean).length;
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="modal-bd open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="day-detail-head">
          <div className="dd-date">{dateLabel}</div>
          <div className="dd-count">
            {doneCount} of {labels.length} done
          </div>
        </div>
        <div className="day-detail-list">
          {labels.map((l, i) => {
            const on = !!flags[i];
            return (
              <div key={i} className={'dd-row' + (on ? ' on' : '')}>
                <span
                  className={'dd-check' + (on ? ' checked' : '')}
                  style={on ? { background: colors[i], borderColor: colors[i] } : undefined}
                >
                  {on && (
                    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="#fff" strokeWidth={3}>
                      <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="dd-label">{l}</span>
              </div>
            );
          })}
        </div>
        <button className="btn btn-secondary btn-block" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

/**
 * Tally mark renderer — vertical lines for each completed check-in, with the
 * 5th tally drawn as a diagonal strike across the previous four. Each line
 * uses the matching slot's category color.
 */
function TallySvg({
  data,
  colors,
}: {
  data: CalendarDay | undefined;
  colors: string[];
}) {
  const flags = data?.done ?? [];
  const done = flags.slice(0, 5);          // cap visual at 5
  const lineCount = Math.min(done.filter(Boolean).length, 5);

  // Layout: 4 vertical lines + optional diagonal strike for the 5th
  // viewBox 32x32. Vertical lines sit at x = 6, 12, 18, 24.
  const xs = [6, 12, 18, 24];
  const yTop = 7;
  const yBot = 25;
  const sw = 2.2;

  // Determine which slot colors to use for visible lines (the first N true ones)
  const visibleSlotIndexes: number[] = [];
  done.forEach((flag, i) => {
    if (flag) visibleSlotIndexes.push(i);
  });
  const slotsForLines = visibleSlotIndexes.slice(0, Math.min(lineCount, 4));
  const fifthSlotIdx = visibleSlotIndexes[4]; // may be undefined

  return (
    <svg className="cal-tally-svg" viewBox="0 0 32 32">
      {slotsForLines.map((slotIdx, i) => (
        <line
          key={'tally' + i}
          x1={xs[i]}
          y1={yTop}
          x2={xs[i]}
          y2={yBot}
          stroke={colors[slotIdx] || 'var(--ink-3)'}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      ))}
      {fifthSlotIdx !== undefined && (
        <line
          x1={3}
          y1={yBot - 1}
          x2={27}
          y2={yTop + 1}
          stroke={colors[fifthSlotIdx] || 'var(--ink-3)'}
          strokeWidth={sw}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
