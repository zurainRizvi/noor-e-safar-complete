'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin } from 'lucide-react';
import { wedding, type WeddingEvent } from '@/config/wedding';
import { theme } from '@/config/theme';
import { t, type Locale } from '@/config/translations';
import { Card, Ornament } from '@/components/shared/Ornament';
import { Petals } from '@/components/shared/Petals';
import { BotanicalClimber, EventCornerOrnament, ScheduleBow, TopCanopyArch } from '@/components/events/Botanicals';
import { schedulesData } from '@/components/events/schedulesData';

function calendar(e: WeddingEvent) {
  const d = e.date.replaceAll('-', '');
  const h = e.time.startsWith('4') ? '110000' : e.time.startsWith('6') ? '130000' : '140000';
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${d}T${h}Z`,
    `SUMMARY:${e.name} — Zurain & Abeeha`,
    `LOCATION:${e.address || e.venue}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${e.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function Blessing({ locale }: { locale: Locale }) {
  const isRtl = locale === 'ur';
  return (
    <Card
      className="ivory blessing"
      style={{
        background: theme.colors.card,
        color: theme.colors.ink,
        borderTop: `1px solid ${theme.colors.goldLine}`,
        padding: '56px 26px',
      }}
    >
      <Petals tone="red-white" amount={22} />
      <p className="eyebrow" style={{ color: theme.colors.gold }}>
        {isRtl ? 'اللہ کے نام سے' : 'IN THE NAME OF ALLAH'}
      </p>
      <p className="arabic" style={{ color: theme.colors.ink, margin: '12px 0', fontSize: 28, lineHeight: 1.9, fontFamily: "'Amiri', serif" }}>
        {wedding.invitation.arabic}
      </p>
      <Ornament />
      <h2 style={{ color: theme.colors.ink, margin: '14px 0 10px', fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif" }}>
        {isRtl ? 'محبت سے آغاز' : 'With love, we begin.'}
      </h2>
      <p className="copy" style={{ color: theme.colors.inkSoft, maxWidth: 330, margin: '0 auto', fontSize: 17, lineHeight: 1.7 }}>
        {isRtl
          ? 'اللہ کے نام سے ہم ایک حسین سفر کا آغاز کرتے ہیں اور آپ کو اس لمحے میں شریک ہونے کی دعوت دیتے ہیں۔'
          : 'In the name of Allah, we begin a beautiful journey and invite you to share this precious moment with us.'}
      </p>
      <blockquote style={{ marginTop: 28, fontFamily: "'Amiri', serif", fontSize: 20, lineHeight: 2, color: theme.colors.ink }}>
        {wedding.invitation.verseArabic}
      </blockquote>
      <small style={{ display: 'block', marginTop: 10, color: theme.colors.muted, letterSpacing: '0.12em', fontSize: 10 }}>
        {wedding.invitation.verseReference}
      </small>
    </Card>
  );
}

export function Countdown({ locale }: { locale: Locale }) {
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
    <Card
      className="count-card"
      style={{
        background: theme.colors.card,
        color: theme.colors.ink,
        borderTop: `1px solid ${theme.colors.goldLine}`,
        padding: '52px 24px',
      }}
    >
      <Petals tone="gold-white" amount={36} />
      <p className="eyebrow" style={{ color: theme.colors.gold }}>
        {locale === 'ur' ? 'ابدیت تک' : 'UNTIL FOREVER BEGINS'}
      </p>
      <h2 style={{ color: theme.colors.ink, margin: '8px 0 18px', fontFamily: "'Cormorant Garamond', serif" }}>
        {locale === 'ur' ? 'دن گن رہے ہیں۔' : 'Counting the days.'}
      </h2>
      <Ornament />
      <div className="count-grid" style={{ borderColor: theme.colors.goldLine, marginTop: 18 }}>
        {v.map((n, i) => (
          <span key={i} style={{ borderColor: theme.colors.goldLine }}>
            <strong style={{ color: theme.colors.gold }}>{String(n).padStart(2, '0')}</strong>
            <small style={{ color: theme.colors.muted }}>{labels[i]}</small>
          </span>
        ))}
      </div>
    </Card>
  );
}

export function EventCard({ e, i, locale }: { e: WeddingEvent; i: number; locale: Locale }) {
  const isRtl = locale === 'ur';
  const n = { mehndi: ['Mehndi', 'مہندی'], baraat: ['Baraat', 'بارات'], waleema: ['Waleema', 'ولیمہ'] }[e.id];
  const s = {
    mehndi: ['an evening of colour', 'رنگوں بھری شام'],
    baraat: ['the royal celebration', 'شاہانہ تقریب'],
    waleema: ['a moonlit gathering', 'چاندنی محفل'],
  }[e.id];
  const date = new Date(e.date + 'T12:00:00');
  const dayName =
    locale === 'ur'
      ? ({ Tuesday: 'منگل', Wednesday: 'بدھ', Thursday: 'جمعرات', Friday: 'جمعہ' } as const)[e.day as 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday']
      : e.day;
  const ev = theme.events[e.id];

  return (
    <Card
      className={`event ${e.id}`}
      style={{
        background: ev.bg,
        borderTop: `1px solid ${ev.border}`,
        borderBottom: `1px solid ${ev.border}`,
        color: theme.colors.ink,
        position: 'relative',
        overflow: 'hidden',
        padding: '136px 28px 84px',
      }}
    >
      <BotanicalClimber type={e.id} />
      <Petals amount={16} tone={e.id} />
      <EventCornerOrnament type={e.id} isRtl={isRtl} />
      <p className="eyebrow" style={{ color: theme.colors.gold, position: 'relative', zIndex: 2 }}>
        0{i + 1} · {isRtl ? n[1] : n[0].toUpperCase()}
      </p>
      <h2 style={{ color: theme.colors.ink, position: 'relative', zIndex: 2, margin: '10px 0' }}>
        {isRtl ? n[1] : n[0]}
        <em style={{ color: ev.accent, display: 'block', fontSize: '0.55em', marginTop: 10, fontStyle: isRtl ? 'normal' : 'italic' }}>
          {isRtl ? s[1] : s[0]}
        </em>
      </h2>
      <Ornament />
      <div className="date" style={{ position: 'relative', zIndex: 2, margin: '28px 0', justifyContent: 'center' }}>
        <strong style={{ color: theme.colors.ink, fontFamily: "'Cormorant Garamond', serif", fontSize: 88, lineHeight: 0.85 }}>
          {date.getDate()}
        </strong>
        <span style={{ textAlign: 'left', color: theme.colors.inkSoft }}>
          {dayName}
          <small style={{ display: 'block', marginTop: 6, letterSpacing: '0.18em', color: theme.colors.gold }}>
            {date.toLocaleString(locale === 'ur' ? 'ur-PK' : 'en-GB', { month: 'long' }).toUpperCase()} · {date.getFullYear()}
          </small>
        </span>
      </div>
      <p className="event-time" style={{ color: theme.colors.gold, position: 'relative', zIndex: 2 }}>
        {isRtl ? e.day : e.day} · {e.time}
      </p>
      <div className="venue" style={{ color: theme.colors.inkSoft, position: 'relative', zIndex: 2 }}>
        <MapPin size={16} color={theme.colors.gold} />
        <span>
          {e.venue}
          {e.address ? (
            <>
              <br />
              {e.address}
            </>
          ) : null}
        </span>
      </div>
      <div className="actions" style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
        <a href={e.mapUrl} target="_blank" rel="noreferrer" className="btn soft">
          {t(locale, 'maps')}
        </a>
        <button type="button" className="btn soft" onClick={() => calendar(e)}>
          <CalendarDays size={14} /> {t(locale, 'calendar')}
        </button>
      </div>
    </Card>
  );
}

export function EventSchedule({ eventId, locale }: { eventId: 'mehndi' | 'baraat' | 'waleema'; locale: Locale }) {
  const data = schedulesData[eventId];
  const isRtl = locale === 'ur';
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const ev = theme.events[eventId];

  return (
    <Card
      className={`event-schedule ${eventId}`}
      style={{
        background: ev.bg,
        borderTop: `1px solid ${ev.border}`,
        position: 'relative',
        overflow: 'hidden',
        textAlign: isRtl ? 'right' : 'left',
        padding: '136px 28px 88px',
        color: theme.colors.ink,
      }}
    >
      <TopCanopyArch type={eventId} />
      <Petals amount={14} tone={eventId} />
      <ScheduleBow id={eventId} isRtl={isRtl} />

      <div style={{ width: '100%', textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 2 }}>
        <p className="eyebrow" style={{ color: theme.colors.gold, letterSpacing: '0.3em' }}>
          {isRtl ? 'تقریب کا شیڈول' : 'EVENT TIMELINE'}
        </p>
        <h2 style={{ color: theme.colors.ink, margin: '8px 0 14px' }}>
          {isRtl ? data.nameUr : data.nameEn}
          <em style={{ color: theme.colors.gold, fontStyle: 'italic', display: 'block', fontSize: '0.65em', marginTop: 6 }}>
            {isRtl ? 'کا شیڈول' : 'Schedule'}
          </em>
        </h2>
        <Ornament />
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 380,
          margin: '0 auto',
          paddingLeft: isRtl ? 0 : 36,
          paddingRight: isRtl ? 36 : 0,
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 12,
            bottom: 24,
            left: isRtl ? 'auto' : 10,
            right: isRtl ? 10 : 'auto',
            width: 2,
            background: `linear-gradient(180deg, ${theme.colors.gold} 0%, rgba(198,161,91,0.2) 100%)`,
          }}
        />
        {data.items.map((item, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: idx * 0.1 }}
              onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
              style={{
                position: 'relative',
                marginBottom: idx === data.items.length - 1 ? 0 : 20,
                cursor: 'pointer',
                padding: '10px 14px',
                borderRadius: 14,
                background: isSelected ? 'rgba(198,161,91,0.12)' : 'transparent',
                border: isSelected ? `1px solid ${theme.colors.goldLine}` : '1px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  left: isRtl ? 'auto' : -33,
                  right: isRtl ? -33 : 'auto',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: isSelected ? theme.colors.gold : theme.colors.cardSolid,
                  border: `2px solid ${theme.colors.gold}`,
                }}
              />
              <span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: theme.colors.gold, marginBottom: 4 }}>
                {isRtl ? item.timeUr : item.timeEn}
              </span>
              <h3
                style={{
                  margin: '0 0 4px',
                  fontSize: isRtl ? 22 : 24,
                  color: theme.colors.ink,
                  fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
                  lineHeight: isRtl ? 1.55 : 1.2,
                }}
              >
                {isRtl ? item.titleUr : item.titleEn}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: theme.colors.inkSoft, lineHeight: isRtl ? 1.75 : 1.45 }}>
                {isRtl ? item.descUr : item.descEn}
              </p>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
