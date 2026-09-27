'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { theme } from '@/config/theme';
import { Ornament, Card } from '@/components/shared/Ornament';
import { Petals } from '@/components/shared/Petals';
import type { Locale } from '@/config/translations';

const pink = {
  main: theme.colors.blush,
  soft: theme.colors.blushSoft,
  deep: theme.colors.blushDeep,
  line: theme.colors.blushLine,
};

// Matches the dove illustration backdrop so the crop has no visible edge.
const backdrop = '#E4E5E0';

export default function ScratchReveal({ locale }: { locale: Locale }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const isDrawing = useRef(false);
  const hasTriggered = useRef(false);
  const revealedRef = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const isRtl = locale === 'ur';

  const celebrate = useCallback(async () => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    revealedRef.current = true;
    setShowHint(false);
    setIsRevealed(true);
    try {
      const confetti = (await import('canvas-confetti')).default;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      confetti({
        particleCount: isMobile ? 70 : 120,
        spread: 78,
        origin: { y: 0.62 },
        colors: [pink.main, pink.soft, '#FFFFFF', '#F7E4E7', '#E0C075', pink.deep],
      });
      setTimeout(() => {
        confetti({
          particleCount: isMobile ? 40 : 70,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: [pink.soft, '#FFF8EE', '#E2B6B6'],
        });
        confetti({
          particleCount: isMobile ? 40 : 70,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: [pink.main, '#FFFFFF', pink.deep],
        });
      }, 180);
    } catch {
      // ignore
    }
  }, []);

  const paintFoil = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    if (width < 2 || height < 2) return;
    canvas.width = width;
    canvas.height = height;

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#FFF5F6');
    grad.addColorStop(0.32, pink.soft);
    grad.addColorStop(0.68, pink.main);
    grad.addColorStop(1, pink.deep);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.34)';
    for (let i = 0; i < 28; i++) {
      const x = (i * 47) % width;
      const y = (i * 73) % height;
      ctx.beginPath();
      ctx.arc(x, y, 1.2 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = theme.colors.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = isRtl ? 'bold 13px Amiri, serif' : '600 11px "DM Sans", sans-serif';
    ctx.fillText(isRtl ? 'پردہ ہٹا کر تاریخ جانیے' : 'SCRATCH TO REVEAL', width / 2, height / 2 - 4);
    ctx.font = isRtl ? '12px Amiri, serif' : '500 10px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(61,52,41,0.72)';
    ctx.fillText(isRtl ? 'یا فوری طور پر ظاہر کریں' : 'or tap Instant Reveal below', width / 2, height / 2 + 16);
  }, [isRtl]);

  useEffect(() => {
    paintFoil();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === 'undefined') return;
    let lastW = canvas.offsetWidth;
    let lastH = canvas.offsetHeight;
    const observer = new ResizeObserver(() => {
      const nextW = canvas.offsetWidth;
      const nextH = canvas.offsetHeight;
      if (Math.abs(nextW - lastW) < 2 && Math.abs(nextH - lastH) < 2) return;
      lastW = nextW;
      lastH = nextH;
      paintFoil();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [paintFoil]);

  const scratchAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(36, Math.min(canvas.width, canvas.height) * 0.2);
    const prev = lastPoint.current;
    ctx.beginPath();
    if (prev) {
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPoint.current = { x, y };

    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      const sampled = data.length / 16;
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] < 128) clear++;
      }
      if (sampled > 0 && (clear / sampled) * 100 > 28) celebrate();
    } catch {
      // ignore
    }
  }, [celebrate]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || isRevealed) return;

    let pausedHere = false;
    const pauseScroll = (paused: boolean) => {
      const main = document.querySelector('main');
      if (!main) return;
      if (paused) {
        pausedHere = !main.classList.contains('snap-paused');
        main.classList.add('snap-paused');
        return;
      }
      if (pausedHere) main.classList.remove('snap-paused');
      pausedHere = false;
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.cancelable) event.preventDefault();
      isDrawing.current = true;
      lastPoint.current = null;
      setShowHint(false);
      pauseScroll(true);
      const touch = event.changedTouches[0];
      if (touch) scratchAt(touch.clientX, touch.clientY);
    };
    const onTouchMove = (event: TouchEvent) => {
      if (!isDrawing.current) return;
      if (event.cancelable) event.preventDefault();
      const touch = event.changedTouches[0];
      if (touch) scratchAt(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => {
      isDrawing.current = false;
      lastPoint.current = null;
      pauseScroll(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      event.preventDefault();
      isDrawing.current = true;
      lastPoint.current = null;
      setShowHint(false);
      scratchAt(event.clientX, event.clientY);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !isDrawing.current) return;
      scratchAt(event.clientX, event.clientY);
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      isDrawing.current = false;
      lastPoint.current = null;
    };

    surface.addEventListener('touchstart', onTouchStart, { passive: false });
    surface.addEventListener('touchmove', onTouchMove, { passive: false });
    surface.addEventListener('touchend', onTouchEnd);
    surface.addEventListener('touchcancel', onTouchEnd);
    surface.addEventListener('pointerdown', onPointerDown);
    surface.addEventListener('pointermove', onPointerMove);
    surface.addEventListener('pointerup', onPointerUp);
    surface.addEventListener('pointercancel', onPointerUp);

    return () => {
      pauseScroll(false);
      surface.removeEventListener('touchstart', onTouchStart);
      surface.removeEventListener('touchmove', onTouchMove);
      surface.removeEventListener('touchend', onTouchEnd);
      surface.removeEventListener('touchcancel', onTouchEnd);
      surface.removeEventListener('pointerdown', onPointerDown);
      surface.removeEventListener('pointermove', onPointerMove);
      surface.removeEventListener('pointerup', onPointerUp);
      surface.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isRevealed, scratchAt]);

  return (
    <Card
      className="reveal-date-card"
      style={{
        backgroundColor: backdrop,
        backgroundImage: 'url(/images/scratch-reveal-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        borderTop: `1px solid ${pink.line}`,
        borderBottom: `1px solid ${pink.line}`,
        color: theme.colors.ink,
        textAlign: 'center',
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'flex-start',
      }}
    >
      <Petals tone="blush-mix" amount={20} />

      <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="scratch-heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.935 C0.5,0.935 0.06,0.62 0.06,0.34 C0.06,0.175 0.185,0.06 0.325,0.06 C0.41,0.06 0.47,0.115 0.5,0.19 C0.53,0.115 0.59,0.06 0.675,0.06 C0.815,0.06 0.94,0.175 0.94,0.34 C0.94,0.62 0.5,0.935 0.5,0.935 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Title sits in the open center under the floral arch — same approach as Counting Days. */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: isRtl ? 'clamp(72px, 13vh, 112px) 22px max(18px, 3vh)' : 'clamp(76px, 12.5vh, 116px) 26px max(18px, 3vh)',
        }}
      >
        <p
          className="eyebrow"
          style={{
            color: pink.main,
            letterSpacing: isRtl ? '0.1em' : '0.28em',
            marginBottom: 8,
          }}
        >
          {isRtl ? 'محبت و مسرت کا خاص دن' : 'SAVE THE AUSPICIOUS DATE'}
        </p>
        <h2
          style={{
            color: theme.colors.ink,
            margin: '4px 0 8px',
            fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
            lineHeight: isRtl ? 1.65 : 1.12,
            fontSize: isRtl ? 'clamp(22px, 6vw, 28px)' : 'clamp(24px, 6.5vw, 30px)',
            textAlign: 'center',
          }}
        >
          {isRtl ? (
            <>
              تاریخ کی نقاب کشائی
              <em style={{ color: pink.main, display: 'block', fontStyle: 'normal', fontSize: '0.78em', marginTop: 6 }}>
                ہماری شادی کا متبرک دن
              </em>
            </>
          ) : (
            <>
              Scratch to Reveal
              <em style={{ color: pink.main, display: 'block', fontStyle: 'italic', fontSize: '0.76em', marginTop: 4 }}>
                Our Wedding Date
              </em>
            </>
          )}
        </h2>
        <Ornament color={pink.main} />

        {/* Doves and rings only — crop excludes the surrounding flowers. */}
        <div
          aria-hidden
          style={{
            width: 'min(190px, 50vw)',
            aspectRatio: '340 / 200',
            margin: '0 auto 4px',
            flexShrink: 0,
            backgroundColor: 'transparent',
            backgroundImage: 'url(/images/floral-frame.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '282.35% auto',
            backgroundPosition: '50% 95.92%',
          }}
        />

        {/* Push heart + CTA into the lower-middle without pinning them to the bottom. */}
        <div style={{ flex: '1 1 auto', minHeight: 18, maxHeight: 72, width: '100%' }} aria-hidden />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flexShrink: 0,
            marginBottom: 'clamp(12px, 3vh, 28px)',
            width: '100%',
          }}
        >
          {/* Pink heart foil. Touches land on this box, not the clipped canvas —
              Android WebViews drop pointer events on clip-path / animated filters. */}
          <div
            ref={surfaceRef}
            className="scratch-surface"
            style={{
              position: 'relative',
              width: 'min(210px, 56vw)',
              height: 'min(200px, 54vw)',
              margin: '0 auto 10px',
              flexShrink: 0,
              zIndex: 3,
              touchAction: 'none',
            }}
          >
            <div
              className={`scratch-heart-visual${showHint ? ' scratch-heart-live' : ''}`}
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: 'url(#scratch-heart-clip)',
                WebkitClipPath: 'url(#scratch-heart-clip)',
                overflow: 'hidden',
                pointerEvents: 'none',
                userSelect: 'none',
                // Revealed (scratched) face — near-white blush so foil contrast is obvious
                background: 'linear-gradient(165deg, #FFFEFE 0%, #FFF8F9 48%, #F7EBEE 100%)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '36px 22px 28px',
                  gap: 2,
                  pointerEvents: 'none',
                }}
              >
                <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.24em', color: pink.main, fontWeight: 600 }}>
                  {isRtl ? 'منگل' : 'TUESDAY'}
                </p>
                <div style={{ textAlign: 'center', marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 5, color: theme.colors.ink }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 46, lineHeight: 1 }}>12</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>·</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, letterSpacing: '0.08em' }}>JAN</span>
                  </div>
                  <p style={{ margin: '4px 0 0', color: theme.colors.inkSoft, letterSpacing: '0.18em', fontSize: 11 }}>2027</p>
                </div>
                <p style={{ margin: '6px 0 0', color: theme.colors.muted, fontSize: 10, letterSpacing: '0.14em' }}>
                  {isRtl ? 'لاہور' : 'LAHORE'}
                </p>
              </div>

              {!isRevealed && (
                <canvas
                  ref={canvasRef}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {showHint && !isRevealed && (
                <>
                  <div className="foil-shimmer" />
                <div className={`scratch-hint${isRtl ? ' is-rtl' : ''}`} aria-hidden>
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    {/* Gold wand — reads clearly on pink foil */}
                    <circle cx="14" cy="14" r="3.4" fill="#FFF8EE" stroke="#C6A15B" strokeWidth="1.35" />
                    <path d="M16.4 16.4 L48.6 48.6" stroke="#8A6A2E" strokeWidth="3.4" strokeLinecap="round" />
                    <path d="M16.4 16.4 L48.6 48.6" stroke="#E0C075" strokeWidth="1.55" strokeLinecap="round" />
                    <path d="M45.2 45.2 L50.4 50.4" stroke="#5C4A28" strokeWidth="3.6" strokeLinecap="round" />
                    <path d="M10.6 8.2 L14 14 L8.2 10.8" stroke="#FFF2CE" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M19 9 L14 14 L19.6 12.6" stroke="#E0C075" strokeWidth="1.15" strokeLinecap="round" />
                    <circle cx="14" cy="14" r="1.25" fill="#C6A15B" />
                  </svg>
                </div>
                </>
              )}
            </div>
          </div>

          {!isRevealed && (
            <button
              type="button"
              onClick={() => celebrate()}
              style={{
                marginTop: 2,
                padding: '11px 20px',
                borderRadius: 999,
                border: `1px solid ${pink.line}`,
                background: 'rgba(255, 245, 246, 0.92)',
                color: theme.colors.ink,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                cursor: 'pointer',
                minHeight: 42,
                flexShrink: 0,
                position: 'relative',
                zIndex: 4,
                touchAction: 'manipulation',
              }}
            >
              {isRtl ? '✨ فوری طور پر ظاہر کریں' : '✨ Tap to reveal instantly'}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
