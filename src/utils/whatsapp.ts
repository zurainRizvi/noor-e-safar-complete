function digitsOnly(phoneDigits: string) {
  return phoneDigits.replace(/[^\d]/g, '');
}

function isAndroidUa() {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
}

/** HTTPS click-to-chat (iOS + desktop). */
export function buildWhatsAppHttpsUrl(phoneDigits: string, message: string) {
  const phone = digitsOnly(phoneDigits);
  const text = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
}

/** Native scheme — opens the WhatsApp app when the browser allows custom schemes. */
export function buildWhatsAppAppUrl(phoneDigits: string, message: string) {
  const phone = digitsOnly(phoneDigits);
  const text = encodeURIComponent(message);
  return `whatsapp://send?phone=${phone}&text=${text}`;
}

/**
 * Chrome/MIUI Intent URI — launches WhatsApp without loading a Chrome tab.
 * No package= lock so personal WhatsApp, Business, or Dual Apps can resolve.
 */
export function buildWhatsAppIntentUrl(phoneDigits: string, message: string) {
  const phone = digitsOnly(phoneDigits);
  const text = encodeURIComponent(message);
  // Fallback only if no WhatsApp app can handle the intent.
  const fallback = encodeURIComponent(buildWhatsAppHttpsUrl(phone, message));
  return `intent://send/?phone=${phone}&text=${text}#Intent;scheme=whatsapp;S.browser_fallback_url=${fallback};end`;
}

/** Platform-aware href if you need a plain <a>. */
export function buildWhatsAppChatUrl(phoneDigits: string, message: string) {
  if (isAndroidUa()) return buildWhatsAppIntentUrl(phoneDigits, message);
  return buildWhatsAppHttpsUrl(phoneDigits, message);
}

/**
 * Open WhatsApp with a prefilled message from a direct user tap.
 * Android opens the app via Intent / whatsapp:// — not a Chrome wa.me page.
 */
export function openWhatsAppChat(phoneDigits: string, message: string) {
  if (typeof window === 'undefined') return;

  if (!isAndroidUa()) {
    // Same-window HTTPS — iOS hands this to the WhatsApp app.
    window.location.href = buildWhatsAppHttpsUrl(phoneDigits, message);
    return;
  }

  const appUrl = buildWhatsAppAppUrl(phoneDigits, message);
  const intentUrl = buildWhatsAppIntentUrl(phoneDigits, message);

  let leftPage = false;
  const onLeave = () => {
    leftPage = true;
  };
  document.addEventListener('visibilitychange', onLeave, { once: true });
  window.addEventListener('pagehide', onLeave, { once: true });
  window.addEventListener('blur', onLeave, { once: true });

  // location.href keeps the tap gesture; never target=_blank (Chrome tab bounce on Redmi).
  window.location.href = intentUrl;

  // If Intent was ignored, try the native scheme once more (still same window).
  window.setTimeout(() => {
    if (leftPage || document.visibilityState === 'hidden') return;
    window.location.href = appUrl;
  }, 400);
}
