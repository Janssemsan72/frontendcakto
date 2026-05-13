/**
 * Checkout externo: Hotmart ou Cakto conforme `VITE_PAYMENT_GATEWAY`.
 *
 * Padrão **hotmart** se a env estiver ausente (evita produção ir para Cakto quando o Vercel
 * não tem a variável). Para Cakto explícito: `VITE_PAYMENT_GATEWAY=cakto`.
 */

export type PaymentGateway = 'cakto' | 'hotmart';

export const CAKTO_PAY_ORIGIN = 'https://pay.cakto.com.br';

/** Checkout principal Musiclovely na Cakto (fallback se VITE_CAKTO_PAYMENT_URL vazio). */
export const CAKTO_CHECKOUT_DEFAULT = 'https://pay.cakto.com.br/d877u4t_665160';

/** Oferta Hotmart histórica do repo (fallback se VITE_HOTMART_PAYMENT_URL vazio). */
export const HOTMART_CHECKOUT_DEFAULT = 'https://pay.hotmart.com/O103476976K';

function normalizeGatewayEnv(): string {
  let v = (import.meta.env.VITE_PAYMENT_GATEWAY as string | undefined) ?? '';
  v = v.trim().replace(/^['"]+|['"]+$/g, '');
  return v.toLowerCase();
}

export function getPaymentGateway(): PaymentGateway {
  const raw = normalizeGatewayEnv();
  if (raw === 'cakto') return 'cakto';
  return 'hotmart';
}

export function getCaktoPaymentBaseUrl(): string {
  const raw = (import.meta.env.VITE_CAKTO_PAYMENT_URL as string | undefined)?.trim();
  return (raw || CAKTO_CHECKOUT_DEFAULT).replace(/\/$/, '');
}

export function getHotmartPaymentBaseUrl(): string {
  const raw = (import.meta.env.VITE_HOTMART_PAYMENT_URL as string | undefined)?.trim();
  return (raw || HOTMART_CHECKOUT_DEFAULT).replace(/\/$/, '');
}

export function getPaymentCheckoutBaseUrl(): string {
  return getPaymentGateway() === 'hotmart'
    ? getHotmartPaymentBaseUrl()
    : getCaktoPaymentBaseUrl();
}

export function getCaktoCheckoutConfig(): {
  url: string;
  amount_cents: number;
  price_display: number;
} {
  return {
    url: getPaymentCheckoutBaseUrl(),
    amount_cents: 4790,
    price_display: 4790,
  };
}

export function isCaktoPaymentHostname(hostname: string): boolean {
  return hostname.toLowerCase() === 'pay.cakto.com.br';
}

export function isHotmartPaymentHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'pay.hotmart.com' || h.endsWith('.hotmart.com');
}

export function isExternalPaymentHostname(hostname: string): boolean {
  return isCaktoPaymentHostname(hostname) || isHotmartPaymentHostname(hostname);
}

export function isAppCaktoCheckoutUrl(url: string): boolean {
  try {
    return isCaktoPaymentHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function isExternalPaymentUrl(url: string): boolean {
  try {
    return isExternalPaymentHostname(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Infere o gateway a partir de uma URL de checkout já salva. */
export function getGatewayFromPaymentUrl(url: string): PaymentGateway | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (isCaktoPaymentHostname(host)) return 'cakto';
    if (isHotmartPaymentHostname(host)) return 'hotmart';
    return null;
  } catch {
    return null;
  }
}

/** URL salva não corresponde ao gateway do ambiente atual (precisa regenerar). */
export function isPaymentUrlStaleForCurrentGateway(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') return true;
  const inferred = getGatewayFromPaymentUrl(url);
  if (inferred === null) return true;
  return inferred !== getPaymentGateway();
}
