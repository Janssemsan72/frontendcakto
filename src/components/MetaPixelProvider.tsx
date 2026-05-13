/**
 * MetaPixelProvider
 *
 * Loads Meta Pixel IDs from Supabase (`meta_pixels`) and from env fallback,
 * injects fbevents.js, initializes ALL pixels, and fires PageView for each.
 *
 * Se `VITE_META_PIXEL_SOURCE=gtm`, **não** faz init no browser: os pixels vêm só
 * das tags Meta no Google Tag Manager (evita 2 no app + 1 só no GTM, etc.).
 *
 * Env fallback (VITE_META_PIXEL_ID ou VITE_META_PIXEL_IDS) garante que o
 * browser pixel dispare mesmo se a tabela estiver vazia, RLS bloquear anon, ou
 * a query falhar — necessário para o Meta Pixel Helper ver eventos.
 */
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase';
import { fireServerPageView } from '@/utils/meta-tracking';

function getEnvPixelIds(): string[] {
  const single = import.meta.env.VITE_META_PIXEL_ID?.trim();
  const multiRaw = import.meta.env.VITE_META_PIXEL_IDS ?? '';
  const fromList = multiRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const combined = [single, ...fromList].filter(Boolean) as string[];
  return [...new Set(combined)];
}

/** Pixels Meta só pelo GTM (tags no container); o app não faz `fbq('init')` para evitar duplicar / contar só parte. */
function isMetaPixelManagedByGtm(): boolean {
  const v = (import.meta.env.VITE_META_PIXEL_SOURCE || '').trim().toLowerCase();
  return v === 'gtm' || v === '1' || v === 'true' || v === 'yes';
}

function installFbqStub(): void {
  const f = window as any;
  if (f.fbq) return;
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
}

/** Aguarda fbq real (callMethod) ou timeout — cobre script já carregado (ex.: GTM) e evita hang no listener de load. */
function waitForFbqRuntime(maxMs = 12000): Promise<void> {
  return new Promise((resolve) => {
    const deadline = Date.now() + maxMs;
    const tick = () => {
      const fbq = (window as any).fbq;
      if (fbq && typeof fbq.callMethod === 'function') {
        resolve();
        return;
      }
      if (Date.now() >= deadline) {
        resolve();
        return;
      }
      setTimeout(tick, 48);
    };
    tick();
  });
}

/** Injeta stub + fbevents.js se ainda não existir; depois espera runtime do pixel. */
async function ensureFbeventsLoaded(): Promise<void> {
  installFbqStub();

  const hasScript = document.querySelector(
    'script[src*="connect.facebook.net"][src*="fbevents.js"]',
  );

  if (!hasScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const first = document.getElementsByTagName('script')[0];
    first?.parentNode?.insertBefore(script, first);
  }

  await waitForFbqRuntime();
}

export default function MetaPixelProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        await ensureFbeventsLoaded();

        if (isMetaPixelManagedByGtm()) {
          if (import.meta.env.DEV) {
            console.info(
              '[MetaPixel] VITE_META_PIXEL_SOURCE=gtm: init/PageView ficam a cargo do GTM (3+ pixels = tags Meta no container tagmanager.google.com).',
            );
          }
          fireServerPageView();
          return;
        }

        const envIds = getEnvPixelIds();
        let dbIds: string[] = [];

        try {
          const { data, error } = await supabase
            .from('meta_pixels')
            .select('pixel_id')
            .eq('is_active', true);

          if (error) {
            console.warn('[MetaPixel] Supabase error:', error.message);
          } else {
            dbIds = [
              ...new Set(
                (data ?? [])
                  .map((row: { pixel_id: string }) => row.pixel_id?.trim())
                  .filter(Boolean) as string[],
              ),
            ];
          }
        } catch (err) {
          console.warn('[MetaPixel] Supabase fetch failed:', err);
        }

        const pixel_ids = [...new Set([...dbIds, ...envIds])];

        if (pixel_ids.length === 0) {
          console.warn(
            '[MetaPixel] Nenhum pixel ativo: cadastre em meta_pixels (Supabase) ou defina VITE_META_PIXEL_ID / VITE_META_PIXEL_IDS (ou use VITE_META_PIXEL_SOURCE=gtm e configure os pixels só no GTM).',
          );
          fireServerPageView();
          return;
        }

        console.log('[MetaPixel] Pixel IDs (DB + env):', pixel_ids);

        const fbq = (window as any).fbq;

        for (const id of pixel_ids) {
          fbq('init', id);
          fbq('trackSingle', id, 'PageView');
          console.log('[MetaPixel] Initialized & PageView fired for pixel:', id);
        }

        fireServerPageView();
      } catch (err) {
        console.warn('[MetaPixel] Error:', err);
      }
    })();
  }, []);

  return <>{children}</>;
}
