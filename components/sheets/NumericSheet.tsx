'use client';

import { useEffect, useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { CATEGORIES } from '@/lib/data';

export function NumericSheet() {
  const open = useUi((s) => s.numericSheetOpen);
  const close = useUi((s) => s.closeNumericSheet);
  const slot = useSpark((s) => s.numericSheetKey);
  const menu = useSpark((s) => s.menu);
  const setCheckInValue = useSpark((s) => s.setCheckInValue);

  const [val, setVal] = useState('');
  useEffect(() => {
    if (slot !== null) setVal(menu[slot]?.value ? String(menu[slot].value) : '');
  }, [slot, menu]);

  if (!open || slot === null || !menu[slot]) return null;
  const c = menu[slot];
  const cat = CATEGORIES[c.category];
  const isCustom = c.category === 'custom';
  const goal = c.config.goal ?? cat.defaultGoal ?? 10;
  const catLabel = isCustom ? (c.config.label ?? 'Custom') : cat.label;
  const showSync = !isCustom && !!cat.supportsSync;

  const apply = (v: number, source: string) => {
    setCheckInValue(slot, v, source);
    close();
  };

  const SYNC_PRESETS: Record<string, Record<string, number>> = {
    steps: { 'Apple Watch': 10243, 'Fitbit': 11587, 'Strava': 9856 },
    water: { 'Apple Watch': 72, 'Fitbit': 80, 'Strava': 64 },
  };

  return (
    <>
      <div className="sheet-bd open" onClick={close} />
      <div className="sheet open">
        <div className="sheet-handle" />
        <h2><em>Log {catLabel}</em></h2>
        <p style={{ padding: '0 22px 4px', fontFamily: "'Fraunces',serif", fontStyle: 'italic', fontSize: 13.5, color: 'var(--ink-3)' }}>
          {isCustom ? `${goal} ${c.config.unit ?? ''} is the goal.` : `${cat.fmt?.(goal) ?? goal} is the goal.`}
        </p>

        {showSync && (
          <>
            <div className="form-divider"><span>sync from</span></div>
            <div className="import-row">
              {['Apple Watch','Fitbit','Strava'].map(dev => (
                <button
                  key={dev}
                  className="import-btn"
                  onClick={() => apply(SYNC_PRESETS[c.category]?.[dev] ?? cat.defaultGoal ?? 0, dev)}
                >
                  <span className="ico">{dev === 'Apple Watch' ? '⌚' : dev === 'Fitbit' ? '◐' : '⚡'}</span>
                  <span>{dev}</span>
                </button>
              ))}
            </div>
            <div className="form-divider"><span>or manually</span></div>
          </>
        )}

        <div className="form-section">
          <label>{catLabel} today</label>
          <input
            type="number"
            min={0}
            step="any"
            placeholder={String(goal)}
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
        </div>

        <div className="sheet-actions">
          <button className="btn btn-secondary" onClick={close}>Cancel</button>
          <button
            className="btn btn-accent"
            onClick={() => {
              const v = parseFloat(val);
              if (isNaN(v) || v < 0) { alert('Enter a number'); return; }
              apply(v, 'Manual entry');
            }}
          >
            Log
          </button>
        </div>
        <div style={{ height: 30 }} />
      </div>
    </>
  );
}
