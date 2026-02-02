/**
 * Service Worker para cache de assets estáticos
 * Estratégia: Cache-First para assets, Network-First para HTML
 */

const CACHE_VERSION = 'v2';
const CACHE_NAME = `musiclovely-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `musiclovely-static-${CACHE_VERSION}`;

// Assets estáticos para cache imediato
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest-admin.json',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
];

// Extensões de arquivos que devem usar cache-first
const CACHE_FIRST_EXTENSIONS = [
  '.woff',
  '.woff2',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.gif',
  '.mp4',
  '.webm',
  '.mp3'
];

// JS/CSS: sempre preferir rede para evitar assets desatualizados após deploy
const NETWORK_FIRST_EXTENSIONS = ['.js', '.css'];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Erro ao cachear assets iniciais:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== CACHE_NAME && name !== STATIC_CACHE_NAME;
          })
          .map((name) => {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requisições de API e externas
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('hotmart') ||
    url.hostname.includes('cakto') ||
    url.hostname.includes('utmify') ||
    url.hostname.includes('facebook')
  ) {
    return;
  }

  const isNetworkFirstAsset = NETWORK_FIRST_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
  const isCacheFirstAsset = CACHE_FIRST_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));

  if (isNetworkFirstAsset) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isCacheFirstAsset) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

// Cache-First: Verifica cache primeiro, depois rede
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    // ✅ CORREÇÃO: Não cachear respostas parciais (status 206) - Service Worker não suporta
    if (response.ok && response.status !== 206) {
      // Verificar se a resposta é completa antes de cachear
      const contentType = response.headers.get('content-type') || '';
      const isPartial = response.status === 206 || response.headers.get('content-range');
      
      if (!isPartial) {
        try {
          cache.put(request, response.clone());
        } catch (cacheError) {
          // Ignorar erros de cache silenciosamente
          console.debug('[SW] Não foi possível cachear recurso:', request.url);
        }
      }
    }
    return response;
  } catch (error) {
    console.warn('[SW] Erro ao buscar recurso:', error);
    const cachedFallback = await cache.match(request);
    return cachedFallback || new Response('Offline', { status: 503 });
  }
}

// Network-First: Tenta rede primeiro, depois cache
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Fallback para index.html para SPA
    if (request.mode === 'navigate') {
      const indexCached = await cache.match('/index.html');
      return indexCached || new Response('Offline', { status: 503 });
    }
    return new Response('Offline', { status: 503 });
  }
}
