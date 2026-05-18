'use client';

import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { CATEGORIES } from '@/lib/data';
import type { SlotKey } from '@/lib/types';

interface Props { slot: SlotKey }

export function CourseCard({ slot }: Props) {
  const c = useSpark((s) => s.menu[slot]);
  const dailyEntry = useSpark((s) => s.user.dailyEntry);
  const toggleBinary = useSpark((s) => s.toggleBinary);
  const setNumericSheetKey = useSpark((s) => s.setNumericSheetKey);
  const setWorkoutSheetCourse = useSpark((s) => s.setWorkoutSheetCourse);
  const openWorkoutSheet = useUi((s) => s.openWorkoutSheet);
  const openNumericSheet = useUi((s) => s.openNumericSheet);

  const cat = CATEGORIES[c.category];
  const done = c.completed;
  const ringClass =
    slot === 'appetizer' ? 'ring-w1' : slot === 'main' ? 'ring-w2' : 'ring-steps';

  const gate = (fn: () => void) => () => {
    if (!dailyEntry) {
      // simple toast — defer to console for now
      alert("Capture today's entry first");
      return;
    }
    fn();
  };

  return (
    <div className={'course' + (done ? ' done' : '')}>
      <div className="course-head">
        <div className={'lead ' + slot}>
          <span className={'dot ring-dot ' + ringClass} />
          {c.label}
        </div>
        <div className={'course-status' + (done ? ' done' : '')}>
          {done ? 'Logged' : 'Pending'}
        </div>
      </div>

      {cat.type === 'workout' && (
        <>
          {c.details ? (
            <div className="workout-details">
              <strong>{c.details.type}</strong>
              <div className="workout-meta">
                {c.details.duration} min · {c.details.place}
                {c.details.source && (
                  <span className="workout-source"> · via {c.details.source}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="course-title empty">
              {c.config.mustBeOutdoors ? 'Must be outside' : 'Indoor or outdoor'} ·{' '}
              {c.config.minDuration ?? 45} min
            </div>
          )}
          <div className="course-actions">
            <button
              className={'mark-btn' + (done ? ' completed' : '') + (slot === 'main' ? ' terracotta' : '')}
              onClick={gate(() => {
                setWorkoutSheetCourse(slot);
                openWorkoutSheet();
              })}
            >
              {done ? '✓ Logged · Edit' : 'Log Workout'}
            </button>
          </div>
        </>
      )}

      {cat.type === 'numeric' && (
        <NumericBody slot={slot} onLog={gate(() => {
          setNumericSheetKey(slot);
          openNumericSheet();
        })} />
      )}

      {cat.type === 'binary' && (
        <>
          <div className="course-title empty">{cat.desc ?? ''}</div>
          <div className="course-actions">
            <button
              className={'mark-btn' + (done ? ' completed' : '')}
              onClick={gate(() => toggleBinary(slot))}
            >
              {done ? '✓ Done for today' : 'Mark Done'}
            </button>
          </div>
        </>
      )}

      {cat.type === 'custom' && (
        <CustomBody slot={slot} onLog={gate(() => {
          setNumericSheetKey(slot);
          openNumericSheet();
        })} onToggle={gate(() => toggleBinary(slot))} />
      )}
    </div>
  );
}

function NumericBody({ slot, onLog }: { slot: SlotKey; onLog: () => void }) {
  const c = useSpark((s) => s.menu[slot]);
  const cat = CATEGORIES[c.category];
  const value = c.value || 0;
  const goal = c.config.goal ?? cat.defaultGoal ?? 0;
  const pct = Math.min(100, (value / goal) * 100);

  return (
    <>
      <div className="steps-meter">
        <div className="steps-meter-row">
          <span className="steps-current">
            {cat.fmt?.(value) ?? value} / {cat.fmt?.(goal) ?? goal}
          </span>
          <span className="steps-pct">{Math.round(pct)}%</span>
        </div>
        <div className="steps-bar">
          <div className="steps-fill" style={{ width: pct + '%' }} />
        </div>
        {c.source && <div className="steps-source">↻ Syncing from {c.source}</div>}
      </div>
      <div className="course-actions">
        <button
          className={'mark-btn' + (c.completed ? ' completed' : '')}
          onClick={onLog}
        >
          {c.completed ? '✓ Logged · Edit' : 'Log ' + cat.label}
        </button>
      </div>
    </>
  );
}

function CustomBody({ slot, onLog, onToggle }: { slot: SlotKey; onLog: () => void; onToggle: () => void }) {
  const c = useSpark((s) => s.menu[slot]);
  if (c.config.quantified) {
    const value = c.value || 0;
    const goal = c.config.goal ?? 10;
    const pct = Math.min(100, (value / goal) * 100);
    return (
      <>
        <div className="steps-meter">
          <div className="steps-meter-row">
            <span className="steps-current">
              {value} / {goal} {c.config.unit ?? ''}
            </span>
            <span className="steps-pct">{Math.round(pct)}%</span>
          </div>
          <div className="steps-bar">
            <div className="steps-fill" style={{ width: pct + '%' }} />
          </div>
        </div>
        <div className="course-actions">
          <button
            className={'mark-btn' + (c.completed ? ' completed' : '')}
            onClick={onLog}
          >
            {c.completed ? '✓ Logged · Edit' : 'Log ' + (c.config.label ?? 'Check-in')}
          </button>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="course-title empty">{c.config.label ?? 'Custom check-in'}</div>
      <div className="course-actions">
        <button
          className={'mark-btn' + (c.completed ? ' completed' : '')}
          onClick={onToggle}
        >
          {c.completed ? '✓ Done for today' : 'Mark Done'}
        </button>
      </div>
    </>
  );
}
