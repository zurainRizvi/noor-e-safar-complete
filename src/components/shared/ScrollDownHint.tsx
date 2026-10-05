'use client';

import React from 'react';
import type { Locale } from '@/config/translations';

type Props = {
  locale: Locale;
  /** Accent color for label + chevron. */
  color?: string;
  /** Soft glow behind the chevron. */
  glow?: string;
  /** Extra class (e.g. opening-stage dark treatment). */
  className?: string;
  style?: React.CSSProperties;
};

/** Scroll the invitation one snap-page down. */
export function scrollInvitationDown(from?: HTMLElement | null) {
  const main = document.querySelector('main');
  if (!main) return;

  const pages = Array.from(main.querySelectorAll<HTMLElement>('.page-snap'));
  const current = from?.closest('.page-snap') as HTMLElement | null;
  const idx = current ? pages.indexOf(current) : -1;
  const next = idx >= 0 ? pages[idx + 1] : null;

  if (next) {
    next.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  main.scrollBy({ top: main.clientHeight, behavior: 'smooth' });
}

/** Themed, clickable "swipe / scroll down" cue for each snap page. */
export function ScrollDownHint({
  locale,
  color = 'rgba(255, 248, 232, 0.95)',
  glow = 'rgba(224, 192, 117, 0.85)',
  className = '',
  style,
}: Props) {
  const isRtl = locale === 'ur';
  const rootRef = React.useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={rootRef}
      type="button"
      className={`scroll-hint ${className}`.trim()}
      aria-label={isRtl ? 'نیچے سکرول کریں' : 'Scroll down'}
      onClick={() => scrollInvitationDown(rootRef.current)}
      style={
        {
          '--scroll-hint-color': color,
          '--scroll-hint-glow': glow,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 'max(14px, calc(env(safe-area-inset-bottom, 0px) + 8px))',
          zIndex: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          margin: 0,
          padding: '10px 16px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          ...style,
        } as React.CSSProperties
      }
    >
      <span className="scroll-hint-label">
        {isRtl ? 'نیچے سکرول کریں' : 'SCROLL DOWN'}
      </span>
      <span className="scroll-hint-chevron" aria-hidden />
    </button>
  );
}
