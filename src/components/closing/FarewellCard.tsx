'use client';

import React from 'react';
import { theme } from '@/config/theme';
import { Card, Ornament } from '@/components/shared/Ornament';
import { Petals } from '@/components/shared/Petals';
import { BotanicalClimber } from '@/components/events/Botanicals';
import type { Locale } from '@/config/translations';

const PAGE_BG = 'linear-gradient(180deg, #1A0A0E 0%, #14060a 55%, #0E0508 100%)';
const ACCENT = theme.colors.blush;
const ACCENT_DEEP = theme.colors.blushDeep;

/** Closing farewell note — sits before the final video + RSVP. */
export default function FarewellCard({ locale }: { locale: Locale }) {
  const isRtl = locale === 'ur';

  return (
    <Card
      className="farewell"
      id="farewell-section"
      style={{
        background: PAGE_BG,
        borderTop: `1px solid ${theme.colors.blushLine}`,
        width: '100%',
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
        color: theme.colors.ink,
        justifyContent: 'flex-start',
      }}
    >
      <BotanicalClimber type="baraat" />
      <Petals tone="red-white" amount={24} />

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
          justifyContent: 'center',
          padding:
            isRtl
              ? 'clamp(108px, 16vh, 132px) 28px max(36px, calc(env(safe-area-inset-bottom, 0px) + 24px))'
              : 'clamp(112px, 15.5vh, 136px) 30px max(36px, calc(env(safe-area-inset-bottom, 0px) + 24px))',
        }}
      >
        <div
          style={{
            maxWidth: 340,
            width: '100%',
            textAlign: 'center',
            padding: isRtl ? '26px 20px 28px' : '28px 22px 26px',
            borderRadius: 20,
            background: theme.colors.creamGlass,
            border: `1px solid ${theme.colors.blushLine}`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            color: theme.colors.ink,
          }}
        >
          <p
            className="arabic"
            style={{
              fontSize: 'clamp(20px, 5.4vw, 24px)',
              lineHeight: 2,
              color: theme.colors.ink,
              margin: '0 0 8px',
              fontFamily: "'Amiri', serif",
            }}
          >
            بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
          </p>
          <Ornament color={ACCENT} />
          <h2
            style={{
              fontSize: isRtl ? 'clamp(24px, 6.5vw, 30px)' : 'clamp(26px, 7vw, 32px)',
              lineHeight: isRtl ? 1.55 : 1.2,
              margin: '10px 0 0',
              fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
              fontWeight: 500,
            }}
          >
            {isRtl ? (
              <>
                <span>آپ کی آمد، </span>
                <em
                  style={{
                    color: ACCENT_DEEP,
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontFamily: "'Amiri', serif",
                  }}
                >
                  ہماری خوشی۔
                </em>
              </>
            ) : (
              <>
                <span>Your presence, </span>
                <em
                  style={{
                    color: ACCENT_DEEP,
                    fontStyle: 'italic',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  our joy.
                </em>
              </>
            )}
          </h2>
          <p
            style={{
              margin: isRtl ? '12px 0 0' : '14px 0 0',
              fontSize: isRtl ? 15 : 14,
              lineHeight: isRtl ? 1.85 : 1.55,
              color: theme.colors.inkSoft,
              fontFamily: isRtl ? "'Amiri', serif" : "'DM Sans', sans-serif",
              fontWeight: isRtl ? 400 : 500,
              maxWidth: 300,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {isRtl
              ? 'ہم اپنے تمام عزیز خاندان اور پیاروں کی آمد کے منتظر ہیں تاکہ ہمارا جشن مکمل ہو۔'
              : 'Awaiting the presence of all our beloved family members and loved ones to make our celebration complete.'}
          </p>
        </div>
      </div>
    </Card>
  );
}
