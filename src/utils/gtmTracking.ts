declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function isTrackingEnabled(): boolean {
  const path = window.location.pathname || '';
  if (path.startsWith('/admin') || path.startsWith('/app/admin')) return false;
  const host = window.location.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1') return false;
  return true;
}

async function sha256Hash(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function pushToDataLayer(event: string, data?: Record<string, unknown>): void {
  if (!isTrackingEnabled()) return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
  } catch {
    // silently ignore tracking errors
  }
}

export function trackPageView(pagePath: string, pageTitle: string): void {
  pushToDataLayer('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

export function trackQuizStart(aboutWho: string, occasion: string): void {
  pushToDataLayer('quiz_start', {
    about_who: aboutWho,
    occasion,
  });
}

export function trackQuizComplete(quizId: string, aboutWho: string, musicStyle: string): void {
  pushToDataLayer('quiz_complete', {
    quiz_id: quizId,
    about_who: aboutWho,
    music_style: musicStyle,
  });
}

export function trackBeginCheckout(orderId: string, value: number, currency: string): void {
  pushToDataLayer('begin_checkout', {
    ecommerce: {
      transaction_id: orderId,
      value,
      currency,
      items: [{ item_name: 'Música Personalizada', price: value, quantity: 1 }],
    },
  });
}

function stripPiiFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
}

export interface RedirectToPaymentParams {
  orderId: string;
  checkoutUrl?: string;
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
}

export async function trackRedirectToPayment(params: RedirectToPaymentParams): Promise<void> {
  const { orderId, checkoutUrl, email, phone, value, currency } = params;

  const userData: Record<string, string> = {};
  if (email) userData.em = await sha256Hash(email);
  if (phone) userData.ph = await sha256Hash(phone.replace(/\D/g, ''));

  pushToDataLayer('redirect_to_payment', {
    order_id: orderId,
    payment_provider: 'cakto',
    checkout_url: checkoutUrl ? stripPiiFromUrl(checkoutUrl) : '',
    user_data: userData,
    value: value ?? 0,
    currency: currency || 'BRL',
    content_name: 'Música Personalizada',
  });
}

/**
 * Extrai o GA4 client_id do cookie _ga.
 * Formato do cookie: GA1.1.XXXXXXXXXX.XXXXXXXXXX
 * O client_id sao os dois ultimos segmentos: XXXXXXXXXX.XXXXXXXXXX
 */
export function getGAClientId(): string | null {
  try {
    const match = document.cookie.match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(.+?)(?:;|$)/);
    if (match?.[1]) return match[1];

    // fallback: tentar ler de _ga_* (GA4 specific cookies)
    const ga4Match = document.cookie.match(/(?:^|;\s*)_ga_[A-Z0-9]+=GS\d+\.\d+\.(.+?)(?:;|$)/);
    if (ga4Match?.[1]) {
      const parts = ga4Match[1].split('.');
      if (parts.length >= 2) return `${parts[0]}.${parts[1]}`;
    }
  } catch {
    // cookie access may fail in some contexts
  }
  return null;
}
