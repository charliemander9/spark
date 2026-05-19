'use client';

import { useSpark } from '@/lib/store';
import { CATEGORIES } from '@/lib/data';
import type { CalendarDay } from '@/lib/types';

export function Calendar() {
  const user = useSpark((s) => s.user);
  const calendar = useSpark((s) => s.calendar);
  const menu = useSpark((s) => s.menu);

  const monthName = new Date(2026, 4, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const firstDow = new Date(2026, 4, 1).getDay();
  const daysInMonth = 31;
  const today = user.day;

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
        <div className="cal-day-count">Day {user.day} of 75</div>
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
          const cls = ['cal-cell'];
          if (isFuture) cls.push('future');
          if (isToday) cls.push('today');
          return (
            <div key={i} className={cls.join(' ')}>
              <RingSvg data={data} colors={colors} />
              <div className="cal-day-num">{d}</div>
            </div>
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
    </div>
  );
}

function RingSvg({
  data,
  colors,
}: {
  data: CalendarDay | undefined;
  colors: string[];
}) {
  const sw = 2.2;
  const c = 16;
  const n = colors.length;
  // Generate concentric radii from outside in. Outermost ring sits at r=11
  // (matches the original 3-slot look); shrink the gap for more slots.
  const outerR = 11;
  const gap = n > 1 ? Math.min(3.5, (outerR - 2) / Math.max(1, n - 1)) : 0;
  const radii = Array.from({ length: n }, (_, i) => outerR - i * gap);
  const flags = data?.done && data.done.length === n
    ? data.done
    : Array.from({ length: n }, () => false);

  return (
    <svg className="cal-ring-svg" viewBox="0 0 32 32">
      {radii.map((r, i) => (
        <circle
          key={'bg' + i}
          cx={c}
          cy={c}
          r={r}
          stroke={colors[i]}
          strokeWidth={sw}
          fill="none"
          opacity={0.18}
        />
      ))}
      {radii.map((r, i) =>
        flags[i] ? (
          <circle
            key={'fg' + i}
            cx={c}
            cy={c}
            r={r}
            stroke={colors[i]}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
          />
        ) : null,
      )}
    </svg>
  );
}
