import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/gtmTracking';

/**
 * Envia `page_view` ao dataLayer em cada mudança de rota (SPA).
 * Evita duplicar com PaymentSuccess, que dispara o seu próprio page_view após carregar o pedido.
 */
export function GtmRouteTracker() {
  const location = useLocation();
  const lastSentRef = useRef<string>('');

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;
    if (path.startsWith('/admin') || path.startsWith('/app/admin')) return;
    if (path.startsWith('/payment-success')) return;
    if (path === lastSentRef.current) return;
    lastSentRef.current = path;

    const title = typeof document !== 'undefined' ? document.title : path;
    const run = () => trackPageView(path, title);
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(run);
    } else {
      run();
    }
  }, [location.pathname, location.search]);

  return null;
}
