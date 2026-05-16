/**
 * Parâmetros de atribuição para checkout Hotmart (e Cakto), alinhado à versão
 * "hotmart 2026": `src` = utm_source|utm_medium|utm_campaign|utm_content|utm_term
 * quando `src` não veio na URL.
 */

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

const CHECKOUT_QUERY_KEYS = [
  ...UTM_KEYS,
  'src',
  'sck',
  'xcod',
  'fbclid',
  'gclid',
] as const;

export type CheckoutTrackingInput = Record<string, string | null | undefined>;

/** Monta `src` no formato pipe usado na Hotmart / scripts legados. */
export function buildSrcFromUtms(params: Record<string, string>): string {
  const parts = UTM_KEYS.map((k) => params[k]).filter((v): v is string => Boolean(v));
  return parts.join('|');
}

/**
 * Normaliza params do hook/localStorage para a query do checkout externo.
 */
export function enrichTrackingParamsForExternalCheckout(
  raw: CheckoutTrackingInput
): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value != null && String(value).trim() !== '') {
      out[key] = String(value).trim();
    }
  }

  if (!out.src) {
    const src = buildSrcFromUtms(out);
    if (src) out.src = src;
  }

  return out;
}

export function appendExternalCheckoutTracking(
  searchParams: URLSearchParams,
  raw: CheckoutTrackingInput
): void {
  const enriched = enrichTrackingParamsForExternalCheckout(raw);
  for (const key of CHECKOUT_QUERY_KEYS) {
    const value = enriched[key];
    if (value) searchParams.set(key, value);
  }
}
