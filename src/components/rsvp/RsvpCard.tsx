'use client';

import React, { useEffect, useRef, useState } from 'react';
import { theme } from '@/config/theme';
import { wedding } from '@/config/wedding';
import { rsvpService } from '@/services/rsvp';
import { type Locale } from '@/config/translations';
import { Card, Ornament } from '@/components/shared/Ornament';
import { openWhatsAppChat } from '@/utils/whatsapp';

const RSVP_BG = 'linear-gradient(180deg, #1A0A0E 0%, #14060a 55%, #0E0508 100%)';
const RSVP_INK = '#F7F1E8';
const RSVP_MUTED = 'rgba(247, 241, 232, 0.72)';
const RSVP_LINE = 'rgba(212, 175, 87, 0.35)';
const RSVP_FIELD = 'rgba(255, 248, 238, 0.08)';

export default function RsvpCard({ locale }: { locale: Locale }) {
  const isRtl = locale === 'ur';
  const savedScroll = useRef<number | null>(null);
  const resumeTimer = useRef<number | null>(null);
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

  const pauseSnapForTyping = () => {
    const main = getMain();
    if (!main) return;
    if (resumeTimer.current != null) {
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    savedScroll.current = main.scrollTop;
    setSnapEnabled(false);
  };

  const resumeSnapSoon = () => {
    if (resumeTimer.current != null) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      const section = document.getElementById('rsvp-section');
      const active = document.activeElement;
      if (
        section &&
        (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) &&
        section.contains(active)
      ) {
        return;
      }
      savedScroll.current = null;
      setSnapEnabled(true);
      resumeTimer.current = null;
    }, 280);
  };

  /** Autofill can yank scroll; only undo large jumps — never block intentional scrolling. */
  const correctAutofillJump = () => {
    const main = getMain();
    if (!main || savedScroll.current == null) return;
    const saved = savedScroll.current;
    const undo = () => {
      if (Math.abs(main.scrollTop - saved) > 140) main.scrollTop = saved;
    };
    undo();
    requestAnimationFrame(undo);
    window.setTimeout(undo, 40);
  };

  useEffect(() => {
    const section = document.getElementById('rsvp-section');
    if (!section) return;

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      pauseSnapForTyping();
    };

    const onFocusOut = () => resumeSnapSoon();

    const onAnyEdit = () => {
      pauseSnapForTyping();
      correctAutofillJump();
    };

    section.addEventListener('focusin', onFocusIn);
    section.addEventListener('focusout', onFocusOut);
    section.addEventListener('input', onAnyEdit, true);
    section.addEventListener('change', onAnyEdit, true);

    return () => {
      section.removeEventListener('focusin', onFocusIn);
      section.removeEventListener('focusout', onFocusOut);
      section.removeEventListener('input', onAnyEdit, true);
      section.removeEventListener('change', onAnyEdit, true);
      if (resumeTimer.current != null) window.clearTimeout(resumeTimer.current);
      savedScroll.current = null;
      setSnapEnabled(true);
    };
  }, []);

  const chooseAttendance = (val: 'yes' | 'no') => {
    // Expanding/collapsing the form must never leave scroll frozen.
    savedScroll.current = null;
    setSnapEnabled(false);
    setResponse(val);
  };

  const toggleEvent = (id: string) => {
    savedScroll.current = null;
    setSnapEnabled(false);
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
    openWhatsAppChat(wedding.whatsapp.contactNumber, getWhatsAppMessage(data));
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
    // Open WhatsApp before any await — Android (Redmi) drops the gesture after async work.
    openWhatsAppChat(wedding.whatsapp.contactNumber, getWhatsAppMessage(payload));
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    savedScroll.current = null;
    setSnapEnabled(true);
    setSubmittedData(payload);
    try {
      await rsvpService.submit({ ...payload, guests: Number(payload.guests) });
    } catch {
      // Local save failure should not block WhatsApp.
    }
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.65 },
        colors: [theme.colors.gold, '#FFF2CE', theme.colors.goldSoft],
      });
    } catch {
      // ignore
    }
  }

  const eventsList = [
    { id: 'mehndi', labelEn: 'Mehndi (12 Jan)', labelUr: 'مہندی — ۱۲ جنوری', color: theme.events.mehndi.accent },
    { id: 'baraat', labelEn: 'Baraat (13 Jan)', labelUr: 'بارات — ۱۳ جنوری', color: theme.events.baraat.accent },
    { id: 'waleema', labelEn: 'Waleema (14 Jan)', labelUr: 'ولیمہ — ۱۴ جنوری', color: theme.events.waleema.accent },
  ];
  const topEvents = eventsList.filter((e) => e.id === 'mehndi' || e.id === 'baraat');
  const waleemaEvent = eventsList.find((e) => e.id === 'waleema')!;

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 14,
    border: `1px solid ${RSVP_LINE}`,
    background: RSVP_FIELD,
    color: RSVP_INK,
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
    color: theme.colors.goldSoft,
    marginBottom: 6,
    fontWeight: 600,
    fontFamily: isRtl ? "'Amiri', serif" : undefined,
    lineHeight: isRtl ? 1.7 : undefined,
    textAlign: 'center',
  };

  const eventBtnStyle = (on: boolean, color: string): React.CSSProperties => ({
    padding: '11px 12px',
    borderRadius: 12,
    border: on ? `1.5px solid ${color}` : `1px solid ${RSVP_LINE}`,
    background: on ? `${color}33` : RSVP_FIELD,
    color: RSVP_INK,
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: isRtl ? 13 : 13,
    minHeight: 42,
    fontFamily: isRtl ? "'Amiri', serif" : undefined,
  });

  return (
    <Card
      className="rsvp"
      id="rsvp-section"
      style={{
        background: RSVP_BG,
        borderTop: `1px solid ${RSVP_LINE}`,
        width: '100%',
        padding: '40px 22px max(72px, calc(env(safe-area-inset-bottom, 0px) + 40px))',
        position: 'relative',
        overflow: 'visible',
        color: RSVP_INK,
        justifyContent: 'flex-start',
      }}
    >
      <div style={{ width: '100%', maxWidth: 380, margin: '0 auto' }}>
        <p
          className="eyebrow"
          style={{
            color: theme.colors.goldSoft,
            letterSpacing: isRtl ? '0.1em' : '0.28em',
            marginBottom: 8,
            fontFamily: isRtl ? "'Amiri', serif" : undefined,
          }}
        >
          {isRtl ? 'آپ کی تشریف آوری' : 'R.S.V.P.'}
        </p>
        <h2
          style={{
            color: RSVP_INK,
            margin: '6px 0 10px',
            lineHeight: isRtl ? 1.7 : 1.15,
            fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
          }}
        >
          {submittedData
            ? isRtl
              ? (
                <>
                  شکریہ، عزیز مہمان
                  <em style={{ color: theme.colors.goldSoft, display: 'block', fontStyle: 'normal', fontSize: '0.78em', marginTop: 6 }}>
                    آپ کا جواب محفوظ ہو گیا
                  </em>
                </>
              )
              : (
                <>
                  Thank you, dear guest
                  <em style={{ color: theme.colors.goldSoft, display: 'block', fontStyle: 'italic', fontSize: '0.78em', marginTop: 4 }}>
                    Your response is saved — WhatsApp is ready to send
                  </em>
                </>
              )
            : isRtl
              ? (
                <>
                  کیا آپ تشریف لائیں گے؟
                  <em style={{ color: theme.colors.goldSoft, display: 'block', fontStyle: 'normal', fontSize: '0.78em', marginTop: 6 }}>
                    براہِ کرم اپنا جواب بھیجیں
                  </em>
                </>
              )
              : (
                <>
                  Will you join us?
                  <em style={{ color: theme.colors.goldSoft, display: 'block', fontStyle: 'italic', fontSize: '0.78em', marginTop: 4 }}>
                    A moment to confirm your presence
                  </em>
                </>
              )}
        </h2>
        <Ornament color={theme.colors.goldSoft} />

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
              textAlign: 'center',
              overflowAnchor: 'none',
            }}
          >
            <div>
              <label style={labelStyle}>{isRtl ? 'نام یا خاندانی نام' : 'YOUR NAME'} *</label>
              <input
                name="name"
                autoComplete="name"
                required
                value={guestName}
                onFocus={() => pauseSnapForTyping()}
                onChange={(e) => {
                  pauseSnapForTyping();
                  setGuestName(e.target.value);
                  correctAutofillJump();
                }}
                placeholder={isRtl ? 'اپنا نام...' : 'Enter your name...'}
                style={fieldStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>{isRtl ? 'شرکت کی تصدیق' : 'WILL YOU ATTEND?'} *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['yes', 'no'] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => chooseAttendance(val)}
                    style={{
                      padding: '12px 12px',
                      borderRadius: 14,
                      border:
                        response === val
                          ? `1.5px solid ${theme.colors.gold}`
                          : `1px solid ${RSVP_LINE}`,
                      background:
                        response === val
                          ? val === 'yes'
                            ? 'linear-gradient(135deg, #E0C075, #C6A15B)'
                            : 'rgba(184,116,116,0.28)'
                          : RSVP_FIELD,
                      color: response === val && val === 'yes' ? '#1A0A0E' : RSVP_INK,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      minHeight: 46,
                      fontFamily: isRtl ? "'Amiri', serif" : undefined,
                    }}
                  >
                    {val === 'yes'
                      ? isRtl
                        ? '✓ خوشی سے شرکت'
                        : '✓ Joyfully Attend'
                      : isRtl
                        ? '✕ معذرت'
                        : '✕ Regretfully Decline'}
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
                    autoComplete="off"
                    min={1}
                    max={8}
                    value={guestCount}
                    onFocus={() => pauseSnapForTyping()}
                    onChange={(e) => {
                      pauseSnapForTyping();
                      setGuestCount(e.target.value);
                      correctAutofillJump();
                    }}
                    placeholder="1"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 8 }}>{isRtl ? 'تقریبات' : 'WHICH EVENTS?'}</label>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                        width: '100%',
                        maxWidth: 340,
                      }}
                    >
                      {topEvents.map((ev) => {
                        const on = selectedEvents.includes(ev.id);
                        return (
                          <button key={ev.id} type="button" onClick={() => toggleEvent(ev.id)} style={eventBtnStyle(on, ev.color)}>
                            {isRtl ? ev.labelUr : ev.labelEn}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleEvent(waleemaEvent.id)}
                      style={{
                        ...eventBtnStyle(selectedEvents.includes(waleemaEvent.id), waleemaEvent.color),
                        width: '100%',
                        maxWidth: 168,
                      }}
                    >
                      {isRtl ? waleemaEvent.labelUr : waleemaEvent.labelEn}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>{isRtl ? 'پیغام (اختیاری)' : 'A NOTE FOR THE COUPLE'}</label>
              <textarea
                name="message"
                autoComplete="off"
                value={guestMessage}
                onFocus={() => pauseSnapForTyping()}
                onChange={(e) => {
                  pauseSnapForTyping();
                  setGuestMessage(e.target.value);
                  correctAutofillJump();
                }}
                rows={2}
                placeholder={isRtl ? 'دعائیں یا پیغام...' : 'Optional dua or wishes...'}
                style={{ ...fieldStyle, resize: 'none' }}
              />
            </div>

            <p style={{ margin: '2px 0 0', color: RSVP_MUTED, fontSize: 12, lineHeight: 1.5 }}>
              {isRtl
                ? 'تصدیق پر واٹس ایپ کھل جائے گا — صرف بھیجیں دبائیں'
                : 'On confirm, WhatsApp opens with your RSVP — just tap Send'}
            </p>

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
                background:
                  !response || !guestName.trim()
                    ? 'rgba(255,248,238,0.12)'
                    : `linear-gradient(135deg, ${theme.colors.goldSoft}, ${theme.colors.gold})`,
                color: !response || !guestName.trim() ? RSVP_MUTED : '#1A0A0E',
                fontWeight: 700,
                letterSpacing: '0.12em',
                cursor: !response || !guestName.trim() ? 'not-allowed' : 'pointer',
                minHeight: 48,
                boxShadow: '0 8px 22px rgba(0,0,0,0.28)',
                fontFamily: isRtl ? "'Amiri', serif" : undefined,
              }}
            >
              {isRtl ? 'تصدیق کریں اور واٹس ایپ کھولیں' : 'Confirm & Open WhatsApp'}
            </button>
          </form>
        ) : (
          <div style={{ margin: '14px auto 0', textAlign: 'center' }}>
            <p style={{ color: RSVP_MUTED, fontSize: 14, lineHeight: 1.6, marginTop: 4 }}>
              {isRtl
                ? 'اگر واٹس ایپ نہ کھلا ہو تو دوبارہ کوشش کریں'
                : 'If WhatsApp did not open, tap below to try again'}
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
              {isRtl ? 'واٹس ایپ پر بھیجیں' : 'Open WhatsApp to Send'}
            </button>
            <button
              type="button"
              onClick={() => setSubmittedData(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.goldSoft,
                fontSize: 11,
                letterSpacing: '0.12em',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginTop: 12,
              }}
            >
              {isRtl ? 'جواب میں تبدیلی کریں' : 'Edit response'}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
