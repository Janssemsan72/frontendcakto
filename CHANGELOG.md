# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Pasta `backend-update/` com rascunho (`README.md`, `src/autoJobsWorker.ts`, `src/index.new.ts`).
- `VITE_META_PIXEL_SOURCE=gtm`: o app **não** faz `fbq('init')` / PageView no browser; os pixels Meta vêm só das tags no **Google Tag Manager** (útil para 3+ pixels sem duplicar com Supabase/env).

### Changed

- GTM: **snippet oficial** do Google (`https://www.googletagmanager.com/gtm.js?id=GTM-TKPCMTNB` + `ns.html` no mesmo domínio), como no modal “Instalar o Gerenciador de tags”; guarda de `/admin` no `<head>`; `preconnect`/`dns-prefetch` para `googletagmanager.com`. Substitui o loader Stape (`api.musiclovely.com.br/63grxzipls.js`). `adminMarketingOptOut` remove `gtm.js` e loaders Stape antigos. CSP `vercel.json` já inclui `*.googletagmanager.com`; GA4 MP no backend pode continuar em Stape (`api.musiclovely.com.br/mp/collect`) se configurado.

- `useUtmParams.ts`: logs de tracking (`Parâmetros de tracking salvos`, navegação com UTMs) só em `import.meta.env.DEV`, para não poluir a consola em produção.

- Admin (`AdminWhatsappFunnel.tsx`): deteção de “checkout interno” da Musiclovely inclui URLs com **`musiclovely.online`** (além de `musiclovely.com`), para alinhar ao domínio de tracking/site.

- Hero (`HeroSection.tsx`): poster e fallback estáticos com frame ~50% do clip (`public/video/musiclovaly-poster.webp`); reprodução começa após seek para o meio (sem `autoPlay` desde t=0) para alinhar com o poster e reduzir efeito de entrada; retoma após `online` + `load()`; `preload="auto"` e `loop` mantidos.
- `public/favicon.svg`: ícone com coração + nota musical em preto sobre fundo lilás-claro arredondado (marca antiga do site), em vez do ícone só com nota em fundo marrom.
- Checkout dual **Cakto / Hotmart** (mesmo banco): [`src/config/paymentCheckout.ts`](src/config/paymentCheckout.ts) com defaults de URL (`VITE_CAKTO_PAYMENT_URL` / `VITE_HOTMART_PAYMENT_URL` ou fallbacks em código); **gateway padrão Hotmart** se `VITE_PAYMENT_GATEWAY` ausente; `VITE_PAYMENT_GATEWAY=cakto` força Cakto; regeneração de `cakto_payment_url` quando o host salvo não bate com o gateway ativo.

### Fixed

- Hotmart/Cakto: `src` montado como `utm_source|utm_medium|…` quando ausente na URL (`hotmartTrackingParams.ts`), alinhado à versão hotmart 2026; aplicado em `checkoutLinks` e `Checkout/index.tsx`.

- `index.html`: script de persistência UTM/`src`/`sck` (hotmart 2026) com cookies em `.musiclovely.online` e `.musiclovely.com.br`, skip em `/admin`, sync de `sck` com `musiclovely_tracking_params`.

- Checkout → Hotmart/Cakto: redirecionamento mais robusto (`navigateToExternalPayment`: `window.top`, link `target="_top"`, `location.replace`) e recuperação após timeout se o browser/WebView não sair da rota `/checkout` (liberta o botão e mostra link manual). Mitiga clientes presos em Processando… em Instagram/Facebook ou Safari. Novas chaves em `src/i18n/locales/pt.json` para o aviso e o CTA.

- CSP (`vercel.json`): incluir `https://api.musiclovely.online` junto de `api.musiclovely.com.br` em `script-src`, `script-src-elem`, `connect-src` e `frame-src`, para iframes/scripts do GTM/Stape no domínio `.online` não serem bloqueados no site `www.musiclovely.online`.

- Build Vite: export de `trackPurchaseOnce` em `gtmTracking.ts` (usado por `PaymentSuccess.tsx`); evento `purchase` no dataLayer com deduplicação por pedido em `sessionStorage`.

- Checkout externo: padrão do gateway passou a ser **Hotmart** quando `VITE_PAYMENT_GATEWAY` não está definida no build (evita ir para Cakto no Vercel sem env); `VITE_PAYMENT_GATEWAY=cakto` força Cakto; normalização da env (trim + aspas).

- Meta Pixel (`MetaPixelProvider`): fallback por `VITE_META_PIXEL_ID` / `VITE_META_PIXEL_IDS` quando Supabase falha ou não devolve pixels; merge DB + env; espera runtime do `fbq` antes de `init`/`PageView` (Pixel Helper / rede); opção `VITE_META_PIXEL_SOURCE=gtm` para delegar init ao GTM; README e DEPLOY.md documentam as envs.

- Fluxo de pagamento externo unificado (`checkoutLinks`, `Checkout/index.tsx`, `CheckoutRedirectWrapper`, etc.): gateway segue `paymentCheckout`; Hotmart é o default sem env.
- Tags explícitas de favicon em `index.html` e ícone em `public/favicon.svg`, substituindo o ícone padrão da plataforma anterior.
