'use client';

import React, { useEffect, useRef, useState } from 'react';
import { theme } from '@/config/theme';
import { rsvpService } from '@/services/rsvp';
import { type Locale } from '@/config/translations';
import { Card, Ornament } from '@/components/shared/Ornament';

export default function RsvpCard({ locale }: { locale: Locale }) {
  const isRtl = locale === 'ur';
  const savedMainScroll = useRef<number | null>(null);
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

  const getMain = () => document.querySelector('main');

  const setSnapEnabled = (enabled: boolean) => {
    const main = getMain();
    if (!main) return;
    main.classList.toggle('snap-paused', !enabled);
  };

  const preserveMainScroll = () => {
    const main = getMain();
    if (!main) return;
    const top = savedMainScroll.current ?? main.scrollTop;
    savedMainScroll.current = top;
    const restore = () => {
      main.scrollTop = top;
    };
    restore();
    requestAnimationFrame(restore);
    setTimeout(restore, 0);
    setTimeout(restore, 50);
    setTimeout(restore, 150);
  };

  useEffect(() => {
    const section = document.getElementById('rsvp-section');
    if (!section) return;

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      const main = getMain();
      if (main) savedMainScroll.current = main.scrollTop;
      setSnapEnabled(false);
      preserveMainScroll();
    };

    const onFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (
          (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) &&
          section.contains(active)
        ) {
          return;
        }
        setSnapEnabled(true);
      }, 180);
    };

    section.addEventListener('focusin', onFocusIn);
    section.addEventListener('focusout', onFocusOut);
    return () => {
      section.removeEventListener('focusin', onFocusIn);
      section.removeEventListener('focusout', onFocusOut);
      setSnapEnabled(true);
    };
  }, []);

  const toggleEvent = (id: string) => {
    if (selectedEvents.includes(id)) {
      if (selectedEvents.length > 1) setSelectedEvents(selectedEvents.filter((e) => e !== id));
    } else {
      setSelectedEvents([...selectedEvents, id]);
    }
  };

  const getWhatsAppMessage = (data: NonNullable<typeof submittedData>) => {
    const isAttending = data.response === 'yes';
    const eventMap: Record<string, string> = {
      mehndi: 'Mehndi (12th Jan)',
      baraat: 'Baraat (13th Jan)',
      waleema: 'Waleema (14th Jan)',
    };
    const eventList = isAttending ? data.events.map((e) => `  • ${eventMap[e] || e}`).join('\n') : '  • None';
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
    window.open(`https://wa.me/923053333409?text=${encodeURIComponent(getWhatsAppMessage(data))}`, '_blank');
  };

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!response || !guestName.trim()) return;
    const payload = {
      name: guestName.trim(),
      response,
      guests: response === 'yes' ? guestCount || '1' : '0',
      events: response === 'yes' ? selectedEvents : [],
      message: guestMessage.trim(),
      submittedAt: new Date().toISOString(),
    };
    await rsvpService.submit({ ...payload, guests: Number(payload.guests) });
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setSnapEnabled(true);
    setSubmittedData(payload);
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({ particleCount: 100, spread: 75, origin: { y: 0.65 }, colors: [theme.colors.gold, '#FFF2CE', '#7BA874'] });
    } catch {
      // ignore
    }
  }

  const eventsList = [
    { id: 'mehndi', labelEn: 'Mehndi (12 Jan)', labelUr: 'مہندی — ۱۲ جنوری', color: theme.events.mehndi.accent },
    { id: 'baraat', labelEn: 'Baraat (13 Jan)', labelUr: 'بارات — ۱۳ جنوری', color: theme.events.baraat.accent },
    { id: 'waleema', labelEn: 'Waleema (14 Jan)', labelUr: 'ولیمہ — ۱۴ جنوری', color: theme.events.waleema.accent },
  ];

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 14,
    border: `1px solid ${theme.colors.goldLine}`,
    background: theme.colors.cardSolid,
    color: theme.colors.ink,
    textAlign: 'center',
    fontSize: 16,
    outline: 'none',
    WebkitAppearance: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: isRtl ? 13 : 11,
    letterSpacing: isRtl ? '0.04em' : '0.14em',
    textTransform: isRtl ? 'none' : 'uppercase',
    color: theme.colors.gold,
    marginBottom: 6,
    fontWeight: 600,
    fontFamily: isRtl ? "'Amiri', serif" : undefined,
    lineHeight: isRtl ? 1.7 : undefined,
  };

  return (
    <Card
      className="rsvp"
      id="rsvp-section"
      style={{
        background: theme.colors.card,
        borderTop: `1px solid ${theme.colors.goldLine}`,
        width: '100%',
        padding: '36px 22px max(72px, calc(env(safe-area-inset-bottom, 0px) + 40px))',
        position: 'relative',
        overflow: 'visible',
        color: theme.colors.ink,
        justifyContent: 'flex-start',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, margin: '0 auto' }}>
        <p className="eyebrow" style={{ color: theme.colors.gold, letterSpacing: '0.28em', marginBottom: 8 }}>
          {isRtl ? 'آپ کی تشریف آوری' : 'R.S.V.P.'}
        </p>
        <h2
          style={{
            color: theme.colors.ink,
            margin: '6px 0 10px',
            lineHeight: isRtl ? 1.7 : 1.15,
            fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
          }}
        >
          {submittedData
            ? isRtl
              ? <>آپ کا شکریہ!<em style={{ color: theme.colors.gold, display: 'block', fontStyle: 'normal', fontSize: '0.8em', marginTop: 6 }}>ہمیں آپ کی آمد کا انتظار رہے گا</em></>
              : <>Thank You!<em style={{ color: theme.colors.gold, display: 'block', fontStyle: 'italic', fontSize: '0.78em', marginTop: 4 }}>Your response has been recorded</em></>
            : isRtl
              ? <>آپ کی شرکت<em style={{ color: theme.colors.gold, display: 'block', fontStyle: 'normal', fontSize: '0.8em', marginTop: 6 }}>ہماری خوشیوں کو دوبالا کرے گی</em></>
              : <>Will You Attend?<em style={{ color: theme.colors.gold, display: 'block', fontStyle: 'italic', fontSize: '0.78em', marginTop: 4 }}>Kindly let us know by your response</em></>}
        </h2>
        <Ornament />

        {!submittedData ? (
          <form
            onSubmit={handleSubmit}
            autoComplete="on"
            style={{
              width: '100%',
              margin: '12px auto 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              textAlign: isRtl ? 'right' : 'left',
              overflowAnchor: 'none',
            }}
          >
            <div>
              <label style={labelStyle}>{isRtl ? 'نام یا خاندانی نام' : 'FULL NAME OR FAMILY NAME'} *</label>
              <input
                name="name"
                autoComplete="name"
                required
                value={guestName}
                onFocus={() => {
                  const main = getMain();
                  if (main) savedMainScroll.current = main.scrollTop;
                  setSnapEnabled(false);
                }}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  preserveMainScroll();
                }}
                onInput={() => preserveMainScroll()}
                placeholder={isRtl ? 'اپنا نام...' : 'Enter your name...'}
                style={fieldStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>{isRtl ? 'شرکت کی تصدیق' : 'ATTENDANCE CONFIRMATION'} *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['yes', 'no'] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setResponse(val)}
                    style={{
                      padding: '12px 12px',
                      borderRadius: 14,
                      border: response === val ? `1.5px solid ${theme.colors.gold}` : `1px solid ${theme.colors.goldLine}`,
                      background: response === val ? (val === 'yes' ? 'linear-gradient(135deg, #E0C075, #C6A15B)' : 'rgba(184,116,116,0.18)') : theme.colors.cardSolid,
                      color: response === val && val === 'yes' ? '#fff' : theme.colors.ink,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      minHeight: 46,
                    }}
                  >
                    {val === 'yes' ? (isRtl ? '✓ خوشی سے شرکت' : '✓ Joyfully Attend') : isRtl ? '✕ معذرت' : '✕ Regretfully Decline'}
                  </button>
                ))}
              </div>
            </div>

            {response === 'yes' && (
              <>
                <div>
                  <label style={labelStyle}>{isRtl ? 'مہمانوں کی تعداد' : 'NUMBER OF GUESTS'}</label>
                  <input
                    type="number"
                    name="guests"
                    inputMode="numeric"
                    min={1}
                    max={8}
                    value={guestCount}
                    onFocus={() => setSnapEnabled(false)}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="1"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 8 }}>{isRtl ? 'تقریبات' : 'EVENTS'}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {eventsList.map((ev) => {
                      const on = selectedEvents.includes(ev.id);
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => toggleEvent(ev.id)}
                          style={{
                            padding: '11px 14px',
                            borderRadius: 12,
                            border: on ? `1.5px solid ${ev.color}` : `1px solid ${theme.colors.goldLine}`,
                            background: on ? `${ev.color}22` : theme.colors.cardSolid,
                            color: theme.colors.ink,
                            textAlign: isRtl ? 'right' : 'left',
                            cursor: 'pointer',
                            fontSize: 14,
                            minHeight: 42,
                          }}
                        >
                          {isRtl ? ev.labelUr : ev.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>{isRtl ? 'پیغام (اختیاری)' : 'OPTIONAL MESSAGE'}</label>
              <textarea
                name="message"
                value={guestMessage}
                onFocus={() => setSnapEnabled(false)}
                onChange={(e) => setGuestMessage(e.target.value)}
                rows={2}
                style={{ ...fieldStyle, resize: 'none' }}
              />
            </div>

            <button
              type="submit"
              className="rsvp-submit"
              disabled={!response || !guestName.trim()}
              style={{
                marginTop: 4,
                marginBottom: 8,
                padding: '14px 20px',
                borderRadius: 999,
                border: 'none',
                background: !response || !guestName.trim() ? theme.colors.sand : `linear-gradient(135deg, ${theme.colors.goldSoft}, ${theme.colors.gold})`,
                color: !response || !guestName.trim() ? theme.colors.muted : '#fff',
                fontWeight: 700,
                letterSpacing: '0.12em',
                cursor: !response || !guestName.trim() ? 'not-allowed' : 'pointer',
                minHeight: 48,
                position: 'sticky',
                bottom: 'max(12px, env(safe-area-inset-bottom, 0px))',
                zIndex: 5,
                boxShadow: '0 8px 22px rgba(61,52,41,0.14)',
              }}
            >
              {isRtl ? 'جواب بھیجیں' : 'Confirm RSVP'}
            </button>
          </form>
        ) : (
          <div style={{ margin: '14px auto 0', textAlign: 'center' }}>
            <p style={{ color: theme.colors.inkSoft, fontSize: 14, lineHeight: 1.6, marginTop: 4 }}>
              {isRtl ? 'واٹس ایپ پر بھی بھیجنا چاہیں گے؟' : 'Would you also like to send via WhatsApp?'}
            </p>
            <button
              type="button"
              onClick={() => sendToWhatsApp(submittedData)}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 24,
                border: 'none',
                background: '#25D366',
                color: '#fff',
                fontWeight: 700,
                marginTop: 10,
                cursor: 'pointer',
                minHeight: 48,
              }}
            >
              {isRtl ? 'واٹس ایپ پر بھیجیں' : 'Send via WhatsApp'}
            </button>
            <button
              type="button"
              onClick={() => setSubmittedData(null)}
              style={{ background: 'transparent', border: 'none', color: theme.colors.gold, fontSize: 11, letterSpacing: '0.12em', textDecoration: 'underline', cursor: 'pointer', marginTop: 12 }}
            >
              {isRtl ? 'جواب میں تبدیلی کریں' : 'Change / Update Response'}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
