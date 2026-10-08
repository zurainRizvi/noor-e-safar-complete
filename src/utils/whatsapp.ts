/** Official click-to-chat URL (works on iOS, Android Chrome, MIUI, Samsung, desktop). */
export function buildWhatsAppChatUrl(phoneDigits: string, message: string) {
  const phone = phoneDigits.replace(/[^\d]/g, '');
  const text = encodeURIComponent(message);
  // wa.me is WhatsApp's supported universal link. Prefer it over intent:// —
  // Redmi/MIUI often blocks package-locked intents (and WhatsApp Business /
  // Dual Apps breaks package=com.whatsapp).
  return `https://wa.me/${phone}?text=${text}`;
}

/**
 * Open WhatsApp with a prefilled message.
 * Prefer calling this from a real user tap, or better: use an <a href={buildWhatsAppChatUrl(...)}>.
 */
export function openWhatsAppChat(phoneDigits: string, message: string) {
  const url = buildWhatsAppChatUrl(phoneDigits, message);
  if (typeof document === 'undefined') return;

  // Synchronous <a> click keeps the user-gesture chain on Android Chrome / MIUI.
  // window.location / window.open to intent:// is frequently blocked on Redmi.
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
