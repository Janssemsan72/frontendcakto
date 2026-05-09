# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed

- Hero (`HeroSection.tsx`): removida imagem/poster de fallback; vídeo do hero monta e pré-carrega desde o primeiro paint (`preload="auto"`), sem esperar LCP/idle.
- `public/favicon.svg`: ícone com coração + nota musical em preto sobre fundo lilás-claro arredondado (marca antiga do site), em vez do ícone só com nota em fundo marrom.
- Checkout dual **Cakto / Hotmart** (mesmo banco): [`src/config/paymentCheckout.ts`](src/config/paymentCheckout.ts) com default Cakto `https://pay.cakto.com.br/d877u4t_665160`, default Hotmart `https://pay.hotmart.com/O103476976K`, `VITE_PAYMENT_GATEWAY=hotmart` para deploy legado, overrides `VITE_CAKTO_PAYMENT_URL` / `VITE_HOTMART_PAYMENT_URL`; `provider`/`payment_provider` e URLs seguem o gateway ativo; regeneração de `cakto_payment_url` quando o domínio salvo não bate com o ambiente.

### Fixed

- Fluxo de pagamento externo unificado: não depende mais só de env para Cakto (há fallback no código); Hotmart volta a ser opção real quando `VITE_PAYMENT_GATEWAY=hotmart` (`checkoutLinks`, `Checkout/index.tsx`, `CheckoutRedirectWrapper`, `RegionalPricingSection`, `AdminWhatsappFunnel`, `gtmTracking`, `validate-env`, `vite-env.d.ts`).
- Tags explícitas de favicon em `index.html` e ícone em `public/favicon.svg`, substituindo o ícone padrão da plataforma anterior.
