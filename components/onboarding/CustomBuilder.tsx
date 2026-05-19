'use client';

import { useSpark } from '@/lib/store';
import { CATEGORIES } from '@/lib/data';
import { defaultConfigFor } from '@/lib/helpers';
import type { CategoryId } from '@/lib/types';

/**
 * Inline variable-slot builder shown inside the "Build my own" preset card.
 * Users can add/remove slots (1–6). App recommends 3.
 */
export function CustomBuilder() {
  const customDraft = useSpark((s) => s.customDraft);
  const addCustomSlot = useSpark((s) => s.addCustomSlot);
  const removeCustomSlot = useSpark((s) => s.removeCustomSlot);
  const canAdd = customDraft.length < 6;
  const canRemove = customDraft.length > 1;

  return (
    <div className="custom-builder" onClick={(e) => e.stopPropagation()}>
      <div className="cb-count-row">
        <button
          className="cb-count-btn"
          disabled={!canRemove}
          onClick={(e) => {
            e.stopPropagation();
            if (canRemove) removeCustomSlot(customDraft.length - 1);
          }}
        >
          −
        </button>
        <div className="cb-count-label">
          <b>{customDraft.length}</b>{' '}
          {customDraft.length === 1 ? 'check-in' : 'check-ins'}
          {customDraft.length === 3 && (
            <span className="cb-rec">recommended</span>
          )}
        </div>
        <button
          className="cb-count-btn"
          disabled={!canAdd}
          onClick={(e) => {
            e.stopPropagation();
            if (canAdd) addCustomSlot();
          }}
        >
          +
        </button>
      </div>

      {customDraft.map((_, i) => (
        <Slot key={i} index={i} canRemove={customDraft.length > 1} />
      ))}
    </div>
  );
}

function Slot({ index, canRemove }: { index: number; canRemove: boolean }) {
  const draft = useSpark((s) => s.customDraft[index]);
  const setCustomDraft = useSpark((s) => s.setCustomDraft);
  const customDraft = useSpark((s) => s.customDraft);
  const removeCustomSlot = useSpark((s) => s.removeCustomSlot);

  if (!draft) return null;

  const onCategoryChange = (newId: CategoryId) => {
    const next = [...customDraft];
    next[index] = { categoryId: newId, config: defaultConfigFor(newId) };
    setCustomDraft(next);
  };

  return (
    <div className="custom-slot">
      <div className="custom-slot-head">
        <div className="custom-slot-label">Slot {index + 1}</div>
        {canRemove && (
          <button
            className="custom-slot-remove"
            onClick={(e) => {
              e.stopPropagation();
              removeCustomSlot(index);
            }}
            aria-label="Remove this check-in"
          >
            ×
          </button>
        )}
      </div>
      <select
        className="custom-slot-select"
        value={draft.categoryId}
        onChange={(e) => onCategoryChange(e.target.value as CategoryId)}
      >
        {Object.values(CATEGORIES).map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <SlotConfig index={index} />
    </div>
  );
}

function SlotConfig({ index }: { index: number }) {
  const draft = useSpark((s) => s.customDraft[index]);
  const patchCustomSlot = useSpark((s) => s.patchCustomSlot);
  if (!draft) return null;
  const cat = CATEGORIES[draft.categoryId];

  if (cat.type === 'workout') {
    return (
      <div className="slot-config">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={!!draft.config.mustBeOutdoors}
            onChange={(e) =>
              patchCustomSlot(index, {
                config: { mustBeOutdoors: e.target.checked },
              })
            }
          />
          <span> Must be outdoors</span>
        </label>
      </div>
    );
  }

  if (cat.type === 'numeric') {
    const val = draft.config.goal ?? cat.defaultGoal ?? 0;
    return (
      <div className="slot-config">
        <div className="slider-row">
          <div className="slider-value">
            Goal · <strong>{cat.fmt?.(val) ?? val}</strong>
          </div>
          <input
            type="range"
            min={cat.range?.[0] ?? 0}
            max={cat.range?.[1] ?? 100}
            step={cat.step ?? 1}
            value={val}
            onChange={(e) =>
              patchCustomSlot(index, {
                config: { goal: parseFloat(e.target.value) },
              })
            }
          />
        </div>
      </div>
    );
  }

  if (cat.type === 'custom') {
    const cfg = draft.config;
    return (
      <div className="slot-config custom-config">
        <input
          type="text"
          className="custom-name-input"
          placeholder="Name (e.g. Cold plunge, Push-ups, Journaling)"
          value={cfg.label ?? ''}
          onChange={(e) =>
            patchCustomSlot(index, { config: { label: e.target.value } })
          }
        />
        <label className="toggle-label" style={{ marginTop: 10 }}>
          <input
            type="checkbox"
            checked={!!cfg.quantified}
            onChange={(e) =>
              patchCustomSlot(index, {
                config: { quantified: e.target.checked },
              })
            }
          />
          <span> Track a number</span>
        </label>
        {cfg.quantified ? (
          <div className="custom-goal-row">
            <input
              type="number"
              className="custom-goal-input"
              placeholder="Goal"
              value={cfg.goal ?? 10}
              onChange={(e) =>
                patchCustomSlot(index, {
                  config: { goal: parseFloat(e.target.value) || 0 },
                })
              }
            />
            <input
              type="text"
              className="custom-unit-input"
              placeholder="unit (min, oz, reps)"
              value={cfg.unit ?? ''}
              onChange={(e) =>
                patchCustomSlot(index, { config: { unit: e.target.value } })
              }
            />
          </div>
        ) : (
          <div
            style={{
              marginTop: 8,
              fontSize: 12.5,
              color: 'var(--muted)',
              fontStyle: 'italic',
              fontFamily: "'Fraunces',serif",
            }}
          >
            Daily yes / no — just mark done.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="slot-config muted">{cat.desc || 'Daily yes/no'}</div>
  );
}
