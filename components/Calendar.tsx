'use client';

import { useSpark } from '@/lib/store';
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
  const todayData: CalendarDay = {
    w1: menu.appetizer.completed,
    w2: menu.main.completed,
    steps: menu.treat.completed,
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
              <RingSvg data={data} />
              <div className="cal-day-num">{d}</div>
            </div>
          );
        })}
      </div>
      <div className="cal-legend">
        <div>
          <span className="swatch" style={{ color: '#FF4D7A' }} /> Workout
        </div>
        <div>
          <span className="swatch" style={{ color: '#A8E060' }} /> Outside
        </div>
        <div>
          <span className="swatch" style={{ color: '#5BE0F0' }} /> 10K Steps
        </div>
      </div>
    </div>
  );
}

function RingSvg({ data }: { data: CalendarDay | undefined }) {
  const sw = 2.2;
  const c = 16;
  const radii = [11, 7.5, 4];
  const colors = ['#FF4D7A', '#A8E060', '#5BE0F0'];
  const flags = data ? [data.w1, data.w2, data.steps] : [false, false, false];

  return (
    <svg className="cal-ring-svg" viewBox="0 0 32 32">
      {radii.map((r, i) => (
        <circle
          key={'bg' + i}
          cx={c} cy={c} r={r}
          stroke={colors[i]} strokeWidth={sw} fill="none" opacity={0.18}
        />
      ))}
      {radii.map((r, i) => flags[i] ? (
        <circle
          key={'fg' + i}
          cx={c} cy={c} r={r}
          stroke={colors[i]} strokeWidth={sw} fill="none" strokeLinecap="round"
        />
      ) : null)}
    </svg>
  );
}
