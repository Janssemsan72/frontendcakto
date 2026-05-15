import { isExternalPaymentHostname } from '@/config/paymentCheckout';

/** Disparado quando o utilizador continua no checkout após tentativa de ir para Hotmart/Cakto. */
export const CHECKOUT_REDIRECT_RECOVERY = 'musiclovely:checkout-redirect-recovery';

let watchdogId: number | null = null;

/**
 * Sai do checkout externo (Hotmart/Cakto). Tenta `window.top` (iframes / in-app),
 * depois `<a target="_top">` e por fim `location.replace`.
 */
export function navigateToExternalPayment(url: string): void {
  try {
    const top = window.top;
    if (top && top !== window) {
      try {
        top.location.href = url;
        return;
      } catch {
        /* iframe cross-origin */
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_top';
    a.rel = 'nofollow noopener noreferrer';
    a.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    /* ignore */
  }

  try {
    window.location.replace(url);
  } catch {
    window.location.href = url;
  }
}

export function clearExternalCheckoutRecovery(): void {
  if (watchdogId != null) {
    clearTimeout(watchdogId);
    watchdogId = null;
  }
}

/**
 * Se, após `timeoutMs`, ainda estivermos no checkout interno, emite evento para
 * libertar o botão e mostrar link manual (WebViews móveis).
 */
export function scheduleExternalCheckoutRecovery(url: string, timeoutMs = 8000): void {
  clearExternalCheckoutRecovery();
  watchdogId = window.setTimeout(() => {
    watchdogId = null;
    try {
      const onCheckoutPath = window.location.pathname.includes('/checkout');
      const stillInternal = !isExternalPaymentHostname(window.location.hostname);
      if (stillInternal && onCheckoutPath) {
        window.dispatchEvent(new CustomEvent(CHECKOUT_REDIRECT_RECOVERY, { detail: { url } }));
      }
    } catch {
      /* ignore */
    }
  }, timeoutMs);
}
