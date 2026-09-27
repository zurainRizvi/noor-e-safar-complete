'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { theme } from '@/config/theme';
import { Ornament, Card } from '@/components/shared/Ornament';
import { Petals } from '@/components/shared/Petals';
import type { Locale } from '@/config/translations';

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
        colors: [theme.colors.gold, '#FFF2CE', '#E0C075', '#FFFFFF', '#7BA874', '#C48484'],
      });
      setTimeout(() => {
        confetti({
          particleCount: isMobile ? 40 : 70,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: [theme.colors.gold, '#FFF8EE', '#B7D0B0'],
        });
        confetti({
          particleCount: isMobile ? 40 : 70,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: [theme.colors.gold, '#E2B6B6', '#FFFFFF'],
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

    const width = canvas.offsetWidth || 300;
    const height = canvas.offsetHeight || 370;
    canvas.width = width;
    canvas.height = height;

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#FFF8E8');
    grad.addColorStop(0.35, '#E8D09A');
    grad.addColorStop(0.65, '#C6A15B');
    grad.addColorStop(1, '#A88338');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
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
    ctx.font = isRtl ? 'bold 16px Amiri, serif' : '600 13px "DM Sans", sans-serif';
    ctx.fillText(isRtl ? 'پردہ ہٹا کر تاریخ جانیے' : 'SCRATCH TO REVEAL', width / 2, height / 2 - 8);
    ctx.font = isRtl ? '14px Amiri, serif' : '500 12px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(61,52,41,0.75)';
    ctx.fillText(isRtl ? 'یا فوری طور پر ظاہر کریں' : 'or tap Instant Reveal below', width / 2, height / 2 + 18);
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
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
    checkReveal();
  };

  return (
    <Card
      className="reveal-date-card"
      style={{
        background: theme.colors.card,
        borderTop: `1px solid ${theme.colors.goldLine}`,
        borderBottom: `1px solid ${theme.colors.goldLine}`,
        color: theme.colors.ink,
        textAlign: 'center',
        padding: '52px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Petals tone="gold-white" amount={20} />

      <p className="eyebrow" style={{ color: theme.colors.gold, letterSpacing: '0.28em', marginBottom: 8 }}>
        {isRtl ? 'محبت و مسرت کا خاص دن' : 'SAVE THE AUSPICIOUS DATE'}
      </p>
      <h2
        style={{
          color: theme.colors.ink,
          margin: '6px 0 12px',
          fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
          lineHeight: isRtl ? 1.7 : 1.15,
        }}
      >
        {isRtl ? (
          <>
            تاریخ کی نقاب کشائی
            <em style={{ color: theme.colors.gold, display: 'block', fontStyle: 'normal', fontSize: '0.8em', marginTop: 8 }}>
              ہماری شادی کا متبرک دن
            </em>
          </>
        ) : (
          <>
            Scratch to Reveal
            <em style={{ color: theme.colors.gold, display: 'block', fontStyle: 'italic', fontSize: '0.78em', marginTop: 4 }}>
              Our Wedding Date
            </em>
          </>
        )}
      </h2>
      <Ornament />

      <div
        className={showHint ? 'foil-live' : undefined}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 300,
          margin: '20px auto 14px',
          height: 370,
          borderRadius: '150px 150px 24px 24px',
          overflow: 'hidden',
          boxShadow: `0 16px 40px rgba(61,52,41,0.14), 0 0 0 1.5px ${theme.colors.gold}`,
          touchAction: 'none',
          userSelect: 'none',
          background: 'linear-gradient(180deg, #FFFCF7 0%, #F3EADF 100%)',
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
            padding: '36px 20px 28px',
          }}
        >
          <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.28em', color: theme.colors.gold, fontWeight: 600 }}>
            {isRtl ? 'منگل' : 'TUESDAY'}
          </p>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, color: theme.colors.ink }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, lineHeight: 1 }}>12</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28 }}>·</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, letterSpacing: '0.08em' }}>JAN</span>
            </div>
            <p style={{ margin: '8px 0 0', color: theme.colors.inkSoft, letterSpacing: '0.2em', fontSize: 12 }}>2027</p>
          </div>
          <p style={{ margin: 0, color: theme.colors.muted, fontSize: 12, letterSpacing: '0.16em' }}>
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
              <svg width="34" height="46" viewBox="0 0 34 46" fill="none">
                <path
                  d="M17 44C11 44 8.5 38 8.5 32.5V16.5C8.5 13.5 11 11.8 13.6 12.6V8.2C13.6 5.4 16.8 4.2 18.6 6.4V14.2L21.4 12.4C24.2 10.6 27.4 13 26.2 16.2L22.4 28.5C21.2 35.5 20.2 44 17 44Z"
                  fill="rgba(255,248,232,0.94)"
                  stroke="#C6A15B"
                  strokeWidth="1.3"
                />
                <path d="M14.2 18.5 V32" stroke="#E0C075" strokeWidth="0.8" strokeLinecap="round" />
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
            marginTop: 8,
            padding: '12px 22px',
            borderRadius: 999,
            border: `1px solid ${theme.colors.goldLine}`,
            background: theme.colors.sand,
            color: theme.colors.ink,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          {isRtl ? '✨ فوری طور پر ظاہر کریں' : '✨ Tap to reveal instantly'}
        </button>
      )}
    </Card>
  );
}
