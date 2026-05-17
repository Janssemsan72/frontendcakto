/**
 * Marketing de terceiros (GTM/Stape → Google Ads, etc.) não deve correr nas rotas admin.
 * A aprovação automática de letras usa só `supabase.functions.invoke` — não depende disto.
 */

export function isAdminMarketingExcludedPath(pathname: string): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/app/admin");
}

/** Remove o script GTM (googletagmanager.com ou loader Stape antigo) e limpa `dataLayer` após navegação SPA para admin. */
export function stripMarketingTagsOnAdmin(): void {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll(
      'script[src*="googletagmanager.com/gtm.js"], script[src*="api.musiclovely.com.br"], script[src*="api.musiclovely.online"]',
    )
    .forEach((n) => {
    n.parentNode?.removeChild(n);
  });
  try {
    const w = window as Window & { dataLayer?: unknown[] };
    if (Array.isArray(w.dataLayer)) w.dataLayer.length = 0;
  } catch {
    /* ignore */
  }
}
