# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Pasta `backend-update/` com rascunho (`README.md`, `src/autoJobsWorker.ts`, `src/index.new.ts`).

### Changed

- GTM/Stape: alinhado ao fluxo **`musiclovely-cakto - hotmart 2026`** (mesmo container/site): `gtmTracking.ts` como na ref com `payment_provider: 'hotmart'` fixo; `stripMarketingTagsOnAdmin` em `App.tsx`; sem `GtmRouteTracker`; `CheckoutRedirectWrapper` sem `redirect_to_payment` (como na ref); `adminMarketingOptOut` remove scripts `musiclovely.online`; `index.html` com mesmos comentários/preconnect da ref (**host** `https://musiclovely.online` em vez de `api.musiclovely.com.br`); CSP `vercel.json` e CORS `security.ts` para o novo host; MP backend em `serverTracking.ts`.

- Admin (`AdminWhatsappFunnel.tsx`): deteção de “checkout interno” da Musiclovely inclui URLs com **`musiclovely.online`** (além de `musiclovely.com`), para alinhar ao domínio de tracking/site.

- Hero (`HeroSection.tsx`): poster e fallback estáticos com frame ~50% do clip (`public/video/musiclovaly-poster.webp`); reprodução começa após seek para o meio (sem `autoPlay` desde t=0) para alinhar com o poster e reduzir efeito de entrada; retoma após `online` + `load()`; `preload="auto"` e `loop` mantidos.
- `public/favicon.svg`: ícone com coração + nota musical em preto sobre fundo lilás-claro arredondado (marca antiga do site), em vez do ícone só com nota em fundo marrom.
- Checkout dual **Cakto / Hotmart** (mesmo banco): [`src/config/paymentCheckout.ts`](src/config/paymentCheckout.ts) com defaults de URL (`VITE_CAKTO_PAYMENT_URL` / `VITE_HOTMART_PAYMENT_URL` ou fallbacks em código); **gateway padrão Hotmart** se `VITE_PAYMENT_GATEWAY` ausente; `VITE_PAYMENT_GATEWAY=cakto` força Cakto; regeneração de `cakto_payment_url` quando o host salvo não bate com o gateway ativo.

### Fixed

- Build Vite: export de `trackPurchaseOnce` em `gtmTracking.ts` (usado por `PaymentSuccess.tsx`); evento `purchase` no dataLayer com deduplicação por pedido em `sessionStorage`.

- Checkout externo: padrão do gateway passou a ser **Hotmart** quando `VITE_PAYMENT_GATEWAY` não está definida no build (evita ir para Cakto no Vercel sem env); `VITE_PAYMENT_GATEWAY=cakto` força Cakto; normalização da env (trim + aspas).

- Meta Pixel (`MetaPixelProvider`): fallback por `VITE_META_PIXEL_ID` / `VITE_META_PIXEL_IDS` quando Supabase falha ou não devolve pixels; merge DB + env; espera runtime do `fbq` antes de `init`/`PageView` (Pixel Helper / rede); README e DEPLOY.md documentam as envs.

- Fluxo de pagamento externo unificado (`checkoutLinks`, `Checkout/index.tsx`, `CheckoutRedirectWrapper`, etc.): gateway segue `paymentCheckout`; Hotmart é o default sem env.
- Tags explícitas de favicon em `index.html` e ícone em `public/favicon.svg`, substituindo o ícone padrão da plataforma anterior.
