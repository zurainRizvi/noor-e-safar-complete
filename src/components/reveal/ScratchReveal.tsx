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
  const [isRevealed, setIsRevealed] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const isDrawing = useRef(false);
  const hasTriggered = useRef(false);
  const isRtl = locale === 'ur';

  const celebrate = useCallback(async () => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    setShowHint(false);
    setIsRevealed(true);
    try {
      const confetti = (await import('canvas-confetti')).default;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      confetti({
        particleCount: isMobile ? 70 : 120,
        spread: 78,
        origin: { y: 0.62 },
        colors: [pink.main, pink.soft, '#FFFFFF', '#F7E4E7', '#B7D0B0', pink.deep],
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
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth || 220;
    const height = canvas.offsetHeight || 260;
    canvas.width = width;
    canvas.height = height;

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#FFF5F6');
    grad.addColorStop(0.35, '#E8C4CB');
    grad.addColorStop(0.65, '#C9959E');
    grad.addColorStop(1, '#B07884');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.38)';
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
    ctx.font = isRtl ? 'bold 14px Amiri, serif' : '600 12px "DM Sans", sans-serif';
    ctx.fillText(isRtl ? 'پردہ ہٹا کر تاریخ جانیے' : 'SCRATCH TO REVEAL', width / 2, height / 2 - 8);
    ctx.font = isRtl ? '13px Amiri, serif' : '500 11px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(61,52,41,0.72)';
    ctx.fillText(isRtl ? 'یا فوری طور پر ظاہر کریں' : 'or tap Instant Reveal below', width / 2, height / 2 + 16);
  }, [isRevealed, isRtl]);

  useEffect(() => {
    paintFoil();
  }, [paintFoil]);

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0;
      const sampled = data.length / 16;
      for (let i = 3; i < data.length; i += 16) {
        if (data[i] < 128) clear++;
      }
      if ((clear / sampled) * 100 > 32) celebrate();
    } catch {
      // ignore
    }
  };

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
    checkReveal();
  };

  return (
    <Card
      className="reveal-date-card"
      style={{
        background: backdrop,
        borderTop: `1px solid ${pink.line}`,
        borderBottom: `1px solid ${pink.line}`,
        color: theme.colors.ink,
        textAlign: 'center',
        padding: '0 0 max(20px, 2.5vh)',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'flex-start',
      }}
    >
      {/* Full-bleed floral arch. The image is zoomed so the garland reaches both edges. */}
      <div
        aria-hidden
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(23vh, 176px)',
          overflow: 'hidden',
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <img
          src="/images/countdown-bg.jpg"
          alt=""
          style={{
            width: '100%',
            height: '560%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
          }}
        />
      </div>

      <Petals tone="red-white" amount={16} />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 360,
          margin: '0 auto',
          padding: '0 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {/* Title block below flowers, center aligned */}
        <p
          className="eyebrow"
          style={{
            color: pink.main,
            letterSpacing: isRtl ? '0.1em' : '0.28em',
            margin: '10px 0 6px',
          }}
        >
          {isRtl ? 'محبت و مسرت کا خاص دن' : 'SAVE THE AUSPICIOUS DATE'}
        </p>
        <h2
          style={{
            color: theme.colors.ink,
            margin: '2px 0 4px',
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
            width: 'min(214px, 58vw)',
            aspectRatio: '340 / 200',
            margin: '2px auto 8px',
            flexShrink: 0,
            backgroundColor: backdrop,
            backgroundImage: 'url(/images/floral-frame.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '282.35% auto',
            backgroundPosition: '50% 95.92%',
          }}
        />

        {/* Scratch box below the birds */}
        <div
          className={showHint ? 'foil-live-pink' : undefined}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 196,
            margin: '0 auto 10px',
            height: 220,
            flexShrink: 0,
            borderRadius: '108px 108px 18px 18px',
            overflow: 'hidden',
            boxShadow: `0 14px 32px rgba(176,120,132,0.18), 0 0 0 1.5px ${pink.main}`,
            touchAction: 'none',
            userSelect: 'none',
            background: 'linear-gradient(180deg, #FFFCF7 0%, #F8ECEF 100%)',
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
              justifyContent: 'space-between',
              padding: '24px 14px 18px',
            }}
          >
            <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.24em', color: pink.main, fontWeight: 600 }}>
              {isRtl ? 'منگل' : 'TUESDAY'}
            </p>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 5, color: theme.colors.ink }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 54, lineHeight: 1 }}>12</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20 }}>·</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, letterSpacing: '0.08em' }}>JAN</span>
              </div>
              <p style={{ margin: '6px 0 0', color: theme.colors.inkSoft, letterSpacing: '0.18em', fontSize: 11 }}>2027</p>
            </div>
            <p style={{ margin: 0, color: theme.colors.muted, fontSize: 11, letterSpacing: '0.14em' }}>
              {isRtl ? 'لاہور' : 'LAHORE'}
            </p>
          </div>

          {!isRevealed && (
            <canvas
              ref={canvasRef}
              onPointerDown={(e) => {
                isDrawing.current = true;
                setShowHint(false);
                (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                scratchAt(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (!isDrawing.current) return;
                scratchAt(e.clientX, e.clientY);
              }}
              onPointerUp={() => {
                isDrawing.current = false;
              }}
              onPointerCancel={() => {
                isDrawing.current = false;
              }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
                cursor: 'pointer',
                touchAction: 'none',
              }}
            />
          )}
          {showHint && !isRevealed && (
            <>
              <div className="foil-shimmer" />
              <div className="scratch-finger" aria-hidden>
                <svg width="48" height="56" viewBox="0 0 56 64" fill="none">
                  <path
                    d="M22.5 28.5V10.8c0-2.7 1.7-4.5 4-4.5s4 1.8 4 4.5v17.2"
                    fill="#FFF5F6"
                    stroke={pink.main}
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M30.5 28.2V14.2c0-2.15 1.45-3.6 3.35-3.6 1.9 0 3.35 1.45 3.35 3.6v15.4"
                    fill="#FFF5F6"
                    stroke={pink.main}
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M37.2 30.2V18.4c0-1.95 1.35-3.25 3.1-3.25 1.75 0 3.1 1.3 3.1 3.25v14.1"
                    fill="#FFF5F6"
                    stroke={pink.main}
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.8 29.8V20.6c0-2.1 1.4-3.5 3.3-3.5 1.85 0 3.25 1.4 3.25 3.5v10.5"
                    fill="#FFF5F6"
                    stroke={pink.main}
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14.6 31.2c-3.4 1.1-5.7 3.9-5.7 7.5 0 6.4 5.4 14.8 14.8 18.2 9.2 3.3 18.6-0.2 22.4-6.6 2.6-4.4 1.5-9.2-2.4-11.6-1.4-0.9-3.1-1.1-4.8-0.7"
                    fill="#FFF5F6"
                    stroke={pink.main}
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <circle cx="26.5" cy="7.2" r="1.35" fill={pink.soft} />
                </svg>
              </div>
            </>
          )}
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
            }}
          >
            {isRtl ? '✨ فوری طور پر ظاہر کریں' : '✨ Tap to reveal instantly'}
          </button>
        )}
      </div>
    </Card>
  );
}
