'use client';

import { useState } from 'react';
import { useSpark } from '@/lib/store';
import { useUi } from '@/lib/storeActions';
import { gearSvg } from '@/lib/helpers';
import { DEMO_DISCOVER, DISCOVER_FILTERS } from '@/lib/data';
import { Media } from '../Media';

export function Discover() {
  const openSettings = useUi((s) => s.openSettings);
  const openViewer = useUi((s) => s.openViewer);
  const demoMode = useSpark((s) => s.demoMode);
  const [filter, setFilter] = useState<string>('For you');
  const [query, setQuery] = useState('');

  const allPosts = demoMode ? DEMO_DISCOVER : [];
  const filteredByTag =
    filter === 'For you' ? allPosts : allPosts.filter((p) => p.tag === filter);
  const posts = query
    ? filteredByTag.filter(
        (p) =>
          p.caption.toLowerCase().includes(query.toLowerCase()) ||
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.tag.toLowerCase().includes(query.toLowerCase()),
      )
    : filteredByTag;

  return (
    <>
      <div className="appbar">
        <div></div>
        <div className="right">
          <button
            className="iconbtn"
            onClick={openSettings}
            dangerouslySetInnerHTML={{ __html: gearSvg() }}
          />
        </div>
      </div>

      <div className="discover-search">
        <svg
          viewBox="0 0 24 24"
          width={16}
          height={16}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <circle cx={11} cy={11} r={7} />
          <line x1={16.5} y1={16.5} x2={21} y2={21} strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search people, captions, tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button className="ds-clear" onClick={() => setQuery('')}>×</button>
        )}
      </div>

      <div className="discover-filters">
        {DISCOVER_FILTERS.map((f) => (
          <button
            key={f}
            className={'df-chip' + (f === filter ? ' active' : '')}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="empty-tab">
          <div className="icon">🌊</div>
          <h3>{demoMode ? 'No posts for that filter' : 'Nothing yet'}</h3>
          <p>
            {demoMode
              ? 'Try another filter or clear the search.'
              : 'Real stories from people on the same path will show up here. Use Load demo from Settings to preview.'}
          </p>
        </div>
      ) : (
        <div className="explore-grid">
          {posts.map((p, i) => (
            <div
              key={p.id}
              className={'explore-tile' + (i % 7 === 1 ? ' tall' : '')}
              onClick={() =>
                openViewer({
                  authorName: p.name,
                  authorInitials: p.initials,
                  when: p.tag,
                  bg: p.bg,
                  isVideo: p.isVideo,
                  body: p.caption,
                  day: p.day,
                  streak: p.streak,
                })
              }
            >
              <Media bg={p.bg} isVideo={p.isVideo} />
              {p.isVideo && (
                <div className="et-play">
                  <svg viewBox="0 0 24 24" width={14} height={14} fill="white">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </div>
              )}
              <div className="et-tag">{p.tag}</div>
              <div className="et-bottom">
                <div className="et-ava">{p.initials}</div>
                <div className="et-meta">
                  <div className="et-name">{p.name}</div>
                  <div className="et-streak">🔥 {p.streak}d</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ height: 20 }} />
    </>
  );
}
