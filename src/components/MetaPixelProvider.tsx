/**
 * MetaPixelProvider
 *
 * Loads active Meta Pixel IDs from Supabase directly (no backend dependency),
 * injects fbevents.js, initializes ALL pixels, and fires PageView for each.
 *
 * Wrap your app with this component for automatic tracking on all pages.
 */
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase';
import { fireServerPageView } from '@/utils/meta-tracking';

export default function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        // 1) Fetch active pixel IDs directly from Supabase (no backend needed)
        const { data, error } = await supabase
          .from('meta_pixels')
          .select('pixel_id')
          .eq('is_active', true);

        if (error) {
          console.warn('[MetaPixel] Supabase error:', error.message);
          return;
        }

        // Extract and deduplicate pixel IDs
        const pixel_ids = [...new Set(
          (data ?? [])
            .map((row: { pixel_id: string }) => row.pixel_id?.trim())
            .filter(Boolean)
        )];

        console.log('[MetaPixel] Active pixels:', pixel_ids);

        if (pixel_ids.length === 0) return;

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

        // 3) Init and explicitly track PageView for ALL pixels
        for (const id of pixel_ids) {
          fbq('init', id);
          fbq('trackSingle', id, 'PageView');
          console.log('[MetaPixel] Initialized & PageView fired for pixel:', id);
        }

        // 5) Fire server-side CAPI PageView
        fireServerPageView();
      } catch (err) {
        console.warn('[MetaPixel] Error:', err);
      }
    })();
  }, []);

  return <>{children}</>;
}
