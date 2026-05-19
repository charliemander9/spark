'use client';

/**
 * Unified preview element. Handles three shapes:
 *   - linear-gradient(...) → renders a gradient background div
 *   - url("blob:...") for an image → renders an <img>
 *   - url("blob:...") for a video → renders a <video> element
 *
 * Renders as absolute fill inside its positioned parent. The parent must be
 * `position: relative` with set dimensions (or aspect-ratio).
 */
export function Media({
  bg,
  isVideo,
  alt,
}: {
  bg?: string;
  isVideo?: boolean;
  alt?: string;
}) {
  if (!bg) return null;

  // Gradient — paint via background CSS
  if (!bg.startsWith('url(')) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: bg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    );
  }

  // url("...") — extract the inner URL
  const m = bg.match(/url\("?([^"]+)"?\)/);
  const url = m ? m[1] : null;
  if (!url) return null;

  if (isVideo) {
    return (
      <video
        src={url}
        muted
        playsInline
        preload="metadata"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          background: 'black',
        }}
      />
    );
  }

  return (
    <img
      src={url}
      alt={alt || ''}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        background: 'var(--surface-2)',
      }}
    />
  );
}
