'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { CATEGORIES } from '@/lib/data';
import type { SlotKey } from '@/lib/types';

interface Props { slot: SlotKey }

export function CourseCard({ slot }: Props) {
  const c = useSpark((s) => s.menu[slot]);
  const dailyEntry = useSpark((s) => s.user.dailyEntry);
  const toggleBinary = useSpark((s) => s.toggleBinary);
  const toggleSlotComplete = useSpark((s) => s.toggleSlotComplete);
  const setNumericSheetKey = useSpark((s) => s.setNumericSheetKey);
  const setWorkoutSheetCourse = useSpark((s) => s.setWorkoutSheetCourse);
  const openWorkoutSheet = useUi((s) => s.openWorkoutSheet);
  const openNumericSheet = useUi((s) => s.openNumericSheet);

  const [detailPromptOpen, setDetailPromptOpen] = useState(false);

  if (!c) return null;
  const cat = CATEGORIES[c.category];
  const done = c.completed;
  const ringColor = cat?.ringColor || 'var(--terracotta)';

  const gate = (fn: () => void) => () => {
    if (!dailyEntry) {
      // simple toast — defer to console for now
      alert("Capture today's entry first");
      return;
    }
    fn();
  };

  // Slots that carry extra info worth capturing after a quick check.
  const hasDetails =
    cat.type === 'workout' ||
    cat.type === 'numeric' ||
    (cat.type === 'custom' && !!c.config.quantified);

  const openDetails = () => {
    if (cat.type === 'workout') {
      setWorkoutSheetCourse(slot);
      openWorkoutSheet();
    } else {
      setNumericSheetKey(slot);
      openNumericSheet();
    }
  };

  // The checkbox is the easy path: one tap marks it done. If the slot has
  // details, ticking it also offers (optionally) to add them.
  const onCheck = gate(() => {
    const wasDone = done;
    toggleSlotComplete(slot);
    if (!wasDone && hasDetails) setDetailPromptOpen(true);
  });

  return (
    <div className={'course' + (done ? ' done' : '')}>
      <div className="course-head">
        <div className="lead">
          <button
            className={'slot-check' + (done ? ' checked' : '')}
            onClick={onCheck}
            aria-label={done ? 'Mark not done' : 'Mark done'}
            aria-pressed={done}
            style={done ? { background: ringColor, borderColor: ringColor } : undefined}
          >
            {done && (
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#fff" strokeWidth={3}>
                <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span
            className="dot ring-dot"
            style={{ background: ringColor }}
          />
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
              className={'mark-btn' + (done ? ' completed' : '')}
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

      {detailPromptOpen && (
        <div className="modal-bd open" onClick={() => setDetailPromptOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 6 }}>✓</div>
            <h3><em>Logged.</em></h3>
            <p>Want to add details for <b>{c.label}</b>? Totally optional.</p>
            <div className="row">
              <button
                className="btn btn-secondary"
                onClick={() => setDetailPromptOpen(false)}
              >
                Not now
              </button>
              <button
                className="btn btn-accent"
                onClick={() => {
                  setDetailPromptOpen(false);
                  openDetails();
                }}
              >
                Add details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NumericBody({ slot, onLog }: { slot: SlotKey; onLog: () => void }) {
  const c = useSpark((s) => s.menu[slot]);
  if (!c) return null;
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
  if (!c) return null;
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
