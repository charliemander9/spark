'use client';

import { useSpark } from '@/lib/store';
import { PRESETS, CATEGORIES } from '@/lib/data';

export function ChallengePicker() {
  const setScreen = useSpark((s) => s.setScreen);
  const applyPreset = useSpark((s) => s.applyPreset);
  const applyCustomDraft = useSpark((s) => s.applyCustomDraft);
  const setUser = useSpark((s) => s.setUser);
  const preset = useSpark((s) => s.user.preset);

  return (
    <div className="onb-q">
      <h1>
        Choose your <em>75</em>
      </h1>
      <p className="lede">
        Five starting points. Pick one — you can tweak it before you commit, or
        change anytime in Settings.
      </p>

      {Object.entries(PRESETS).map(([id, p]) => {
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
            ) : (
              <div className="preset-checks">
                <div className="preset-check-item muted">
                  {selected ? 'Build it on the next push — coming soon.' : 'Tap to choose three categories'}
                </div>
              </div>
            )}
          </button>
        );
      })}

      <div style={{ flex: 1, minHeight: 12 }} />
      <div className="onb-stick">
        <button
          className="btn btn-accent btn-lg btn-block"
          onClick={() => {
            if (preset === 'custom') applyCustomDraft();
            setScreen('onb-privacy');
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
