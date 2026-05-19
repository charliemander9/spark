'use client';

import { useUi } from '@/lib/storeActions';
import { Media } from './Media';

/**
 * Fullscreen Instagram-style viewer that pops over the app when the user taps
 * an entry tile in Profile / Friends / Discover. Tap outside or the × to close.
 */
export function EntryViewer() {
  const entry = useUi((s) => s.viewerEntry);
  const close = useUi((s) => s.closeViewer);

  if (!entry) return null;

  return (
    <div className="ev-bd" onClick={close}>
      <button
        className="ev-close"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        aria-label="Close"
      >
        ×
      </button>

      <div className="ev-card" onClick={(e) => e.stopPropagation()}>
        <header className="ev-head">
          <div className="ev-ava">{entry.authorInitials}</div>
          <div className="ev-id">
            <div className="ev-name">{entry.authorName}</div>
            <div className="ev-sub">
              {entry.day ? `Day ${entry.day} · ` : ''}
              {entry.streak ? `🔥 ${entry.streak}d · ` : ''}
              {entry.when}
            </div>
          </div>
        </header>

        {entry.isJournal ? (
          <div className="ev-journal">
            <div className="ev-quote">&ldquo;</div>
            <p>{entry.body}</p>
          </div>
        ) : (
          <div className="ev-media">
            <Media bg={entry.bg} isVideo={entry.isVideo} />
            {entry.isVideo && (
              <div className="ev-play-overlay">
                <svg viewBox="0 0 24 24" width={48} height={48} fill="white">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </div>
            )}
          </div>
        )}

        {!entry.isJournal && entry.body && (
          <div className="ev-caption">
            <b>{entry.authorName.toLowerCase()}</b> {entry.body}
          </div>
        )}
      </div>
    </div>
  );
}
