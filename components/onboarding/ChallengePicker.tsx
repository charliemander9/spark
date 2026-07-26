'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { PRESETS, CATEGORIES, CHALLENGE_LENGTH } from '@/lib/data';
import { CustomBuilder } from './CustomBuilder';

// Shown up front — everything else is one tap away behind "See more
// programs" so a first-timer isn't handed all 8 options at once.
const SHORTLIST = ['custom', 'balance', 'all-in-lite'];

export function ChallengePicker() {
  const setScreen = useSpark((s) => s.setScreen);
  const applyPreset = useSpark((s) => s.applyPreset);
  const applyCustomDraft = useSpark((s) => s.applyCustomDraft);
  const setUser = useSpark((s) => s.setUser);
  const preset = useSpark((s) => s.user.preset);
  const editingChallenge = useUi((s) => s.editingChallenge);
  const setEditingChallenge = useUi((s) => s.setEditingChallenge);

  // Auto-expand if the current selection lives in the hidden list (e.g.
  // editing an existing challenge from Settings) so it isn't hidden away.
  const [showMore, setShowMore] = useState(!SHORTLIST.includes(preset));

  const entries = Object.entries(PRESETS);
  const visible = showMore ? entries : entries.filter(([id]) => SHORTLIST.includes(id));
  const hiddenCount = entries.length - SHORTLIST.length;

  return (
    <div className="onb-q">
      <h1>
        Choose your <em>{CHALLENGE_LENGTH}</em>
      </h1>
      <p className="lede">
        Build your own (recommended 3 check-ins — but you can do 1 to 5) or
        pick a starting point below. Change anytime in Settings.
      </p>

      {visible.map(([id, p]) => {
        const selected = preset === id;
        return (
          <button
            key={id}
            className={'preset-card' + (selected ? ' selected' : '')}
            onClick={() => {
              if (id !== 'custom') applyPreset(id);
              else setUser({ preset: 'custom' });
            }}
          >
            <div className="preset-card-head">
              <b>{p.label}</b>
              <div className="opt-check" />
            </div>
            <small>{p.desc}</small>
            {p.slots ? (
              <div className="preset-checks">
                {p.slots.map((s, i) => {
                  const cat = CATEGORIES[s.cat];
                  const meta =
                    cat.type === 'workout'
                      ? (s.config.mustBeOutdoors ? 'Outside · ' : 'Indoor or outdoor · ') +
                        (s.config.minDuration ?? 45) + ' min'
                      : cat.type === 'numeric'
                      ? (cat.fmt?.(s.config.goal ?? cat.defaultGoal ?? 0) ?? '')
                      : 'Yes / no';
                  return (
                    <div key={i} className="preset-check-item">
                      <span className="pc-dot" style={{ background: cat.ringColor }} />
                      <span className="pc-name">{s.label}</span>
                      <span className="pc-meta">{meta}</span>
                    </div>
                  );
                })}
              </div>
            ) : selected ? (
              <CustomBuilder />
            ) : (
              <div className="preset-checks">
                <div className="preset-check-item muted">Tap to choose your check-ins</div>
              </div>
            )}
          </button>
        );
      })}

      {!showMore && (
        <button
          className="btn btn-ghost btn-block"
          style={{ fontSize: 13 }}
          onClick={() => setShowMore(true)}
        >
          See more programs ({hiddenCount})
        </button>
      )}

      <div style={{ flex: 1, minHeight: 12 }} />
      <div className="onb-stick">
        <button
          className="btn btn-accent btn-lg btn-block"
          onClick={() => {
            if (preset === 'custom') applyCustomDraft();
            if (editingChallenge) {
              // Opened from Settings — go straight back to the app.
              setEditingChallenge(false);
              setScreen('app');
            } else {
              setScreen('onb-privacy');
            }
          }}
        >
          {editingChallenge ? 'Save challenge' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
