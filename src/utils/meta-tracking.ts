/**
 * Meta Pixel client-side tracking utilities
 * Handles cookie reading, UTM collection, PageView CAPI, and Purchase deduplication
 */

let API_URL = import.meta.env.VITE_API_URL || '';
if (API_URL && !API_URL.startsWith('http')) {
  API_URL = `https://${API_URL}`;
}

/** Read a cookie value by name */
export function getCookieValue(name: string): string {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

/** Collect tracking data from cookies and URL params */
export function getTrackingData(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  return {
    fbp: getCookieValue('_fbp'),
    fbc: getCookieValue('_fbc'),
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    page_url: window.location.href,
  };
}

/** Fire server-side PageView via CAPI — once per page per session */
export function fireServerPageView(): void {
  const sessionKey = 'ml_pv_sent_' + window.location.pathname;
  try {
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
  } catch { /* private browsing */ }

  const payload = JSON.stringify({
    event_name: 'PageView',
    event_id: 'pv_' + Date.now() + '_' + window.location.pathname.replace(/\//g, '_'),
    page_url: window.location.href,
    fbp: getCookieValue('_fbp') || '',
    fbc: getCookieValue('_fbc') || '',
  });

  const url = `${API_URL}/api/track`;

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
  } else {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(payload);
  }
}

/** Fire Purchase pixel — browser fbq + server CAPI safety net */
export function firePurchasePixelOnce(order: {
  id: string;
  status: string;
  amount_cents: number;
  currency?: string;
}): void {
  if (!order || order.status !== 'paid') return;

  const flagKey = 'ml_pixel_purchase_fired_' + order.id;
  try {
    if (sessionStorage.getItem(flagKey) === '1') return;
    sessionStorage.setItem(flagKey, '1');
  } catch { /* private browsing */ }

  const value = (order.amount_cents || 0) / 100;
  const currency = (order.currency || 'BRL').toUpperCase();
  const purchaseEventId = 'purchase_' + order.id;

  // 1) Browser-side fbq Purchase
  try {
    const fbq = (window as any).fbq;
    if (typeof fbq === 'function') {
      fbq('track', 'Purchase', {
        content_name: 'Música Personalizada',
        currency,
        value,
        order_id: order.id,
      }, { eventID: purchaseEventId });
    }
  } catch { /* silent */ }

  // 2) Server-side CAPI Purchase (safety net)
  try {
    const payload = JSON.stringify({
      event_name: 'Purchase',
      event_id: purchaseEventId,
      page_url: window.location.href,
      fbp: getCookieValue('_fbp') || '',
      fbc: getCookieValue('_fbc') || '',
      order_id: order.id,
      value: String(value),
      currency,
    });

    const url = `${API_URL}/api/track`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(payload);
    }
  } catch { /* silent */ }
}
