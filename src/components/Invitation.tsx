'use client';

import React, { useRef, useState } from 'react';
import { Music2, VolumeX } from 'lucide-react';
import { wedding } from '@/config/wedding';
import { theme } from '@/config/theme';
import { type Locale } from '@/config/translations';
import OpeningStage from '@/components/intro/OpeningStage';
import ScratchReveal from '@/components/reveal/ScratchReveal';
import { Blessing, Countdown, EventCard, EventSchedule } from '@/components/events/EventSections';
import RsvpCard from '@/components/rsvp/RsvpCard';
import ClosingStage from '@/components/closing/ClosingStage';

export default function Invitation() {
  const [locale, setLocale] = useState<Locale>('en');
  const [playing, setPlaying] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  const startMusic = () => {
    if (!audio.current) return;
    audio.current.currentTime = 65;
    audio.current.play().then(() => setPlaying(true)).catch(() => {});
  };

  const handleAudioTimeUpdate = () => {
    if (!audio.current) return;
    if (audio.current.currentTime >= 85 || audio.current.currentTime < 65) {
      audio.current.currentTime = 65;
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
    <main dir={locale === 'ur' ? 'rtl' : 'ltr'} style={{ background: theme.colors.page, color: theme.colors.ink }}>
      <audio ref={audio} src={wedding.musicPath} onTimeUpdate={handleAudioTimeUpdate} preload="metadata" />

      <OpeningStage
        locale={locale}
        onBegin={() => {
          startMusic();
          setContentReady(true);
        }}
      />

      {contentReady && (
        <div style={{ position: 'relative', zIndex: 2, width: '100%', background: theme.colors.page }}>
          <div className="controls">
            <button type="button" onClick={music} aria-label={playing ? 'Mute music' : 'Play music'}>
              {playing ? <Music2 /> : <VolumeX />}
            </button>
            <button type="button" onClick={() => setLocale(locale === 'en' ? 'ur' : 'en')}>
              {locale === 'en' ? 'اردو' : 'EN'}
            </button>
          </div>

          <Blessing locale={locale} />
          <ScratchReveal locale={locale} />
          <Countdown locale={locale} />
          {wedding.events.map((e, i) => (
            <React.Fragment key={e.id}>
              <EventCard e={e} i={i} locale={locale} />
              <EventSchedule eventId={e.id} locale={locale} />
            </React.Fragment>
          ))}
          <RsvpCard locale={locale} />
          <ClosingStage locale={locale} />
        </div>
      )}
    </main>
  );
}
