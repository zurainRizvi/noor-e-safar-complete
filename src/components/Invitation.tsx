"use client";
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CalendarDays, MapPin, Music2, Send, VolumeX } from 'lucide-react';
import { wedding, type WeddingEvent } from '@/config/wedding';
import { rsvpService } from '@/services/rsvp';
import { t, type Locale } from '@/config/translations';

const reveal = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: 'easeOut' as const } } };

/* Point 3 & 5: Perfectly centered gold ornament (-◇-) with NO line above diamond */
function Ornament({ color = '#d4af57' }: { color?: string }) {
  return (
    <div
      className="ornament"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '12px auto',
        gap: '12px',
        color: color,
        width: '100%',
        maxWidth: '180px',
      }}
    >
      <span className="ornament-line" style={{ flex: 1, borderTop: `1px solid ${color}`, opacity: 0.8 }} />
      <span className="ornament-diamond" style={{ fontSize: '14px', lineHeight: 1, color: color, border: 'none', borderTop: 'none', width: 'auto' }}>◇</span>
      <span className="ornament-line" style={{ flex: 1, borderTop: `1px solid ${color}`, opacity: 0.8 }} />
    </div>
  );
}

/* Symmetrical, Classic Hilal Crescent Moon — Spring Pop-Up & Centered with Chandelier */
function CrescentMoon() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.15, y: 70 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 14,
        mass: 0.8,
        delay: 0.1,
      }}
      style={{
        position: 'absolute',
        top: '20.5%',
        left: '47.5%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'transform, opacity',
      }}
    >
      <motion.svg
        width="54"
        height="54"
        viewBox="0 0 100 100"
        className="crescent-moon-glow"
        style={{
          overflow: 'visible',
          display: 'block',
        }}
        animate={{
          filter: [
            'drop-shadow(0 0 8px rgba(255, 244, 200, 0.9)) drop-shadow(0 0 18px rgba(212, 175, 87, 0.65))',
            'drop-shadow(0 0 16px rgba(255, 255, 255, 0.98)) drop-shadow(0 0 28px rgba(212, 175, 87, 0.9))',
            'drop-shadow(0 0 8px rgba(255, 244, 200, 0.9)) drop-shadow(0 0 18px rgba(212, 175, 87, 0.65))',
          ],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <defs>
          <linearGradient id="hilalMoonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FFF2CB" />
            <stop offset="70%" stopColor="#E5C77A" />
            <stop offset="100%" stopColor="#C5922C" />
          </linearGradient>
        </defs>
        {/* Horns aligned on centerline (x=50) to perfectly align with chandelier & bird apex */}
        <path
          d="M 50 8 C 16 8 16 92 50 92 C 34 78 34 22 50 8 Z"
          fill="url(#hilalMoonGrad)"
        />
      </motion.svg>
    </motion.div>
  );
}

/* Reusable Top Floral Arch Canopy (Spanning across top corners & center) */
function TopCanopyArch({ type }: { type: 'mehndi' | 'baraat' | 'waleema' }) {
  const flowerColors = {
    mehndi: { primary: '#22c55e', secondary: '#86efac', dark: '#15803d' },
    baraat: { primary: '#ef4444', secondary: '#fca5a5', dark: '#b91c1c' },
    waleema: { primary: '#4C7FD9', secondary: '#8FB1EA', dark: '#2563eb' },
  }[type];

  return (
    <svg
      viewBox="0 0 420 110"
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: '110px',
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 4,
        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
      }}
    >
      {/* 1. Sweeping Gold Arch Vines */}
      <path
        d="M 0 0 Q 70 8 135 32 Q 180 50 210 56"
        fill="none"
        stroke="#C6A15B"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M 420 0 Q 350 8 285 32 Q 240 50 210 56"
        fill="none"
        stroke="#C6A15B"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* 2. Secondary Delicate Filigree Swirls */}
      <path d="M 0 12 Q 55 18 115 45 Q 165 65 210 68" fill="none" stroke="#E0C075" strokeWidth="1.2" opacity="0.75" />
      <path d="M 420 12 Q 365 18 305 45 Q 255 65 210 68" fill="none" stroke="#E0C075" strokeWidth="1.2" opacity="0.75" />
      <path d="M 210 56 Q 210 74 214 80 Q 218 84 212 88" fill="none" stroke="#C6A15B" strokeWidth="1" opacity="0.8" />

      {/* 3. Top Arch Heart Leaves (Physically attached with gold stems) */}
      {[
        // Left Arch Leaves
        { stemX: 15, stemY: 3, lx: 25, ly: 14, angle: 30, s: 1.3 },
        { stemX: 45, stemY: 8, lx: 35, ly: 22, angle: -25, s: 1.2 },
        { stemX: 75, stemY: 15, lx: 88, ly: 28, angle: 35, s: 1.4 },
        { stemX: 110, stemY: 26, lx: 100, ly: 42, angle: -20, s: 1.3 },
        { stemX: 145, stemY: 38, lx: 158, ly: 52, angle: 32, s: 1.4 },
        { stemX: 180, stemY: 48, lx: 172, ly: 64, angle: -15, s: 1.2 },

        // Right Arch Leaves (Mirrored)
        { stemX: 405, stemY: 3, lx: 395, ly: 14, angle: -30, s: 1.3 },
        { stemX: 375, stemY: 8, lx: 385, ly: 22, angle: 25, s: 1.2 },
        { stemX: 345, stemY: 15, lx: 332, ly: 28, angle: -35, s: 1.4 },
        { stemX: 310, stemY: 26, lx: 320, ly: 42, angle: 20, s: 1.3 },
        { stemX: 275, stemY: 38, lx: 262, ly: 52, angle: -32, s: 1.4 },
        { stemX: 240, stemY: 48, lx: 248, ly: 64, angle: 15, s: 1.2 },

        // Center Crest Pair
        { stemX: 205, stemY: 55, lx: 198, ly: 68, angle: -10, s: 1.1 },
        { stemX: 215, stemY: 55, lx: 222, ly: 68, angle: 10, s: 1.1 },
      ].map((leaf, idx) => (
        <g key={idx}>
          <path
            d={`M ${leaf.stemX} ${leaf.stemY} Q ${(leaf.stemX + leaf.lx) / 2} ${(leaf.stemY + leaf.ly) / 2 - 2} ${leaf.lx} ${leaf.ly}`}
            fill="none"
            stroke="#C6A15B"
            strokeWidth={0.8 * leaf.s}
            strokeLinecap="round"
          />
          <g transform={`translate(${leaf.lx}, ${leaf.ly}) rotate(${leaf.angle}) scale(${leaf.s})`}>
            <path
              d="M 0 0 C -5 -8 -13 -5 -10 4 C -7 12 0 16 0 16 C 0 16 7 12 10 4 C 13 -5 5 -8 0 0 Z"
              fill="#FFFFFF"
              stroke="#E0D6C3"
              strokeWidth="0.5"
            />
            <path d="M 0 0 L 0 13" stroke="#C6A15B" strokeWidth="0.5" opacity="0.85" />
          </g>
        </g>
      ))}

      {/* 4. Top Arch Theme Blossoms */}
      {[
        { cx: 30, cy: 6, r: 7.5 },
        { cx: 95, cy: 22, r: 8.5 },
        { cx: 165, cy: 45, r: 8 },
        { cx: 210, cy: 56, r: 9 },  // Center crowning blossom
        { cx: 255, cy: 45, r: 8 },
        { cx: 325, cy: 22, r: 8.5 },
        { cx: 390, cy: 6, r: 7.5 },
      ].map((fl, i) => (
        <g key={i} transform={`translate(${fl.cx}, ${fl.cy})`}>
          {[0, 72, 144, 216, 288].map((angle, k) => (
            <ellipse
              key={k}
              cx={Math.cos((angle * Math.PI) / 180) * (fl.r * 0.7)}
              cy={Math.sin((angle * Math.PI) / 180) * (fl.r * 0.7)}
              rx={fl.r * 0.65}
              ry={fl.r * 0.45}
              transform={`rotate(${angle})`}
              fill={flowerColors.primary}
              opacity="0.95"
            />
          ))}
          <circle cx="0" cy="0" r={fl.r * 0.35} fill={flowerColors.secondary} />
          <circle cx="0" cy="0" r={fl.r * 0.18} fill="#ffffff" />
        </g>
      ))}

      {/* 5. Top Arch Pearl Buds */}
      {[
        { cx: 60, cy: 12 },
        { cx: 130, cy: 34 },
        { cx: 190, cy: 52 },
        { cx: 230, cy: 52 },
        { cx: 290, cy: 34 },
        { cx: 360, cy: 12 },
      ].map((b, i) => (
        <g key={i} transform={`translate(${b.cx}, ${b.cy})`}>
          <circle cx="0" cy="0" r="3" fill="#F7F4EB" stroke="#C6A15B" strokeWidth="0.6" />
          <circle cx="0" cy="0" r="1.5" fill={flowerColors.secondary} />
        </g>
      ))}
    </svg>
  );
}

/* Distinct Royal Gold Botanical Corner Spray for Event Cards */
function EventCornerOrnament({ type, isRtl }: { type: 'mehndi' | 'baraat' | 'waleema'; isRtl: boolean }) {
  const gemColor = {
    mehndi: '#22c55e',
    baraat: '#ef4444',
    waleema: '#4C7FD9',
  }[type];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: isRtl ? 'auto' : '18px',
        left: isRtl ? '18px' : 'auto',
        transform: isRtl ? 'scaleX(-1)' : 'none',
        opacity: 0.88,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <svg width="74" height="74" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id={`goldCornerGrad-${type}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF4D6" />
            <stop offset="50%" stopColor="#D4AF57" />
            <stop offset="100%" stopColor="#96732B" />
          </linearGradient>
          <filter id={`cornerGlow-${type}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
          </filter>
        </defs>
        <g filter={`url(#cornerGlow-${type})`}>
          <path d="M 75 75 Q 40 70 20 45 Q 8 25 5 0" stroke={`url(#goldCornerGrad-${type})`} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 75 75 Q 65 40 45 20 Q 25 8 0 5" stroke={`url(#goldCornerGrad-${type})`} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M 28 52 C 22 46 20 36 28 32 C 34 28 40 36 34 42 C 30 46 26 44 26 40" stroke="#E0C075" strokeWidth="1.2" fill="none" />
          <path d="M 52 28 C 46 22 36 20 32 28 C 28 34 36 40 42 34 C 46 30 44 26 40 26" stroke="#E0C075" strokeWidth="1.2" fill="none" />
          <path d="M 70 70 Q 55 58 46 64 Q 58 75 70 70 Z" fill="#FFFFFF" stroke="#D4AF57" strokeWidth="0.5" opacity="0.95" />
          <path d="M 70 70 Q 58 55 64 46 Q 75 58 70 70 Z" fill="#FFFFFF" stroke="#D4AF57" strokeWidth="0.5" opacity="0.95" />
          <path d="M 46 64 Q 35 55 38 46 Q 48 52 46 64 Z" fill="#FFFFFF" stroke="#D4AF57" strokeWidth="0.5" opacity="0.9" />
          <path d="M 64 46 Q 55 35 46 38 Q 52 48 64 46 Z" fill="#FFFFFF" stroke="#D4AF57" strokeWidth="0.5" opacity="0.9" />

          <g transform="translate(56, 56)">
            {[0, 72, 144, 216, 288].map((angle, k) => (
              <ellipse
                key={k}
                cx={Math.cos((angle * Math.PI) / 180) * 5.5}
                cy={Math.sin((angle * Math.PI) / 180) * 5.5}
                rx={4.5}
                ry={3.2}
                transform={`rotate(${angle})`}
                fill={gemColor}
                opacity="0.95"
              />
            ))}
            <circle cx="0" cy="0" r="3" fill="#FFE599" stroke="#96732B" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="1.4" fill="#FFFFFF" />
          </g>

          <circle cx="16" cy="18" r="2.5" fill="#FFF8E7" stroke="#D4AF57" strokeWidth="0.6" />
          <circle cx="18" cy="16" r="2.5" fill="#FFF8E7" stroke="#D4AF57" strokeWidth="0.6" />
          <circle cx="34" cy="12" r="2" fill="#FFF8E7" stroke="#D4AF57" strokeWidth="0.5" />
          <circle cx="12" cy="34" r="2" fill="#FFF8E7" stroke="#D4AF57" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}

/* Luxury Botanical Climbing Creeper Vines with Top Canopy Arch & Mirrored Symmetry */
function BotanicalClimber({ type }: { type: 'mehndi' | 'baraat' | 'waleema' }) {
  const flowerColors = {
    mehndi: { primary: '#22c55e', secondary: '#86efac', dark: '#15803d' },
    baraat: { primary: '#ef4444', secondary: '#fca5a5', dark: '#b91c1c' },
    waleema: { primary: '#4C7FD9', secondary: '#8FB1EA', dark: '#2563eb' },
  }[type];

  // A single side's climber SVG (Left-oriented, right side will scaleX(-1))
  const ClimberSide = () => (
    <svg
      viewBox="0 0 150 680"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
      }}
    >
      {/* 1. Main Continuous Golden Climbing Stem */}
      <path
        d="M 0 0 C 18 35 34 85 24 160 C 14 240 42 320 32 410 C 22 500 38 580 25 670"
        fill="none"
        stroke="#C6A15B"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* 2. Secondary Intertwined Golden Stem */}
      <path
        d="M 2 15 C 32 70 12 180 36 270 C 18 370 42 470 20 570"
        fill="none"
        stroke="#E0C075"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* 3. Delicate Curling Tendrils */}
      <path d="M 8 28 C 20 22 26 34 18 40 C 12 44 8 36 14 32" fill="none" stroke="#C6A15B" strokeWidth="1" opacity="0.8" />
      <path d="M 28 200 C 44 195 50 210 40 218 C 32 222 28 212 36 208" fill="none" stroke="#C6A15B" strokeWidth="1" opacity="0.8" />
      <path d="M 36 430 C 50 425 56 440 46 448 C 38 452 34 442 42 438" fill="none" stroke="#C6A15B" strokeWidth="1" opacity="0.8" />

      {/* 4. Physical Branch Stems & Heart-Shaped White Leaves */}
      {[
        // --- TOP ROOT CLUSTER (Dense, lush, directly on root corner) ---
        { stemX: 2, stemY: 4, lx: 14, ly: 12, angle: 35, s: 1.5 },
        { stemX: 6, stemY: 16, lx: -6, ly: 26, angle: -45, s: 1.3 },
        { stemX: 12, stemY: 32, lx: 26, ly: 38, angle: 42, s: 1.4 },
        { stemX: 16, stemY: 48, lx: 4, ly: 58, angle: -30, s: 1.2 },
        { stemX: 22, stemY: 65, lx: 36, ly: 74, angle: 38, s: 1.4 },

        // --- BODY OF CLIMBING VINE (Ascending from top to bottom) ---
        { stemX: 28, stemY: 95, lx: 14, ly: 108, angle: -32, s: 1.3 },
        { stemX: 26, stemY: 130, lx: 42, ly: 142, angle: 40, s: 1.5 },
        { stemX: 22, stemY: 170, lx: 8, ly: 182, angle: -35, s: 1.3 },
        { stemX: 18, stemY: 210, lx: 34, ly: 222, angle: 36, s: 1.4 },
        { stemX: 18, stemY: 250, lx: 4, ly: 264, angle: -38, s: 1.5 },
        { stemX: 24, stemY: 290, lx: 42, ly: 304, angle: 35, s: 1.4 },
        { stemX: 32, stemY: 335, lx: 16, ly: 348, angle: -30, s: 1.3 },
        { stemX: 38, stemY: 380, lx: 54, ly: 394, angle: 38, s: 1.5 },
        { stemX: 34, stemY: 425, lx: 18, ly: 438, angle: -34, s: 1.4 },
        { stemX: 28, stemY: 470, lx: 46, ly: 485, angle: 32, s: 1.3 },
        { stemX: 24, stemY: 515, lx: 8, ly: 528, angle: -28, s: 1.4 },
        { stemX: 26, stemY: 565, lx: 42, ly: 578, angle: 30, s: 1.2 },
        { stemX: 34, stemY: 615, lx: 18, ly: 628, angle: -25, s: 1.1 },
      ].map((leaf, idx) => (
        <g key={idx}>
          {/* Physical Branch Petiole from Vine directly to Leaf */}
          <path
            d={`M ${leaf.stemX} ${leaf.stemY} Q ${(leaf.stemX + leaf.lx) / 2} ${(leaf.stemY + leaf.ly) / 2 - 2} ${leaf.lx} ${leaf.ly}`}
            fill="none"
            stroke="#C6A15B"
            strokeWidth={0.8 * leaf.s}
            strokeLinecap="round"
          />
          {/* Heart Leaf Shape */}
          <g transform={`translate(${leaf.lx}, ${leaf.ly}) rotate(${leaf.angle}) scale(${leaf.s})`}>
            <path
              d="M 0 0 C -5 -8 -13 -5 -10 4 C -7 12 0 16 0 16 C 0 16 7 12 10 4 C 13 -5 5 -8 0 0 Z"
              fill="#FFFFFF"
              stroke="#E0D6C3"
              strokeWidth="0.5"
            />
            {/* Gold Central Vein & Side Ribs */}
            <path d="M 0 0 L 0 13" stroke="#C6A15B" strokeWidth="0.5" opacity="0.85" />
            <path d="M 0 4 L -4 2" stroke="#C6A15B" strokeWidth="0.3" opacity="0.6" />
            <path d="M 0 4 L 4 2" stroke="#C6A15B" strokeWidth="0.3" opacity="0.6" />
            <path d="M 0 8 L -5 6" stroke="#C6A15B" strokeWidth="0.3" opacity="0.6" />
            <path d="M 0 8 L 5 6" stroke="#C6A15B" strokeWidth="0.3" opacity="0.6" />
          </g>
        </g>
      ))}

      {/* 5. Theme Blossoms Anchored Along the Vine */}
      {[
        { cx: 8, cy: 22, r: 7 },    // Root blossom
        { cx: 20, cy: 80, r: 8 },   // Upper blossom
        { cx: 24, cy: 155, r: 8.5 },
        { cx: 20, cy: 235, r: 8 },
        { cx: 34, cy: 320, r: 9 },
        { cx: 36, cy: 410, r: 8.5 },
        { cx: 26, cy: 495, r: 7.5 },
        { cx: 30, cy: 590, r: 7 },
      ].map((fl, i) => (
        <g key={i} transform={`translate(${fl.cx}, ${fl.cy})`}>
          {[0, 72, 144, 216, 288].map((angle, k) => (
            <ellipse
              key={k}
              cx={Math.cos((angle * Math.PI) / 180) * (fl.r * 0.7)}
              cy={Math.sin((angle * Math.PI) / 180) * (fl.r * 0.7)}
              rx={fl.r * 0.65}
              ry={fl.r * 0.45}
              transform={`rotate(${angle})`}
              fill={flowerColors.primary}
              opacity="0.95"
            />
          ))}
          <circle cx="0" cy="0" r={fl.r * 0.35} fill={flowerColors.secondary} />
          <circle cx="0" cy="0" r={fl.r * 0.18} fill="#ffffff" />
        </g>
      ))}

      {/* 6. Golden Floral Buds Anchored Along Vine */}
      {[
        { cx: 14, cy: 12 },  // Root bud
        { cx: -2, cy: 42 },  // Root bud 2
        { cx: 32, cy: 115 },
        { cx: 12, cy: 195 },
        { cx: 40, cy: 275 },
        { cx: 22, cy: 365 },
        { cx: 44, cy: 455 },
        { cx: 18, cy: 545 },
        { cx: 36, cy: 640 },
      ].map((b, i) => (
        <g key={i} transform={`translate(${b.cx}, ${b.cy})`}>
          <circle cx="0" cy="0" r="3.2" fill="#F7F4EB" stroke="#C6A15B" strokeWidth="0.6" />
          <circle cx="0" cy="0" r="1.6" fill={flowerColors.secondary} />
        </g>
      ))}
    </svg>
  );

  return (
    <div
      className="botanical-climber-container"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 8,
      }}
    >
      {/* Top Canopy Arch */}
      <TopCanopyArch type={type} />

      {/* Left Climber */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '6px',
          width: '28%',
          height: '88%',
          overflow: 'visible',
        }}
      >
        <ClimberSide />
      </div>

      {/* Right Climber (100% Exact Mirror via scaleX(-1)) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: '6px',
          width: '28%',
          height: '88%',
          overflow: 'visible',
          transform: 'scaleX(-1)',
        }}
      >
        <ClimberSide />
      </div>
    </div>
  );
}

function Petals({ tone = 'white', amount = 25 }: { tone?: string; amount?: number }) {
  const reduce = useReducedMotion();
  return (
    <div className={`petals ${tone}`}>
      {Array.from({ length: amount }, (_, i) => (
        <motion.i
          key={i}
          style={{ left: `${1 + (i * 3.8) % 100}%` }}
          animate={reduce ? undefined : { y: [-100, 900], x: [0, i % 2 ? 40 : -32], rotate: [0, 280], opacity: [0, 0.9, 0.7, 0] }}
          transition={{ duration: 6 + (i % 5), delay: i * 0.25, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function FlyingBird({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 38 18"
      width="26"
      height="13"
      style={{
        transform: flip ? 'scaleX(-1)' : 'scaleX(1)',
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.65)) drop-shadow(0 0 2px rgba(255,255,255,0.9))',
        overflow: 'visible',
      }}
    >
      {/* Real elegant soaring bird silhouette with wings & tail */}
      <path
        d="M 1 6 C 9 -3 15 1 19 7 C 23 1 29 -3 37 6 C 29 4 23 9 19 13 C 15 9 9 4 1 6 Z"
        fill="#FFFFFF"
      />
      <path
        d="M 17 6.5 Q 19 4.5 21 6.5 L 19.5 16 L 19 15 L 18.5 16 Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

function Birds() {
  const birdPaths = [
    // Birds scattered ABOVE the moon
    { id: 'above-ltr-1', startX: -15, endX: 250, y: [6, 16, 10], duration: 8.4, delay: 0.2, flapDur: 0.45, flip: false },
    { id: 'above-rtl-1', startX: 250, endX: -15, y: [18, 8, 14], duration: 8.8, delay: 1.5, flapDur: 0.46, flip: true },
    { id: 'above-ltr-2', startX: -15, endX: 250, y: [26, 14, 22], duration: 9.2, delay: 3.5, flapDur: 0.50, flip: false },

    // Birds scattered BELOW the moon
    { id: 'below-ltr-1', startX: -15, endX: 250, y: [120, 134, 126], duration: 8.0, delay: 0.8, flapDur: 0.44, flip: false },
    { id: 'below-rtl-1', startX: 250, endX: -15, y: [142, 128, 136], duration: 8.5, delay: 2.8, flapDur: 0.48, flip: true },
    { id: 'below-ltr-2', startX: -15, endX: 250, y: [150, 138, 145], duration: 7.6, delay: 5.0, flapDur: 0.42, flip: false },
  ];

  return (
    <motion.div
      className="birds"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: '13%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '240px',
        height: '170px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, transparent 100%)',
      }}
    >
      {birdPaths.map((b) => (
        <motion.div
          key={b.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          animate={{
            x: [b.startX, b.endX],
            y: b.y,
            opacity: [0, 0.95, 0.95, 0],
          }}
          transition={{
            x: { duration: b.duration, repeat: Infinity, delay: b.delay, ease: 'linear' },
            y: { duration: b.duration, repeat: Infinity, delay: b.delay, ease: 'easeInOut' },
            opacity: { duration: b.duration, times: [0, 0.08, 0.92, 1], repeat: Infinity, delay: b.delay },
          }}
        >
          <motion.div
            animate={{ scaleY: [1, 0.55, 1], rotate: b.flip ? [-3, 3, -3] : [3, -3, 3] }}
            transition={{ duration: b.flapDur, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'center center' }}
          >
            <FlyingBird flip={b.flip} />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* Point 1: Smooth fade out for Tap to illuminate prompt */
function Intro({ videoRef, onBegin }: { videoRef: React.RefObject<HTMLVideoElement | null>; onBegin: () => void }) {
  const [started, setStarted] = useState(false);

  const begin = () => {
    if (started) return;
    setStarted(true);
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
    onBegin();
  };

  return (
    <motion.section
      className="cover"
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: started ? 'none' : 'auto',
        background: 'url(/art/noor-garden.png) center/cover #101410',
      }}
      onClick={begin}
    >
      <AnimatePresence mode="wait">
        {!started && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: -10,
              scale: 0.95,
              transition: { duration: 0.6, ease: 'easeInOut' },
            }}
            style={{
              position: 'absolute',
              bottom: '16%',
              left: 0,
              right: 0,
              margin: '0 auto',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <motion.button
              className="eyebrow tap-glow"
              onClick={begin}
              style={{
                background: 'rgba(20, 25, 20, 0.45)',
                border: '1px solid rgba(212, 175, 87, 0.6)',
                padding: '14px 34px',
                borderRadius: '30px',
                cursor: 'pointer',
                fontSize: '13px',
                letterSpacing: '0.35em',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#ffffff',
                margin: '0 auto',
              }}
              animate={{
                opacity: [0.65, 1, 0.65],
                textShadow: ['0 0 4px #b99a56', '0 0 20px #fff, 0 0 35px #b99a56', '0 0 4px #b99a56'],
                scale: [0.98, 1.03, 0.98],
                boxShadow: [
                  '0 0 15px rgba(212, 175, 87, 0.2)',
                  '0 0 35px rgba(212, 175, 87, 0.6), 0 0 50px rgba(255, 255, 255, 0.3)',
                  '0 0 15px rgba(212, 175, 87, 0.2)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              TAP TO ILLUMINATE
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function Countdown({ locale }: { locale: Locale }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(wedding.countdownTarget).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const labels = locale === 'ur' ? ['دن', 'گھنٹے', 'منٹ', 'سیکنڈ'] : ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'];
  const v = [
    Math.floor(left / 86400000),
    Math.floor(left / 3600000) % 24,
    Math.floor(left / 60000) % 60,
    Math.floor(left / 1000) % 60,
  ];
  return (
    <div className="count-grid">
      {v.map((n, i) => (
        <span key={labels[i]}>
          <strong>{String(n).padStart(2, '0')}</strong>
          <small>{labels[i]}</small>
        </span>
      ))}
    </div>
  );
}

function Card({
  className = '',
  id,
  style,
  children,
}: {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      style={{ width: '100%', margin: 0, borderRadius: 0, ...style }}
      className={`card ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.section>
  );
}

/* Point 4: Backdrop kept consistently blurred, centered ornament, bottom aligned */
function Hero({ locale }: { locale: Locale }) {
  return (
    <motion.section
      className="card hero"
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'transparent', justifyContent: 'flex-end', paddingBottom: '36px', minHeight: '100svh', position: 'relative', overflow: 'hidden' }}
    >
      {/* Central Sky Zone: Full viewport bounds so percentages match true screen coordinates */}
      <div
        className="hero-sky-zone"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 1,
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 85%, transparent 100%)',
        }}
      >
        <CrescentMoon />
        <Birds />
      </div>

      <Petals amount={16} tone="baraat" />

      {/* The Abeeha & Zurain card: silky smooth hardware-accelerated glide from bottom */}
      <motion.div
        initial={{ opacity: 0, y: 70, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.0,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          background: 'rgba(16, 22, 16, 0.58)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.55)',
          border: '1px solid rgba(212, 175, 87, 0.35)',
          borderRadius: '24px',
          padding: '24px 22px 20px',
          width: '100%',
          maxWidth: '430px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center' as const,
          marginTop: 'auto',
          position: 'relative',
          zIndex: 10,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
        }}
      >
        <p className="eyebrow" style={{ color: '#d4af57', marginBottom: '8px', fontSize: '11px', letterSpacing: '0.28em' }}>
          {t(locale, 'families')}
        </p>

        <h1 style={{ margin: '4px 0 16px', color: '#ffffff' }}>
          <em>Abeeha</em>
          <b style={{ color: '#d4af57' }}>&</b>
          <em>Zurain</em>
        </h1>

        <div
          style={{
            background: 'rgba(25, 32, 25, 0.58)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(212, 175, 87, 0.25)',
            borderRadius: '16px',
            padding: '14px 24px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center' as const,
          }}
        >
          <p style={{ color: '#f5f0e3', fontSize: '16px', letterSpacing: '0.05em', margin: '4px 0' }}>
            {locale === 'ur' ? 'رشتۂ ازدواج میں منسلک ہو رہے ہیں' : 'Are Getting Married'}
          </p>
          {/* Centered Ornament */}
          <Ornament color="#d4af57" />
          <p className="month" style={{ color: '#d4af57', margin: '4px 0' }}>
            {locale === 'ur' ? 'جنوری · ۲۰۲۷' : 'JANUARY · 2027'}
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
}

function Blessing({ locale }: { locale: Locale }) {
  return (
    <Card className="ivory" style={{ background: 'rgba(245, 240, 227, 0.94)' }}>
      <Petals tone="quran-verse" amount={24} />
      <motion.p className="eyebrow" variants={reveal}>
        {locale === 'ur' ? 'اللہ کے نام سے' : 'IN THE NAME OF ALLAH'}
      </motion.p>
      <motion.p className="arabic" variants={reveal}>
        {wedding.invitation.arabic}
      </motion.p>
      <Ornament />
      <motion.h2 variants={reveal}>
        {locale === 'ur' ? (
          <>
            محبت سے،<em>ہم آغاز کرتے ہیں۔</em>
          </>
        ) : (
          <>
            With love,<em>we begin.</em>
          </>
        )}
      </motion.h2>
      <motion.p className="copy" variants={reveal}>
        {locale === 'ur'
          ? 'اللہ کے نام سے ہم ایک خوبصورت سفر کا آغاز کرتے ہیں اور آپ کو اپنی خوشی میں شریک ہونے کی دعوت دیتے ہیں۔'
          : 'In the name of Allah, we begin a beautiful journey and invite you to share this precious moment with us.'}
      </motion.p>
      <motion.blockquote variants={reveal}>
        {wedding.invitation.verseArabic}
        <small style={{ display: 'block', margin: '14px 0 6px', fontSize: '14px', lineHeight: '1.6', color: '#4a3b2c', fontFamily: 'Cormorant Garamond', fontStyle: 'italic' }}>
          {locale === 'ur'
            ? '”اے ہمارے رب! ہمیں اپنی بیویوں اور اپنی اولاد سے آنکھوں کی ٹھنڈک عطا فرما اور ہمیں پرہیزگاروں کا پیشوا بنا۔“'
            : '“Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous.”'}
        </small>
        <small style={{ display: 'block', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8c7042', marginTop: '6px' }}>
          {locale === 'ur' ? 'سورۃ الفرقان · ۲۵:۷۴' : 'SURAH AL-FURQAN · 25:74'}
        </small>
      </motion.blockquote>
    </Card>
  );
}

/* Interactive Scratch-to-Reveal Date Card (Majestic Mughal Mihrab Archway) */
function RevealDateCard({ locale }: { locale: Locale }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [, setScratchPercent] = useState(0);
  const isDrawing = useRef(false);
  const hasTriggeredConfetti = useRef(false);

  const isRtl = locale === 'ur';

  // Initialize Canvas with shimmering gold foil matching the Mihrab dome arch
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.offsetWidth || 300;
    const height = canvas.offsetHeight || 370;
    canvas.width = width;
    canvas.height = height;

    // Rich metallic gold gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#FFF4D6');
    grad.addColorStop(0.25, '#D4AF57');
    grad.addColorStop(0.5, '#A88338');
    grad.addColorStop(0.75, '#E5C77A');
    grad.addColorStop(1, '#8C6826');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Islamic Mihrab Arch inner outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(width / 2, width / 2 + 8, width / 2 - 18, Math.PI, 0);
    ctx.lineTo(width - 18, height - 18);
    ctx.lineTo(18, height - 18);
    ctx.closePath();
    ctx.stroke();

    // Royal corner flourishes on foil
    ctx.fillStyle = 'rgba(255, 245, 220, 0.75)';
    ctx.font = '14px serif';
    ctx.fillText('✦', 30, height - 26);
    ctx.fillText('✦', width - 30, height - 26);
    ctx.fillText('✦', width / 2, 44);

    // Center Royal Gold Seal Medallion
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 16, 36, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '26px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨', width / 2, height / 2 - 16);

    ctx.font = isRtl ? 'bold 16px "Noto Nastaliq Urdu", serif' : '600 13px "Cinzel", "Cormorant Garamond", serif';
    ctx.fillStyle = '#1B1408';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(isRtl ? 'پردہ ہٹا کر تاریخ جانیے' : 'SCRATCH TO REVEAL OUR DATE', width / 2, height / 2 + 42);
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      if (!isRevealed) initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [locale, isRevealed]);

  const triggerCelebration = async () => {
    if (hasTriggeredConfetti.current) return;
    hasTriggeredConfetti.current = true;
    setIsRevealed(true);
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#D4AF57', '#FFF2CE', '#E5C77A', '#FFFFFF', '#22C55E', '#EF4444'],
      });
    } catch {
      // ignore
    }
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let transparentCount = 0;
      const totalSampled = pixels.length / 16;

      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] < 128) {
          transparentCount++;
        }
      }

      const percent = Math.min(100, Math.round((transparentCount / totalSampled) * 100));
      setScratchPercent(percent);

      if (percent > 35 && !isRevealed) {
        triggerCelebration();
      }
    } catch {
      // fallback
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDrawing.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  return (
    <Card
      className="reveal-date-card"
      style={{
        background: 'linear-gradient(180deg, rgba(22, 32, 24, 0.96) 0%, rgba(16, 24, 18, 0.94) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 87, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        padding: '50px 24px',
      }}
    >
      <Petals tone="gold-white" amount={22} />

      <p className="eyebrow" style={{ color: '#d4af57', letterSpacing: '0.28em', marginBottom: isRtl ? '10px' : '8px' }}>
        {isRtl ? 'محبت و مسرت کا خاص دن' : 'SAVE THE AUSPICIOUS DATE'}
      </p>

      <h2
        style={{
          color: '#ffffff',
          margin: isRtl ? '8px 0 16px' : '6px 0 12px',
          lineHeight: isRtl ? 1.75 : 1.15,
          fontFamily: isRtl ? "'Noto Nastaliq Urdu', serif" : "'Cormorant Garamond', serif",
        }}
      >
        {isRtl ? (
          <>
            تاریخ کی نقاب کشائی
            <em
              style={{
                color: '#d4af57',
                display: 'block',
                fontStyle: 'normal',
                fontSize: '0.8em',
                marginTop: '8px',
                lineHeight: 1.7,
              }}
            >
              ہماری شادی کا متبرک دن
            </em>
          </>
        ) : (
          <>
            Scratch to Reveal
            <em
              style={{
                color: '#d4af57',
                display: 'block',
                fontStyle: 'italic',
                fontSize: '0.78em',
                marginTop: '4px',
              }}
            >
              Our Wedding Date
            </em>
          </>
        )}
      </h2>

      <Ornament />

      {/* Royal Mughal Dome Arch Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '300px',
          margin: '20px auto 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Ornate Gold Crown Finial Arch Crest */}
        <div style={{ marginBottom: '-6px', zIndex: 3, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}>
          <svg width="68" height="28" viewBox="0 0 70 30" fill="none">
            <path d="M 35 2 Q 38 12 48 14 Q 58 16 68 28 L 2 28 Q 12 16 22 14 Q 32 12 35 2 Z" fill="url(#archGoldGrad)" stroke="#FFE599" strokeWidth="0.8" />
            <circle cx="35" cy="4" r="3" fill="#FFE599" stroke="#96732B" strokeWidth="0.5" />
            <circle cx="35" cy="4" r="1.5" fill="#FFFFFF" />
            <defs>
              <linearGradient id="archGoldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF4D6" />
                <stop offset="50%" stopColor="#D4AF57" />
                <stop offset="100%" stopColor="#96732B" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* The Arched Mihrab Window Frame */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '370px',
            borderRadius: '150px 150px 24px 24px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), 0 0 0 2px #d4af57, 0 0 25px rgba(212, 175, 87, 0.4)',
            userSelect: 'none',
            touchAction: 'none',
            background: 'radial-gradient(ellipse at 50% 30%, #1c2b1e 0%, #0d1610 100%)',
          }}
        >
          {/* UNDERNEATH: Revealed Royal Date Arch Plaque */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '36px 20px 24px',
              borderRadius: '150px 150px 24px 24px',
              border: '1.5px solid rgba(212, 175, 87, 0.45)',
              zIndex: 1,
            }}
          >
            {/* Top Mihrab Star Seal */}
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '18px', color: '#FFF2CE', textShadow: '0 0 10px rgba(212,175,87,0.8)' }}>✧</span>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '11px',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: '#d4af57',
                  fontFamily: 'Manrope, sans-serif',
                  fontWeight: 600,
                }}
              >
                {isRtl ? 'منگل کا پرنور دن' : 'TUESDAY'}
              </p>
            </div>

            {/* Center Illuminated Big Date */}
            <div style={{ textAlign: 'center', margin: 'auto 0' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: '4px',
                  color: '#ffffff',
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '74px',
                    fontWeight: 600,
                    color: '#FFF6D6',
                    textShadow: '0 0 24px rgba(212, 175, 87, 0.8), 0 0 45px rgba(212, 175, 87, 0.35)',
                    lineHeight: 0.85,
                  }}
                >
                  12
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '26px',
                    color: '#d4af57',
                    fontStyle: 'italic',
                  }}
                >
                  th
                </span>
              </div>

              <div
                style={{
                  fontSize: isRtl ? '22px' : '18px',
                  fontFamily: isRtl ? "'Noto Nastaliq Urdu', serif" : "'Cormorant Garamond', serif",
                  fontWeight: 600,
                  color: '#E5C77A',
                  letterSpacing: isRtl ? 'normal' : '0.2em',
                  margin: '8px 0 4px',
                  lineHeight: isRtl ? 1.6 : 1.2,
                }}
              >
                {isRtl ? 'جنوری · ۲۰۲۷' : 'JANUARY · 2027'}
              </div>

              <div
                style={{
                  fontSize: isRtl ? '15px' : '13px',
                  color: 'rgba(255, 255, 255, 0.88)',
                  fontFamily: isRtl ? "'Noto Nastaliq Urdu', serif" : "'Cormorant Garamond', serif",
                  fontStyle: isRtl ? 'normal' : 'italic',
                  letterSpacing: '0.08em',
                  marginTop: '4px',
                }}
              >
                Zurain & Abeeha
              </div>
            </div>

            {/* Bottom Filigree Flourish inside arch */}
            <div style={{ opacity: 0.85, marginBottom: '2px' }}>
              <svg width="120" height="18" viewBox="0 0 120 18" fill="none">
                <path d="M 0 9 Q 30 14 60 9 Q 90 4 120 9" stroke="#d4af57" strokeWidth="1" />
                <circle cx="60" cy="9" r="3" fill="#FFF2CE" stroke="#96732B" strokeWidth="0.5" />
                <circle cx="40" cy="11" r="1.5" fill="#d4af57" />
                <circle cx="80" cy="7" r="1.5" fill="#d4af57" />
              </svg>
            </div>
          </div>

          {/* TOP LAYER: Scratchable Golden Mihrab Canvas */}
          <motion.canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            animate={{ opacity: isRevealed ? 0 : 1 }}
            transition={{ duration: 0.7 }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              cursor: isRevealed ? 'default' : 'pointer',
              zIndex: 2,
              pointerEvents: isRevealed ? 'none' : 'auto',
              touchAction: 'none',
            }}
          />
        </div>
      </div>

      {/* Helper text / Quick Reveal Button */}
      <div style={{ marginTop: '10px' }}>
        {!isRevealed ? (
          <button
            type="button"
            onClick={triggerCelebration}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#d4af57',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textDecoration: 'underline',
              cursor: 'pointer',
              opacity: 0.8,
              padding: '6px 12px',
            }}
          >
            {isRtl ? '✨ پردہ ہٹا کر تاریخ دیکھیں' : '✨ Tap to reveal instantly'}
          </button>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              color: '#d4af57',
              fontSize: '12px',
              letterSpacing: '0.14em',
              margin: '4px 0 0',
              fontWeight: 500,
            }}
          >
            {isRtl ? '✨ بارات اور نکاح کی متبرک تاریخ ✨' : '✨ Save the date for our wedding celebrations ✨'}
          </motion.p>
        )}
      </div>
    </Card>
  );
}

function CountCard({ locale }: { locale: Locale }) {
  return (
    <Card className="count-card" style={{ background: 'rgba(22, 28, 22, 0.88)' }}>
      <Petals tone="gold-white" amount={22} />
      <p className="eyebrow" style={{ color: '#d4af57' }}>{locale === 'ur' ? 'ہمیشہ کے سفر کے آغاز تک' : 'UNTIL FOREVER BEGINS'}</p>
      <h2 style={{ color: '#ffffff' }}>
        {locale === 'ur' ? (
          <>
            دنوں کی<em>گنتی جاری ہے۔</em>
          </>
        ) : (
          <>
            Counting<em>the days.</em>
          </>
        )}
      </h2>
      <Countdown locale={locale} />
    </Card>
  );
}

function calendar(e: WeddingEvent) {
  const d = e.date.replaceAll('-', ''),
    h = e.time.startsWith('4') ? '110000' : e.time.startsWith('6') ? '130000' : '140000',
    body = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${d}T${h}Z`,
      `SUMMARY:${e.name} — Zurain & Abeeha`,
      `LOCATION:${e.address}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n'),
    url = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })),
    a = document.createElement('a');
  a.href = url;
  a.download = `${e.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function Event({ e, i, locale }: { e: WeddingEvent; i: number; locale: Locale }) {
  const n = { mehndi: ['Mehndi', 'مہندی'], baraat: ['Baraat', 'بارات'], waleema: ['Waleema', 'ولیمہ'] }[e.id],
    s = { mehndi: ['an evening of colour', 'رنگوں بھری شام'], baraat: ['the royal celebration', 'شاہانہ تقریب'], waleema: ['a moonlit gathering', 'چاندنی محفل'] }[e.id],
    date = new Date(e.date + 'T12:00:00'),
    language = locale === 'ur' ? 'ur-PK' : 'en-GB',
    dayName = locale === 'ur' ? { Tuesday: 'منگل', Thursday: 'جمعرات', Friday: 'جمعہ' }[e.day] : e.day;

  const eventStyles = {
    mehndi: { bg: 'linear-gradient(180deg, rgba(14, 38, 22, 0.98) 0%, rgba(20, 52, 30, 0.96) 100%)', border: 'rgba(245, 158, 11, 0.35)' },
    baraat: { bg: 'linear-gradient(180deg, rgba(65, 10, 18, 0.98) 0%, rgba(85, 14, 24, 0.96) 100%)', border: 'rgba(220, 38, 38, 0.35)' },
    waleema: { bg: 'linear-gradient(180deg, rgba(10, 28, 54, 0.98) 0%, rgba(16, 42, 78, 0.96) 100%)', border: 'rgba(59, 130, 246, 0.35)' },
  }[e.id];

  return (
    <Card className={`event ${e.id}`} style={{ background: eventStyles.bg, backdropFilter: 'blur(10px)', border: `1px solid ${eventStyles.border}` }}>
      <BotanicalClimber type={e.id} />
      <Petals amount={40} tone={e.id} />
      <EventCornerOrnament type={e.id} isRtl={locale === 'ur'} />
      <p className="eyebrow" style={{ color: '#d4af57' }}>
        0{i + 1} · {locale === 'ur' ? n[1] : n[0].toUpperCase()}
      </p>
      <h2 style={{ color: '#ffffff' }}>
        {locale === 'ur' ? n[1] : n[0]}
        <em style={{ color: '#e2d8b2' }}>{locale === 'ur' ? s[1] : s[0]}</em>
      </h2>
      <Ornament />
      <div className="date" style={{ color: '#ffffff' }}>
        <strong>{date.getDate().toLocaleString(language)}</strong>
        <span>
          {date.toLocaleDateString(language, { month: 'long' }).toUpperCase()}
          <small>{date.getFullYear().toLocaleString(language, { useGrouping: false })}</small>
        </span>
      </div>
      <p className="event-time" style={{ color: '#d4af57' }}>
        {dayName} · {e.time}
      </p>
      <div className="venue" style={{ color: '#ffffff' }}>
        <MapPin />
        <b>{e.venue}</b>
      </div>
      <div className="actions">
        <a href={e.mapUrl} target="_blank" rel="noreferrer">
          <MapPin />
          {t(locale, 'maps')}
        </a>
        <button onClick={() => calendar(e)}>
          <CalendarDays />
          {t(locale, 'calendar')}
        </button>
      </div>
    </Card>
  );
}

interface ScheduleItem {
  timeEn: string;
  timeUr: string;
  titleEn: string;
  titleUr: string;
  descEn: string;
  descUr: string;
  filled?: boolean;
}

const schedulesData: Record<'mehndi' | 'baraat' | 'waleema', {
  nameEn: string;
  nameUr: string;
  items: ScheduleItem[];
}> = {
  mehndi: {
    nameEn: 'Mehndi',
    nameUr: 'مہندی',
    items: [
      {
        timeEn: '06:30 PM',
        timeUr: 'شام ۶:۳۰',
        titleEn: 'Guest Arrival',
        titleUr: 'مہمانوں کی آمد',
        descEn: 'Welcome, greetings & refreshments',
        descUr: 'استقبال اور خوش آمدید',
        filled: false,
      },
      {
        timeEn: '07:00 PM',
        timeUr: 'شام ۷:۰۰',
        titleEn: 'Nikah Ceremony',
        titleUr: 'تقریبِ نکاح',
        descEn: 'The beautiful beginning of forever',
        descUr: 'ہمیشہ کے خوبصورت سفر کا آغاز',
        filled: true,
      },
      {
        timeEn: '08:00 PM',
        timeUr: 'رات ۸:۰۰',
        titleEn: 'Dinner',
        titleUr: 'طعامِ خاص',
        descEn: 'An evening of delicious food & laughter',
        descUr: 'لذیذ پکوان اور پرمسرت محفل',
        filled: false,
      },
      {
        timeEn: '09:00 PM',
        timeUr: 'رات ۹:۰۰',
        titleEn: 'Celebration',
        titleUr: 'جشن و مسرت',
        descEn: "Let's celebrate this beautiful union",
        descUr: 'اس خوبصورت بندھن کا خوشیوں بھرا جشن',
        filled: false,
      },
    ],
  },
  baraat: {
    nameEn: 'Baraat',
    nameUr: 'بارات',
    items: [
      {
        timeEn: '07:00 PM',
        timeUr: 'شام ۷:۰۰',
        titleEn: 'Reception',
        titleUr: 'استقبالیہ',
        descEn: 'Welcoming the arrival of the Baraat & groom',
        descUr: 'بارات کی آمد اور شاندار استقبال',
        filled: false,
      },
      {
        timeEn: '07:30 PM',
        timeUr: 'شام ۷:۳۰',
        titleEn: 'Refreshments',
        titleUr: 'مشروبات و لوازمات',
        descEn: 'Welcome drinks & evening appetizers',
        descUr: 'خوش آمدیدی مشروبات اور پروقار آغاز',
        filled: true,
      },
      {
        timeEn: '08:30 PM',
        timeUr: 'رات ۸:۳۰',
        titleEn: 'Dinner',
        titleUr: 'شاہانہ عشائیہ',
        descEn: 'A royal feast of authentic delicacies & laughter',
        descUr: 'شاہانہ پکوان اور پرتکلف ضیافت',
        filled: false,
      },
      {
        timeEn: '09:30 PM',
        timeUr: 'رات ۹:۳۰',
        titleEn: 'Celebration',
        titleUr: 'رخصتی و جشن',
        descEn: 'Blessings, fond farewells & joyful celebration',
        descUr: 'دعاؤں، نیک تمناؤں اور خوشیوں بھرا اختتام',
        filled: false,
      },
    ],
  },
  waleema: {
    nameEn: 'Waleema',
    nameUr: 'ولیمہ',
    items: [
      {
        timeEn: '07:00 PM',
        timeUr: 'شام ۷:۰۰',
        titleEn: 'Reception',
        titleUr: 'استقبالیہ',
        descEn: 'Warm welcome & greetings to all beloved guests',
        descUr: 'معزز مہمانوں کا پرجوش اور پرتپاک استقبال',
        filled: false,
      },
      {
        timeEn: '07:30 PM',
        timeUr: 'شام ۷:۳۰',
        titleEn: 'Refreshments',
        titleUr: 'مشروبات و لوازمات',
        descEn: 'Welcome appetizers & evening drinks',
        descUr: 'خوش آمدیدی مشروبات اور ہلکا پھلکا ناشتہ',
        filled: true,
      },
      {
        timeEn: '08:30 PM',
        timeUr: 'رات ۸:۳۰',
        titleEn: 'Dinner',
        titleUr: 'طعامِ ولیمہ',
        descEn: 'Grand feast in celebration of the newlyweds',
        descUr: 'نو بیاہتا جوڑے کی خوشی میں پروقار ضیافت',
        filled: false,
      },
      {
        timeEn: '09:30 PM',
        timeUr: 'رات ۹:۳۰',
        titleEn: 'Celebration',
        titleUr: 'یادگار لمحات و جشن',
        descEn: 'Capturing memories & joyful celebration',
        descUr: 'یادگار تصاویر اور پرمسرت محفل',
        filled: false,
      },
    ],
  },
};

function EventSchedule({ eventId, locale }: { eventId: 'mehndi' | 'baraat' | 'waleema'; locale: Locale }) {
  const data = schedulesData[eventId];
  const isRtl = locale === 'ur';
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const themeStyles = {
    mehndi: {
      bg: 'linear-gradient(180deg, rgba(14, 38, 22, 0.95) 0%, rgba(20, 52, 30, 0.92) 100%)',
      border: 'rgba(245, 158, 11, 0.35)',
      accent: '#f59e0b',
      glow: 'rgba(34, 197, 94, 0.25)',
      tone: 'mehndi',
    },
    baraat: {
      bg: 'linear-gradient(180deg, rgba(65, 10, 18, 0.95) 0%, rgba(85, 14, 24, 0.92) 100%)',
      border: 'rgba(220, 38, 38, 0.35)',
      accent: '#d4af57',
      glow: 'rgba(239, 68, 68, 0.25)',
      tone: 'baraat',
    },
    waleema: {
      bg: 'linear-gradient(180deg, rgba(10, 28, 54, 0.95) 0%, rgba(16, 42, 78, 0.92) 100%)',
      border: 'rgba(59, 130, 246, 0.35)',
      accent: '#d4af57',
      glow: 'rgba(76, 127, 217, 0.25)',
      tone: 'waleema',
    },
  }[eventId];

  return (
    <Card
      className={`event-schedule ${eventId}`}
      style={{
        background: themeStyles.bg,
        backdropFilter: 'blur(12px)',
        border: `1px solid ${themeStyles.border}`,
        position: 'relative',
        overflow: 'hidden',
        textAlign: isRtl ? 'right' : 'left',
        padding: '60px 28px',
      }}
    >
      {/* Reusable Top Floral Arch Canopy (Spanning across top of schedule cards) */}
      <TopCanopyArch type={eventId} />

      <Petals amount={25} tone={themeStyles.tone} />

      {/* Decorative Satin Bow Accent (matching reference design) */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          right: isRtl ? 'auto' : '18px',
          left: isRtl ? '18px' : 'auto',
          opacity: 0.85,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <svg width="72" height="64" viewBox="0 0 80 70" fill="none">
          <path d="M 40 32 C 30 18 10 12 12 28 C 14 38 34 35 40 34 Z" fill="url(#bowGrad1)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))" />
          <path d="M 40 32 C 50 18 70 12 68 28 C 66 38 46 35 40 34 Z" fill="url(#bowGrad2)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))" />
          <path d="M 38 34 C 36 44 24 60 20 66 C 24 64 36 48 40 36 Z" fill="url(#bowGrad1)" opacity="0.9" />
          <path d="M 42 34 C 44 44 56 60 60 66 C 56 64 44 48 40 36 Z" fill="url(#bowGrad2)" opacity="0.9" />
          <ellipse cx="40" cy="33" rx="6" ry="5" fill="#E5C77A" stroke="#C6A15B" strokeWidth="1" />
          <defs>
            <linearGradient id="bowGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF2D1" />
              <stop offset="50%" stopColor="#E0C075" />
              <stop offset="100%" stopColor="#A88338" />
            </linearGradient>
            <linearGradient id="bowGrad2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFF2D1" />
              <stop offset="50%" stopColor="#E0C075" />
              <stop offset="100%" stopColor="#A88338" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Header section */}
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '36px', position: 'relative', zIndex: 2 }}>
        <p className="eyebrow" style={{ color: '#d4af57', letterSpacing: '0.3em', marginBottom: '8px' }}>
          {isRtl ? 'تقریب کا شیڈول' : 'EVENT TIMELINE'}
        </p>
        <h2 style={{ color: '#ffffff', margin: '8px 0 14px', lineHeight: 0.95 }}>
          {isRtl ? data.nameUr : data.nameEn}
          <em style={{ color: '#d4af57', fontStyle: 'italic', display: 'block', fontSize: '0.65em', marginTop: '6px' }}>
            {isRtl ? 'کا شیڈول' : 'Schedule'}
          </em>
        </h2>
        <Ornament />
      </div>

      {/* Vertical Timeline */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          margin: '0 auto',
          paddingLeft: isRtl ? 0 : '36px',
          paddingRight: isRtl ? '36px' : 0,
          zIndex: 2,
        }}
      >
        {/* Continuous Vertical Timeline Line */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            bottom: '24px',
            left: isRtl ? 'auto' : '10px',
            right: isRtl ? '10px' : 'auto',
            width: '2px',
            background: 'linear-gradient(180deg, #d4af57 0%, rgba(212, 175, 87, 0.6) 70%, rgba(212, 175, 87, 0.15) 100%)',
            boxShadow: '0 0 8px rgba(212, 175, 87, 0.4)',
          }}
        />

        {data.items.map((item, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
              style={{
                position: 'relative',
                marginBottom: idx === data.items.length - 1 ? 0 : '24px',
                cursor: 'pointer',
                padding: '10px 14px',
                borderRadius: '14px',
                background: isSelected ? 'rgba(212, 175, 87, 0.14)' : 'transparent',
                border: isSelected ? '1px solid rgba(212, 175, 87, 0.45)' : '1px solid transparent',
                boxShadow: isSelected ? '0 4px 16px rgba(0, 0, 0, 0.35), inset 0 0 12px rgba(212, 175, 87, 0.1)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {/* Timeline Node Circle */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: isRtl ? 'auto' : '-33px',
                  right: isRtl ? '-33px' : 'auto',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: isSelected ? '#d4af57' : 'rgba(20, 26, 20, 0.95)',
                  border: isSelected ? '2px solid #FFF2CE' : '2px solid rgba(212, 175, 87, 0.6)',
                  boxShadow: isSelected
                    ? '0 0 14px rgba(212, 175, 87, 0.95), 0 0 28px rgba(212, 175, 87, 0.5)'
                    : '0 0 4px rgba(0, 0, 0, 0.5)',
                  zIndex: 3,
                  transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected && (
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#121612' }} />
                )}
              </div>

              {/* Time Stamp */}
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: isSelected ? '#FFF2CE' : '#d4af57',
                  marginBottom: '4px',
                  fontFamily: 'Manrope, sans-serif',
                  transition: 'color 0.3s ease',
                }}
              >
                {isRtl ? item.timeUr : item.timeEn}
              </span>

              {/* Event Activity Title */}
              <h3
                style={{
                  margin: '0 0 4px',
                  fontSize: isRtl ? '24px' : '26px',
                  fontWeight: isSelected ? 600 : 500,
                  color: '#ffffff',
                  fontFamily: isRtl ? "'Noto Nastaliq Urdu', serif" : "'Cormorant Garamond', serif",
                  lineHeight: isRtl ? 1.6 : 1.2,
                  textShadow: isSelected ? '0 0 10px rgba(212, 175, 87, 0.4)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isRtl ? item.titleUr : item.titleEn}
              </h3>

              {/* Subtitle / Description */}
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: isSelected ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.78)',
                  fontFamily: isRtl ? "'Noto Nastaliq Urdu', serif" : 'Manrope, sans-serif',
                  lineHeight: isRtl ? 1.8 : 1.45,
                  fontWeight: 300,
                  transition: 'color 0.3s ease',
                }}
              >
                {isRtl ? item.descUr : item.descEn}
              </p>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

function RSVP({ locale }: { locale: Locale }) {
  const isRtl = locale === 'ur';
  const [response, setResponse] = useState<'yes' | 'no' | null>(null);
  const [guestCount, setGuestCount] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['mehndi', 'baraat', 'waleema']);
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    response: 'yes' | 'no';
    guests: string;
    events: string[];
    message: string;
    submittedAt: string;
  } | null>(null);

  const toggleEvent = (id: string) => {
    if (selectedEvents.includes(id)) {
      if (selectedEvents.length > 1) {
        setSelectedEvents(selectedEvents.filter((e) => e !== id));
      }
    } else {
      setSelectedEvents([...selectedEvents, id]);
    }
  };

  const getWhatsAppMessage = (data: {
    name: string;
    response: 'yes' | 'no';
    guests: string;
    events: string[];
    message: string;
  }) => {
    const isAttending = data.response === 'yes';
    const eventMap: Record<string, string> = {
      mehndi: 'Mehndi (10th Jan)',
      baraat: 'Baraat & Nikkah (12th Jan)',
      waleema: 'Waleema (13th Jan)',
    };

    const eventList = isAttending
      ? data.events.map((e) => `  • ${eventMap[e] || e}`).join('\n')
      : '  • None';

    return `✨ *NOOR-E-SAFAR — WEDDING RSVP* ✨
━━━━━━━━━━━━━━━━━━━━━
👤 *Guest:* ${data.name}
💍 *Response:* ${isAttending ? '✅ Joyfully Attending' : '❌ Regretfully Declining'}
${isAttending ? `👥 *Guests:* ${data.guests || '1'}\n📅 *Events:*\n${eventList}\n` : ''}${data.message.trim() ? `💌 *Wishes:* "${data.message.trim()}"\n` : ''}⏰ *Sent:* ${new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
━━━━━━━━━━━━━━━━━━━━━
_Zurain & Abeeha's Wedding Invitation_`;
  };

  const sendToWhatsApp = (data: typeof submittedData) => {
    if (!data) return;
    const msg = getWhatsAppMessage(data);
    const waUrl = `https://wa.me/923053333409?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!response || !guestName.trim()) return;

    const payload = {
      name: guestName.trim(),
      response,
      guests: response === 'yes' ? (guestCount || '1') : '0',
      events: response === 'yes' ? selectedEvents : [],
      message: guestMessage.trim(),
      submittedAt: new Date().toISOString(),
    };

    await rsvpService.submit({ ...payload, guests: Number(payload.guests) });
    setSubmittedData(payload);

    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  }

  const eventsList = [
    { id: 'mehndi', labelEn: 'Mehndi (10 Jan)', labelUr: 'مہندی (۱۰ جنوری)', color: '#22c55e' },
    { id: 'baraat', labelEn: 'Baraat (12 Jan)', labelUr: 'بارات و نکاح (۱۲ جنوری)', color: '#ef4444' },
    { id: 'waleema', labelEn: 'Waleema (13 Jan)', labelUr: 'ولیمہ (۱۳ جنوری)', color: '#3b82f6' },
  ];

  return (
    <Card
      className="rsvp"
      id="rsvp-section"
      style={{
        background: 'linear-gradient(180deg, rgba(20, 28, 20, 0.98) 0%, rgba(14, 20, 14, 0.98) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 87, 0.35)',
        width: '100%',
        margin: 0,
        borderRadius: 0,
        padding: '50px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <p className="eyebrow" style={{ color: '#d4af57', letterSpacing: '0.28em', marginBottom: '8px' }}>
        {isRtl ? 'آپ کی تشریف آوری' : 'R.S.V.P.'}
      </p>

      <h2
        style={{
          color: '#ffffff',
          margin: isRtl ? '8px 0 16px' : '6px 0 14px',
          lineHeight: isRtl ? 1.75 : 1.1,
          fontFamily: isRtl ? "'Noto Nastaliq Urdu', serif" : "'Cormorant Garamond', serif",
        }}
      >
        {submittedData ? (
          isRtl ? (
            <>
              آپ کا شکریہ!
              <em style={{ color: '#d4af57', display: 'block', fontStyle: 'normal', fontSize: '0.8em', marginTop: '6px' }}>
                ہمیں آپ کی آمد کا انتظار رہے گا
              </em>
            </>
          ) : (
            <>
              Thank You!
              <em style={{ color: '#d4af57', display: 'block', fontStyle: 'italic', fontSize: '0.78em', marginTop: '4px' }}>
                Your response has been recorded
              </em>
            </>
          )
        ) : (
          isRtl ? (
            <>
              آپ کی شرکت
              <em style={{ color: '#d4af57', display: 'block', fontStyle: 'normal', fontSize: '0.8em', marginTop: '6px' }}>
                ہماری خوشیوں کو دوبالا کرے گی
              </em>
            </>
          ) : (
            <>
              Will You Attend?
              <em style={{ color: '#d4af57', display: 'block', fontStyle: 'italic', fontSize: '0.78em', marginTop: '4px' }}>
                Kindly let us know by your response
              </em>
            </>
          )
        )}
      </h2>

      <Ornament />

      {!submittedData ? (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '380px', margin: '16px auto 0', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: isRtl ? 'right' : 'left' }}>
          {/* Guest Name */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#d4af57', marginBottom: '6px', fontWeight: 600 }}>
              {isRtl ? 'نام یا خاندانی نام' : 'FULL NAME OR FAMILY NAME'} *
            </label>
            <input
              name="name"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={isRtl ? 'اپنا نام یا خاندانی نام...' : 'Enter your name...'}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '16px',
                border: '1px solid rgba(212, 175, 87, 0.45)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                textAlign: isRtl ? 'right' : 'left',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Attending / Declining Buttons */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#d4af57', marginBottom: '6px', fontWeight: 600 }}>
              {isRtl ? 'شرکت کی تصدیق' : 'ATTENDANCE CONFIRMATION'} *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setResponse('yes')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  border: response === 'yes' ? '1.5px solid #d4af57' : '1px solid rgba(255, 255, 255, 0.2)',
                  background: response === 'yes' ? 'linear-gradient(135deg, #d4af57 0%, #b8943f 100%)' : 'rgba(255, 255, 255, 0.05)',
                  color: response === 'yes' ? '#121612' : '#ffffff',
                  fontWeight: response === 'yes' ? 700 : 400,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>✓</span>
                <span>{isRtl ? 'خوشی سے حاضر ہوں گے' : 'Joyfully Attend'}</span>
              </button>
              <button
                type="button"
                onClick={() => setResponse('no')}
                style={{
                  padding: '12px 14px',
                  borderRadius: '16px',
                  border: response === 'no' ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
                  background: response === 'no' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  color: response === 'no' ? '#fca5a5' : '#ffffff',
                  fontWeight: response === 'no' ? 600 : 400,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>✕</span>
                <span>{isRtl ? 'معذرت خواہ ہیں' : 'Regretfully Decline'}</span>
              </button>
            </div>
          </div>

          {/* If Attending: Guest count, events, wishes */}
          {response === 'yes' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.35 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'hidden' }}
            >
              {/* Number of Guests — text input */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#d4af57', marginBottom: '6px', fontWeight: 600 }}>
                  {isRtl ? 'مہمانوں کی تعداد' : 'NUMBER OF GUESTS'}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="99"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder={isRtl ? 'مثلاً ۵' : 'e.g. 5'}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    border: '1px solid rgba(212, 175, 87, 0.45)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    textAlign: isRtl ? 'right' : 'left',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Event selection pills */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#d4af57', marginBottom: '6px', fontWeight: 600 }}>
                  {isRtl ? 'تقریبات کا انتخاب' : 'SELECT ATTENDING EVENTS'}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {eventsList.map((evt) => {
                    const isSelected = selectedEvents.includes(evt.id);
                    return (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => toggleEvent(evt.id)}
                        style={{
                          flex: '1 1 calc(50% - 4px)',
                          padding: '10px 12px',
                          borderRadius: '14px',
                          border: isSelected ? '1px solid #d4af57' : '1px solid rgba(255, 255, 255, 0.15)',
                          background: isSelected ? 'rgba(212, 175, 87, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ color: evt.color }}>●</span>
                        <span>{isRtl ? evt.labelUr : evt.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Warm Wishes / Message */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#d4af57', marginBottom: '6px', fontWeight: 600 }}>
                  {isRtl ? 'نیک تمنائیں و پیغام (اختیاری)' : 'BLESSINGS & WISHES (OPTIONAL)'}
                </label>
                <input
                  value={guestMessage}
                  onChange={(e) => setGuestMessage(e.target.value)}
                  placeholder={isRtl ? 'جوڑے کے لیے دعائیں...' : 'Write a warm wish for the couple...'}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(212, 175, 87, 0.35)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#ffffff',
                    textAlign: isRtl ? 'right' : 'left',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!response || !guestName.trim()}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '16px 20px',
              borderRadius: '26px',
              border: 'none',
              background: response && guestName.trim()
                ? 'linear-gradient(135deg, #E5C77A 0%, #D4AF57 50%, #A88338 100%)'
                : 'rgba(255, 255, 255, 0.15)',
              color: response && guestName.trim() ? '#121612' : 'rgba(255, 255, 255, 0.4)',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: response && guestName.trim() ? 'pointer' : 'not-allowed',
              boxShadow: response && guestName.trim() ? '0 8px 24px rgba(212, 175, 87, 0.45)' : 'none',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Send size={16} />
            <span>{isRtl ? 'جواب ارسال کریں' : 'Confirm RSVP'}</span>
          </button>
        </form>
      ) : (
        /* Confirmation State — celebration first, then optional WhatsApp */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            width: '100%',
            maxWidth: '380px',
            margin: '20px auto 0',
            padding: '28px 20px',
            borderRadius: '20px',
            background: 'rgba(212, 175, 87, 0.1)',
            border: '1.5px solid rgba(212, 175, 87, 0.4)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>✨</div>
          <h3 style={{ margin: '0 0 6px', color: '#FFF4D6', fontSize: '20px', fontFamily: "'Cormorant Garamond', serif" }}>
            {submittedData.name}
          </h3>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)' }}>
            {submittedData.response === 'yes'
              ? isRtl ? `آپ کا جواب محفوظ ہوگیا۔ (${submittedData.guests} مہمان)` : `RSVP recorded for ${submittedData.guests} guest(s).`
              : isRtl ? 'آپ کے جواب کا شکریہ۔' : 'Thank you for letting us know.'}
          </p>

          {submittedData.response === 'yes' && submittedData.events.length > 0 && (
            <p style={{ margin: '0 0 16px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', letterSpacing: '0.06em' }}>
              {submittedData.events.map(e => eventsList.find(ev => ev.id === e)?.[isRtl ? 'labelUr' : 'labelEn'] || e).join(' • ')}
            </p>
          )}

          <Ornament />

          {/* Optional: Send via WhatsApp */}
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.55)', margin: '12px 0 10px', lineHeight: 1.5 }}>
            {isRtl ? 'واٹس ایپ پر بھی بھیجنا چاہیں گے؟' : 'Would you also like to send via WhatsApp?'}
          </p>
          <button
            type="button"
            onClick={() => sendToWhatsApp(submittedData)}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '24px',
              border: 'none',
              background: '#25D366',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)',
              marginBottom: '10px',
            }}
          >
            <span>📱</span>
            <span>{isRtl ? 'واٹس ایپ پر بھیجیں' : 'Send via WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSubmittedData(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#d4af57',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textDecoration: 'underline',
              cursor: 'pointer',
              opacity: 0.8,
              padding: '6px',
            }}
          >
            {isRtl ? 'جواب میں تبدیلی کریں' : 'Change / Update Response'}
          </button>
        </motion.div>
      )}
    </Card>
  );
}

/* Point 5: Golden -◇- ornament above Your presence our joy on the last page */
function Closing({ locale }: { locale: Locale }) {
  return (
    <motion.section
      className="card close"
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.5 }}
      style={{ background: '#101410', position: 'relative', width: '100%', margin: 0, borderRadius: 0, minHeight: '100svh' }}
    >
      {/* Immediate backdrop layer to completely block video on last page */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#101410',
          zIndex: 2,
        }}
      />
      {/* Real Royal Satin Red Wine Drapery Panels */}
      <motion.div
        className="closing-curtain left"
        variants={{
          hidden: {
            x: '-105%',
            transition: { duration: 1.4, ease: [0.77, 0, 0.18, 1] as const },
          },
          show: {
            x: 0,
            transition: { duration: 1.8, ease: [0.77, 0, 0.18, 1] as const },
          },
        }}
      />
      <motion.div
        className="closing-curtain right"
        variants={{
          hidden: {
            x: '105%',
            transition: { duration: 1.4, ease: [0.77, 0, 0.18, 1] as const },
          },
          show: {
            x: 0,
            transition: { duration: 1.8, ease: [0.77, 0, 0.18, 1] as const },
          },
        }}
      />

      {/* Top Arabic text in white, Golden -◇- ornament, Center "Your presence," in white with "our joy." in yellow */}
      <motion.div
        className="closing-content"
        variants={{
          hidden: { opacity: 0, scale: 0.88, y: 20, transition: { duration: 0.4 } },
          show: { opacity: 1, scale: 1, y: 0, transition: { delay: 1.8, duration: 0.8 } },
        }}
        style={{
          background: 'rgba(22, 8, 12, 0.94)',
          border: '1px solid rgba(212, 175, 87, 0.5)',
          borderRadius: '20px',
          padding: '38px 28px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(212, 175, 87, 0.25)',
          maxWidth: '380px',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Top: Arabic Dua in clean white */}
        <p className="arabic" style={{ fontSize: '28px', lineHeight: '2.1', color: '#ffffff', margin: '0 0 12px', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
          بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
        </p>

        {/* Point 5: Golden -◇- design above Your presence our joy */}
        <Ornament color="#d4af57" />

        {/* Center: Your presence, our joy */}
        <h2 style={{ fontSize: '38px', lineHeight: '1.25', margin: '14px 0 6px', color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
          {locale === 'ur' ? (
            <>
              <span style={{ color: '#ffffff' }}>آپ کی آمد،</span><em style={{ color: '#f59e0b', fontStyle: 'normal' }}>ہماری خوشی۔</em>
            </>
          ) : (
            <>
              <span style={{ color: '#ffffff' }}>Your presence,</span><em style={{ color: '#f59e0b', fontStyle: 'italic', display: 'inline', marginLeft: '6px' }}>our joy.</em>
            </>
          )}
        </h2>
      </motion.div>
    </motion.section>
  );
}

export default function Invitation() {
  const [open, setOpen] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [locale, setLocale] = useState<Locale>('en');
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const isReversingRef = useRef(false);
  const isPreseekedRef = useRef(false);
  const boomerangAnimRef = useRef<number | null>(null);
  const [isReversing, setIsReversing] = useState(false);

  // Synchronous hardware-synchronized frame capture during forward playback
  useEffect(() => {
    let animId: number | null = null;
    let rVfcId: number | null = null;
    let lastCapturedTime = 0;

    const captureCurrentFrame = () => {
      if (!video.current || isReversingRef.current) return;
      const t = video.current.currentTime;
      // Capture all unique frames between 3.98s and 4.98s
      if (t >= 3.98 && t <= 4.98 && framesRef.current.length < 36) {
        if (t > lastCapturedTime + 0.012 || lastCapturedTime === 0) {
          lastCapturedTime = t;
          const offscreen = document.createElement('canvas');
          offscreen.width = video.current.videoWidth || 720;
          offscreen.height = video.current.videoHeight || 1280;
          const ctx = offscreen.getContext('2d');
          if (ctx) {
            ctx.drawImage(video.current, 0, 0, offscreen.width, offscreen.height);
            framesRef.current.push(offscreen);
          }
        }
      }
    };

    const attachCapture = () => {
      if (!video.current) return;
      if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        const onFrame = () => {
          captureCurrentFrame();
          if (video.current && !isReversingRef.current && framesRef.current.length < 36) {
            rVfcId = (video.current as any).requestVideoFrameCallback(onFrame);
          }
        };
        rVfcId = (video.current as any).requestVideoFrameCallback(onFrame);
      } else {
        const onRaf = () => {
          captureCurrentFrame();
          if (video.current && !isReversingRef.current && framesRef.current.length < 36) {
            animId = requestAnimationFrame(onRaf);
          }
        };
        animId = requestAnimationFrame(onRaf);
      }
    };

    const timer = setInterval(() => {
      if (video.current && !video.current.paused && framesRef.current.length < 36) {
        attachCapture();
        clearInterval(timer);
      }
    }, 60);

    return () => {
      clearInterval(timer);
      if (animId) cancelAnimationFrame(animId);
      if (rVfcId && video.current && 'cancelVideoFrameCallback' in HTMLVideoElement.prototype) {
        (video.current as any).cancelVideoFrameCallback(rVfcId);
      }
      if (boomerangAnimRef.current) cancelAnimationFrame(boomerangAnimRef.current);
    };
  }, []);

  // Ultra-Smooth Boomerang reverse loop with cosine easing and background pre-seek
  const startReverseLoop = () => {
    if (!video.current || isReversingRef.current) return;
    isReversingRef.current = true;
    isPreseekedRef.current = false;
    video.current.pause();

    const frames = framesRef.current;
    const canvas = canvasRef.current;

    if (!canvas || frames.length < 4) {
      video.current.currentTime = 4.0;
      isReversingRef.current = false;
      video.current.play().catch(() => {});
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== (video.current.videoWidth || 720)) {
      canvas.width = video.current.videoWidth || 720;
      canvas.height = video.current.videoHeight || 1280;
    }

    // Immediately display the last frame on canvas before displaying
    try {
      ctx.drawImage(frames[frames.length - 1], 0, 0, canvas.width, canvas.height);
    } catch {}
    setIsReversing(true);

    const startTime = performance.now();
    // Luxurious, slow-motion reverse duration (1.8s) for a calm cinematic tempo
    const duration = 1800;

    const stepReverse = (now: number) => {
      if (!isReversingRef.current) return;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Pre-seek the background video to 4.0s while hidden under canvas
      // so it is already buffered and ready to play forward with 0ms latency!
      if (progress >= 0.45 && !isPreseekedRef.current && video.current) {
        isPreseekedRef.current = true;
        video.current.currentTime = 4.0;
      }

      // Smooth cosine ease-in-out curve for natural physical turnaround
      const ease = (1 - Math.cos(Math.PI * progress)) / 2;
      const index = Math.min(
        frames.length - 1,
        Math.max(0, Math.round((1 - ease) * (frames.length - 1)))
      );

      ctx.drawImage(frames[index], 0, 0, canvas.width, canvas.height);

      if (progress < 1) {
        boomerangAnimRef.current = requestAnimationFrame(stepReverse);
      } else {
        // Reverse complete! Keep frame 0 drawn on canvas
        if (frames[0]) {
          ctx.drawImage(frames[0], 0, 0, canvas.width, canvas.height);
        }

        if (video.current) {
          let handedOff = false;
          const handoffToVideo = () => {
            if (handedOff) return;
            handedOff = true;
            setIsReversing(false);
            isReversingRef.current = false;
          };

          // Video is already primed at 4.0s from pre-seek
          video.current.addEventListener(
            'playing',
            () => {
              requestAnimationFrame(() => {
                requestAnimationFrame(handoffToVideo);
              });
            },
            { once: true }
          );

          video.current.playbackRate = 0.55;
          video.current.play().catch(() => {});
          setTimeout(handoffToVideo, 90);
        }
      }
    };

    boomerangAnimRef.current = requestAnimationFrame(stepReverse);
  };

  // Point 1: Chaap Tilak (new source kQOGJphGA6Y) from 1:05 (65s) to 1:22 (82s) looping
  const startChaapTilak = () => {
    if (audio.current) {
      audio.current.currentTime = 65; // 1:05
      audio.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audio.current) {
      // Loop from 1:05 (65s) to 1:25 (85s)
      if (audio.current.currentTime >= 85 || audio.current.currentTime < 65) {
        audio.current.currentTime = 65;
      }
    }
  };

  const handleBegin = () => {
    if (video.current) {
      video.current.muted = true;
      video.current.play().catch(() => {});
    }
    setZooming(true);
    startChaapTilak();
    if (!open) {
      setOpen(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!video.current) return;

    // Start cinematic zoom at last quarter of 1st second (0.75s) as curtains start moving
    if (video.current.currentTime >= 0.75 && !zooming) {
      setZooming(true);
    }

    // Trigger Abeeha & Zurain card dropdown on video playback
    if ((video.current.currentTime >= 1.5 || video.current.currentTime >= 4.8) && !open) {
      setOpen(true);
    }

    // Slow down video to smooth cinematic 0.55x slow-motion during boomerang looping segment
    if (video.current.currentTime >= 3.95 && video.current.playbackRate > 0.55) {
      video.current.playbackRate = 0.55;
    }

    // Instagram/Snapchat style Boomerang: At 4.95s, play in reverse back to 4.0s
    if (video.current.currentTime >= 4.95 && !isReversingRef.current) {
      startReverseLoop();
    }
  };

  const handleVideoEnd = () => {
    if (!open) setOpen(true);
    if (!isReversingRef.current) {
      startReverseLoop();
    }
  };

  const music = () => {
    if (!audio.current) return;
    if (audio.current.paused) {
      if (audio.current.currentTime < 65 || audio.current.currentTime >= 85) {
        audio.current.currentTime = 65;
      }
      audio.current.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.current.pause();
      setPlaying(false);
    }
  };

  return (
    <main dir={locale === 'ur' ? 'rtl' : 'ltr'}>
      {/* Audio Element playing Chaap Tilak with loop 1:05 (65s) to 1:25 (85s) */}
      <audio
        ref={audio}
        src={wedding.musicPath}
        onTimeUpdate={handleAudioTimeUpdate}
      />

      {/* Video & Boomerang Canvas Container: strictly constrained to 480px with overflow: hidden */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          height: '100dvh',
          overflow: 'hidden',
          zIndex: 0,
          pointerEvents: 'none',
          backgroundColor: '#101410',
        }}
      >
        <video
          ref={video}
          src="/intro-video.mp4"
          poster="/art/noor-garden.png"
          preload="auto"
          playsInline
          muted
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleVideoEnd}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: (zooming || open) ? 'scale(1.18)' : 'scale(1.0)',
            transformOrigin: 'center center',
            opacity: 0.92,
            transition: 'transform 1.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 2s ease-in-out',
            backgroundColor: '#101410',
          }}
        />
        {/* Canvas overlay that renders the captured reverse frames seamlessly */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isReversing ? 'block' : 'none',
            transform: (zooming || open) ? 'scale(1.18)' : 'scale(1.0)',
            transformOrigin: 'center center',
            opacity: 0.92,
            backgroundColor: '#101410',
          }}
        />
      </div>

      {/* Intro Overlay: TAP TO ILLUMINATE below AZ logo */}
      <AnimatePresence>
        {!open && <Intro videoRef={video} onBegin={handleBegin} />}
      </AnimatePresence>

      {/* Main Card Content */}
      {open && (
        <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div className="controls">
            <button onClick={music}>{playing ? <Music2 /> : <VolumeX />}</button>
            <button onClick={() => setLocale(locale === 'en' ? 'ur' : 'en')}>{locale === 'en' ? 'اردو' : 'EN'}</button>
          </div>
          <Hero locale={locale} />
          <div style={{ position: 'relative', zIndex: 3, background: '#101410', width: '100%', margin: 0, padding: 0 }}>
            <Blessing locale={locale} />
            <RevealDateCard locale={locale} />
            <CountCard locale={locale} />
            {wedding.events.map((e, i) => (
              <React.Fragment key={e.id}>
                <Event e={e} i={i} locale={locale} />
                <EventSchedule eventId={e.id as 'mehndi' | 'baraat' | 'waleema'} locale={locale} />
              </React.Fragment>
            ))}
            <RSVP locale={locale} />
            <Closing locale={locale} />
          </div>
        </div>
      )}
    </main>
  );
}
