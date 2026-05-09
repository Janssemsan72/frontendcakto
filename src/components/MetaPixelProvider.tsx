/**
 * MetaPixelProvider
 *
 * Loads active Meta Pixel IDs from the backend, injects fbevents.js,
 * initializes all pixels, and fires PageView (browser + CAPI).
 *
 * Wrap your app with this component for automatic tracking on all pages.
 */
import { useEffect, useRef } from 'react';
import { fireServerPageView } from '@/utils/meta-tracking';

let API_URL = import.meta.env.VITE_API_URL || '';
if (API_URL && !API_URL.startsWith('http')) {
  API_URL = `https://${API_URL}`;
}

export default function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        // 1) Fetch active pixel IDs from backend
        const res = await fetch(`${API_URL}/api/meta-pixel-ids`);
        if (!res.ok) return;
        const { pixel_ids } = await res.json();
        if (!pixel_ids || pixel_ids.length === 0) return;

        // 2) Inject fbevents.js if not already loaded
        if (!(window as any).fbq) {
          const f = window as any;
          const n: any = function (...args: any[]) {
            if (n.callMethod) {
              n.callMethod.apply(n, args);
            } else {
              n.queue.push(args);
            }
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = true;
          n.version = '2.0';
          n.queue = [] as any[];
          f.fbq = n;

          const script = document.createElement('script');
          script.async = true;
          script.defer = true;
          script.src = 'https://connect.facebook.net/en_US/fbevents.js';
          const first = document.getElementsByTagName('script')[0];
          first?.parentNode?.insertBefore(script, first);
        }

        const fbq = (window as any).fbq;

        // 3) Init and track each pixel explicitly
        for (const id of pixel_ids) {
          fbq('init', id);
          fbq('trackSingle', id, 'PageView');
        }

        // 5) Fire server-side CAPI PageView
        fireServerPageView();
      } catch {
        // Silent: tracking should never break the app
      }
    })();
  }, []);

  return <>{children}</>;
}
