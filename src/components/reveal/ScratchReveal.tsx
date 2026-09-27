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
      <Petals tone="gold-white" amount={38} />

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
              <svg width="56" height="64" viewBox="0 0 56 64" fill="none">
                {/* pointing index finger hand */}
                <path
                  d="M22.5 28.5V10.8c0-2.7 1.7-4.5 4-4.5s4 1.8 4 4.5v17.2"
                  fill="#FFF8E8"
                  stroke="#C6A15B"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M30.5 28.2V14.2c0-2.15 1.45-3.6 3.35-3.6 1.9 0 3.35 1.45 3.35 3.6v15.4"
                  fill="#FFF8E8"
                  stroke="#C6A15B"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M37.2 30.2V18.4c0-1.95 1.35-3.25 3.1-3.25 1.75 0 3.1 1.3 3.1 3.25v14.1"
                  fill="#FFF8E8"
                  stroke="#C6A15B"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.8 29.8V20.6c0-2.1 1.4-3.5 3.3-3.5 1.85 0 3.25 1.4 3.25 3.5v10.5"
                  fill="#FFF8E8"
                  stroke="#C6A15B"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M14.6 31.2c-3.4 1.1-5.7 3.9-5.7 7.5 0 6.4 5.4 14.8 14.8 18.2 9.2 3.3 18.6-0.2 22.4-6.6 2.6-4.4 1.5-9.2-2.4-11.6-1.4-0.9-3.1-1.1-4.8-0.7"
                  fill="#FFF8E8"
                  stroke="#C6A15B"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <circle cx="26.5" cy="7.2" r="1.35" fill="#E0C075" />
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
