'use client';

import React, { useState } from 'react';
import { theme } from '@/config/theme';
import { rsvpService } from '@/services/rsvp';
import { type Locale } from '@/config/translations';
import { Card, Ornament } from '@/components/shared/Ornament';

export default function RsvpCard({ locale }: { locale: Locale }) {
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
      if (selectedEvents.length > 1) setSelectedEvents(selectedEvents.filter((e) => e !== id));
    } else {
      setSelectedEvents([...selectedEvents, id]);
    }
  };

  const getWhatsAppMessage = (data: NonNullable<typeof submittedData>) => {
    const isAttending = data.response === 'yes';
    const eventMap: Record<string, string> = {
      mehndi: 'Mehndi (12th Jan)',
      baraat: 'Baraat & Nikkah (14th Jan)',
      waleema: 'Waleema (15th Jan)',
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
    setSubmittedData(payload);
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({ particleCount: 100, spread: 75, origin: { y: 0.65 }, colors: [theme.colors.gold, '#FFF2CE', '#7BA874'] });
    } catch {
      // ignore
    }
  }

  const eventsList = [
    { id: 'mehndi', labelEn: 'Mehndi (12 Jan)', labelUr: 'مہندی (۱۲ جنوری)', color: theme.events.mehndi.accent },
    { id: 'baraat', labelEn: 'Baraat (14 Jan)', labelUr: 'بارات و نکاح (۱۴ جنوری)', color: theme.events.baraat.accent },
    { id: 'waleema', labelEn: 'Waleema (15 Jan)', labelUr: 'ولیمہ (۱۵ جنوری)', color: theme.events.waleema.accent },
  ];

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: 16,
    border: `1px solid ${theme.colors.goldLine}`,
    background: theme.colors.cardSolid,
    color: theme.colors.ink,
    textAlign: 'center',
    fontSize: 14,
    outline: 'none',
  };

  return (
    <Card
      className="rsvp"
      id="rsvp-section"
      style={{
        background: theme.colors.card,
        borderTop: `1px solid ${theme.colors.goldLine}`,
        width: '100%',
        padding: '50px 24px',
        position: 'relative',
        overflow: 'hidden',
        color: theme.colors.ink,
      }}
    >
      <p className="eyebrow" style={{ color: theme.colors.gold, letterSpacing: '0.28em', marginBottom: 8 }}>
        {isRtl ? 'آپ کی تشریف آوری' : 'R.S.V.P.'}
      </p>
      <h2
        style={{
          color: theme.colors.ink,
          margin: '6px 0 14px',
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
          style={{ width: '100%', maxWidth: 380, margin: '16px auto 0', display: 'flex', flexDirection: 'column', gap: 14, textAlign: isRtl ? 'right' : 'left' }}
        >
          <div>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.colors.gold, marginBottom: 6, fontWeight: 600 }}>
              {isRtl ? 'نام یا خاندانی نام' : 'FULL NAME OR FAMILY NAME'} *
            </label>
            <input name="name" required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={isRtl ? 'اپنا نام...' : 'Enter your name...'} style={fieldStyle} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.colors.gold, marginBottom: 6, fontWeight: 600 }}>
              {isRtl ? 'شرکت کی تصدیق' : 'ATTENDANCE CONFIRMATION'} *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['yes', 'no'] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setResponse(val)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 16,
                    border: response === val ? `1.5px solid ${theme.colors.gold}` : `1px solid ${theme.colors.goldLine}`,
                    background: response === val ? (val === 'yes' ? 'linear-gradient(135deg, #E0C075, #C6A15B)' : 'rgba(184,116,116,0.18)') : theme.colors.cardSolid,
                    color: response === val && val === 'yes' ? '#fff' : theme.colors.ink,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    minHeight: 48,
                  }}
                >
                  {val === 'yes' ? (isRtl ? '✓ خوشی سے شریک' : '✓ Joyfully Attend') : isRtl ? '✕ معذرت' : '✕ Regretfully Decline'}
                </button>
              ))}
            </div>
          </div>

          {response === 'yes' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.colors.gold, marginBottom: 6, fontWeight: 600 }}>
                  {isRtl ? 'مہمانوں کی تعداد' : 'NUMBER OF GUESTS'}
                </label>
                <input type="number" min={1} max={8} value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="1" style={fieldStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.colors.gold, marginBottom: 8, fontWeight: 600 }}>
                  {isRtl ? 'تقریبات' : 'EVENTS'}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {eventsList.map((ev) => {
                    const on = selectedEvents.includes(ev.id);
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => toggleEvent(ev.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 14,
                          border: on ? `1.5px solid ${ev.color}` : `1px solid ${theme.colors.goldLine}`,
                          background: on ? `${ev.color}22` : theme.colors.cardSolid,
                          color: theme.colors.ink,
                          textAlign: isRtl ? 'right' : 'left',
                          cursor: 'pointer',
                          fontSize: 14,
                          minHeight: 44,
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
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: theme.colors.gold, marginBottom: 6, fontWeight: 600 }}>
              {isRtl ? 'پیغام (اختیاری)' : 'OPTIONAL MESSAGE'}
            </label>
            <textarea value={guestMessage} onChange={(e) => setGuestMessage(e.target.value)} rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
          </div>

          <button
            type="submit"
            disabled={!response || !guestName.trim()}
            style={{
              marginTop: 4,
              padding: '14px 20px',
              borderRadius: 999,
              border: 'none',
              background: !response || !guestName.trim() ? theme.colors.sand : `linear-gradient(135deg, ${theme.colors.goldSoft}, ${theme.colors.gold})`,
              color: !response || !guestName.trim() ? theme.colors.muted : '#fff',
              fontWeight: 700,
              letterSpacing: '0.12em',
              cursor: !response || !guestName.trim() ? 'not-allowed' : 'pointer',
              minHeight: 48,
            }}
          >
            {isRtl ? 'جواب بھیجیں' : 'Confirm RSVP'}
          </button>
        </form>
      ) : (
        <div style={{ maxWidth: 380, margin: '18px auto 0', textAlign: 'center' }}>
          <Ornament />
          <p style={{ color: theme.colors.inkSoft, fontSize: 14, lineHeight: 1.6 }}>
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
    </Card>
  );
}
