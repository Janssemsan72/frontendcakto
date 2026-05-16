/**
 * ID de sessão (sck) único no funil — formato Stape/SKR: {entrada}_{atual}.
 * Deve existir antes do GTM (ver public/sck-bootstrap.js).
 */

export const TRACKING_STORAGE_KEY = 'musiclovely_tracking_params';
export const SCK_COOKIE_NAME = 'index';
export const SCK_ENTRY_STORAGE_KEY = 'ml_sck_entry';

export function isAdminPathname(pathname: string): boolean {
  return (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/app/admin')
  );
}

export function getTrackingCookieDomain(hostname: string): string {
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1') return '';
  if (h.includes('musiclovely.online')) return '.musiclovely.online';
  if (h.includes('musiclovely.com.br')) return '.musiclovely.com.br';
  if (h.includes('musiclovely.com')) return '.musiclovely.com';
  return '';
}

/** Novo sck no padrão visto no Stape Store: 1778950328476_17789505714684 */
export function generateSckId(): string {
  const now = String(Date.now());
  let entry = now;
  try {
    const stored = sessionStorage.getItem(SCK_ENTRY_STORAGE_KEY);
    if (stored) entry = stored;
    else sessionStorage.setItem(SCK_ENTRY_STORAGE_KEY, entry);
  } catch {
    // sessionStorage indisponível (WebView / modo privado)
  }
  return `${entry}_${now}`;
}

export function readSckFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(TRACKING_STORAGE_KEY);
    if (saved) {
      const params = JSON.parse(saved) as { sck?: string };
      if (params.sck && String(params.sck).trim()) return String(params.sck).trim();
    }
  } catch {
    // ignore
  }
  try {
    const fromIndex = localStorage.getItem(SCK_COOKIE_NAME);
    if (fromIndex && fromIndex.trim()) return fromIndex.trim();
  } catch {
    // ignore
  }
  return null;
}

export function persistSck(sck: string): void {
  if (typeof window === 'undefined' || !sck) return;
  try {
    const saved = localStorage.getItem(TRACKING_STORAGE_KEY);
    const params = saved ? JSON.parse(saved) : {};
    params.sck = sck;
    localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(params));
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(SCK_COOKIE_NAME, sck);
    sessionStorage.setItem(SCK_COOKIE_NAME, sck);
  } catch {
    // ignore
  }
  try {
    const exp = new Date(Date.now() + 400 * 864e5).toUTCString();
    const domain = getTrackingCookieDomain(window.location.hostname);
    let cookie = `${SCK_COOKIE_NAME}=${encodeURIComponent(sck)};expires=${exp};path=/;SameSite=Lax`;
    if (domain) cookie += `;domain=${domain}`;
    document.cookie = cookie;
  } catch {
    // ignore
  }
}

/**
 * Garante sck na primeira paint (e reutiliza o mesmo até expirar storage).
 * Mantém UUID legado se já existir no localStorage.
 */
export function ensureSckSession(): string {
  const existing = readSckFromStorage();
  if (existing) {
    persistSck(existing);
    return existing;
  }
  const sck = generateSckId();
  persistSck(sck);
  return sck;
}

export function pushSckToDataLayer(sck: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'sck_ready',
      sck,
    });
  } catch {
    // ignore
  }
}

/** Expõe sck na URL se ainda não estiver (ajuda SKR / Stape a ler na 1ª página). */
export function ensureSckInUrl(sck: string): void {
  if (typeof window === 'undefined' || !sck) return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.has('sck')) return;
    url.searchParams.set('sck', sck);
    window.history.replaceState(null, '', url.toString());
  } catch {
    // ignore
  }
}
