# Guia Completo: Configuração GTM + Stape + GA4 — MusicLovely

## Visão Geral da Arquitetura

```
Usuário no site (musiclovely.com)
    │
    ├── dataLayer events (quiz_start, quiz_complete, begin_checkout, redirect_to_payment)
    │       │
    │       ▼
    │   GTM Web Container (GTM-TKPCMTNB)
    │       │
    │       ▼
    │   Stape Server-Side GTM (api.musiclovely.com)
    │       │
    │       ▼
    │   Google Analytics 4 (G-G5XJJJBWZP)
    │
    ├── Cakto (pagamento)
    │       │
    │       ▼ (webhook)
    │   Backend Fastify (Vercel)
    │       │
    │       ▼ (GA4 Measurement Protocol)
    │   Stape Server → GA4 (evento "purchase")
```

---

## Parte 1: Stape (Server-Side GTM)

### 1.1 O que é o Stape
O Stape hospeda um **GTM Server Container** que funciona como proxy entre o navegador e o Google Analytics. Isso melhora:
- Precisão dos dados (bypass de ad blockers)
- Velocidade (first-party domain)
- Controle dos dados enviados

### 1.2 Configuração do Subdomínio
O subdomínio `api.musiclovely.com` foi configurado para apontar para o Stape. Isso transforma requisições de terceiros em requisições first-party.

### 1.3 Custom Loader Script
O Stape gera um script personalizado que substitui o script padrão do GTM. Ele é inserido no `index.html` do projeto.

**Localização no código:** `index.html` (raiz do projeto)

**No `<head>` (o mais alto possível):**
```html
<!-- Google Tag Manager (Stape server-side) -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s);j.async=true;j.src='https://api.musiclovely.com/63grxzipls.js?'+i;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',
'SEU_PARAMETRO_I_AQUI');</script>
<!-- End Google Tag Manager -->
```

**Logo após abrir o `<body>`:**
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://api.musiclovely.com/ns.html?id=GTM-TKPCMTNB"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### 1.4 Como Obter/Atualizar o Script
1. Acesse [app.stape.io](https://app.stape.io)
2. Vá no seu Server Container
3. Clique em **Custom Loader**
4. Copie o script gerado
5. Substitua no `index.html`
6. **IMPORTANTE**: Clique "Save changes" no Stape após qualquer alteração

### 1.5 Content Security Policy (CSP)
O `vercel.json` precisa permitir os domínios do GTM/Stape. Os seguintes domínios devem estar em `script-src`, `script-src-elem`, `connect-src` e `frame-src`:

```
https://api.musiclovely.com
https://*.googletagmanager.com
https://*.google-analytics.com
```

---

## Parte 2: GTM Web Container

### 2.1 Acessar o GTM
1. Acesse [tagmanager.google.com](https://tagmanager.google.com)
2. Selecione a conta **MusicLovely**
3. Selecione o container **GTM-TKPCMTNB**

### 2.2 Tag: Google Tag (GA4 Config)
Esta tag inicializa o GA4 em todas as páginas.

1. **Tags** → **Nova**
2. Nome: `Google 4k digital` (ou qualquer nome descritivo)
3. Tipo de tag: **Tag do Google**
4. ID da tag: `G-G5XJJJBWZP`
5. Acionamento: **All Pages**
6. **Salvar**

### 2.3 Acionador: History Change (SPA)
Em uma SPA (Single Page Application), mudanças de rota não recarregam a página. Este acionador detecta essas mudanças.

1. **Acionadores** → **Novo**
2. Nome: `History Change - SPA`
3. Tipo: **Alteração de histórico**
4. Disparado em: **Todas as alterações de histórico**
5. **Salvar**

### 2.4 Tag: Page View SPA
Envia page_view ao GA4 quando o usuário navega entre páginas da SPA.

1. **Tags** → **Nova**
2. Nome: `GA4 - Page View SPA`
3. Tipo: **Google Analytics: evento do GA4**
4. ID da métrica: `G-G5XJJJBWZP`
5. Nome do evento: `page_view`
6. Acionamento: `History Change - SPA`
7. **Salvar**

---

## Parte 3: Eventos do Funil

O site envia eventos personalizados para o `dataLayer` em pontos-chave do funil. Para cada evento, você precisa criar **1 acionador + 1 tag** no GTM.

### Padrão para Cada Evento

**Criar Acionador:**
1. GTM → **Acionadores** → **Novo**
2. Nome: `CE - [nome_do_evento]`
3. Tipo: **Evento personalizado**
4. Nome do evento: `[nome_do_evento]`
5. Disparado em: **Todos os eventos personalizados**
6. **Salvar**

**Criar Tag:**
1. GTM → **Tags** → **Nova**
2. Nome: `GA4 - [Nome Descritivo]`
3. Tipo: **Google Analytics: evento do GA4**
4. ID da métrica: `G-G5XJJJBWZP`
5. Nome do evento: `[nome_do_evento]`
6. Acionamento: selecione o acionador `CE - [nome_do_evento]`
7. **Salvar**

### 3.1 Evento: quiz_start

| Campo | Valor |
|-------|-------|
| Nome do acionador | `CE - quiz_start` |
| Tipo do acionador | Evento personalizado |
| Nome do evento (acionador) | `quiz_start` |
| Nome da tag | `GA4 - Quiz Start` |
| Tipo da tag | Google Analytics: evento do GA4 |
| ID da métrica | `G-G5XJJJBWZP` |
| Nome do evento (tag) | `quiz_start` |
| Acionamento | `CE - quiz_start` |

**Quando dispara:** Quando o usuário inicia o quiz (passo 1).

### 3.2 Evento: quiz_complete

| Campo | Valor |
|-------|-------|
| Nome do acionador | `CE - quiz_complete` |
| Tipo do acionador | Evento personalizado |
| Nome do evento (acionador) | `quiz_complete` |
| Nome da tag | `GA4 - Quiz Complete` |
| Tipo da tag | Google Analytics: evento do GA4 |
| ID da métrica | `G-G5XJJJBWZP` |
| Nome do evento (tag) | `quiz_complete` |
| Acionamento | `CE - quiz_complete` |

**Quando dispara:** Quando o usuário completa o quiz e os dados são enviados.

### 3.3 Evento: begin_checkout

| Campo | Valor |
|-------|-------|
| Nome do acionador | `CE - begin_checkout` |
| Tipo do acionador | Evento personalizado |
| Nome do evento (acionador) | `begin_checkout` |
| Nome da tag | `GA4 - Begin Checkout` |
| Tipo da tag | Google Analytics: evento do GA4 |
| ID da métrica | `G-G5XJJJBWZP` |
| Nome do evento (tag) | `begin_checkout` |
| Acionamento | `CE - begin_checkout` |

**Quando dispara:** Quando a página de checkout carrega.

### 3.4 Evento: redirect_to_payment

| Campo | Valor |
|-------|-------|
| Nome do acionador | `CE - redirect_to_payment` |
| Tipo do acionador | Evento personalizado |
| Nome do evento (acionador) | `redirect_to_payment` |
| Nome da tag | `GA4 - Redirect to Payment` |
| Tipo da tag | Google Analytics: evento do GA4 |
| ID da métrica | `G-G5XJJJBWZP` |
| Nome do evento (tag) | `redirect_to_payment` |
| Acionamento | `CE - redirect_to_payment` |

**Quando dispara:** Imediatamente antes do redirecionamento para a página de pagamento da Cakto.

---

## Parte 4: Evento Purchase (Server-Side)

O evento `purchase` é enviado **pelo backend** quando a Cakto confirma o pagamento via webhook. Isso garante 100% de precisão (não depende do usuário voltar ao site).

### 4.1 Fluxo
```
Cakto confirma pagamento
    → Webhook POST /api/cakto/webhook
    → Backend atualiza order status = 'paid'
    → Backend envia evento 'purchase' via GA4 Measurement Protocol
    → Stape Server Container recebe
    → GA4 registra a conversão
```

### 4.2 Variáveis de Ambiente Necessárias (Vercel)
Configure estas variáveis no painel da Vercel onde o backend roda:

| Variável | Valor | Onde obter |
|----------|-------|------------|
| `GA4_MEASUREMENT_ID` | `G-G5XJJJBWZP` | GA4 → Administrador → Fluxos de dados |
| `GA4_API_SECRET` | `(seu secret)` | GA4 → Administrador → Fluxos de dados → Segredos da API do Measurement Protocol |

### 4.3 Como Criar o API Secret no GA4
1. Acesse [analytics.google.com](https://analytics.google.com)
2. Clique na **engrenagem** (Administrador) no canto inferior esquerdo
3. Na coluna da propriedade, clique em **Fluxos de dados**
4. Clique no seu fluxo web (musiclovely.com)
5. Role até **Eventos** → **Segredos da API do Measurement Protocol**
6. Clique **Criar**
7. Apelido: `Stape Server`
8. Copie o **Valor do segredo**
9. Cole como `GA4_API_SECRET` nas variáveis de ambiente da Vercel

### 4.4 Como Configurar Variáveis na Vercel
1. Acesse [vercel.com](https://vercel.com) → seu projeto do backend
2. **Settings** → **Environment Variables**
3. Adicione:
   - Key: `GA4_MEASUREMENT_ID` → Value: `G-G5XJJJBWZP`
   - Key: `GA4_API_SECRET` → Value: `(o secret que você copiou)`
4. Clique **Save**
5. **Redeploy** o projeto para aplicar

---

## Parte 5: Publicar no GTM

Após criar todas as tags e acionadores:

1. No GTM, clique **Enviar** (canto superior direito)
2. Nome da versão: `Funil completo GA4 + eventos`
3. Clique **Publicar**

---

## Parte 6: Como Testar

### 6.1 Tag Assistant (GTM Preview)
1. No GTM, clique **Visualizar** (canto superior direito)
2. Digite a URL: `https://www.musiclovely.com`
3. Clique **Connect**
4. Uma nova aba abre com seu site
5. A janela do Tag Assistant (aba separada) mostra todos os eventos
6. Navegue pelo site: quiz → checkout → pagamento
7. Verifique que cada evento aparece na lista lateral com as tags disparadas

### 6.2 Verificar no Console do Navegador
1. Abra o site
2. Pressione **F12** → aba **Console**
3. Digite: `window.dataLayer`
4. Deve mostrar um array com todos os eventos disparados

### 6.3 Verificar no GA4 (Tempo Real)
1. Acesse [analytics.google.com](https://analytics.google.com)
2. Clique em **Relatórios** → **Tempo real**
3. Navegue pelo site em outra aba
4. Os eventos devem aparecer no gráfico de tempo real

### 6.4 Verificar Script do Stape
1. Abra o site
2. Pressione **F12** → aba **Network**
3. Filtre por `63grxzipls`
4. Se retornar **200 OK**, o script Stape está carregando corretamente

---

## Parte 7: Resumo das Tags e Acionadores

### Acionadores Criados

| Nome | Tipo | Configuração |
|------|------|-------------|
| All Pages | Exibição de página | Todas as páginas |
| History Change - SPA | Alteração de histórico | Todas as alterações |
| CE - quiz_start | Evento personalizado | Nome: `quiz_start` |
| CE - quiz_complete | Evento personalizado | Nome: `quiz_complete` |
| CE - begin_checkout | Evento personalizado | Nome: `begin_checkout` |
| CE - redirect_to_payment | Evento personalizado | Nome: `redirect_to_payment` |

### Tags Criadas

| Nome | Tipo | Evento | Acionador |
|------|------|--------|-----------|
| Google 4k digital | Tag do Google | Config | All Pages |
| GA4 - Page View SPA | GA4 Event | `page_view` | History Change - SPA |
| GA4 - Quiz Start | GA4 Event | `quiz_start` | CE - quiz_start |
| GA4 - Quiz Complete | GA4 Event | `quiz_complete` | CE - quiz_complete |
| GA4 - Begin Checkout | GA4 Event | `begin_checkout` | CE - begin_checkout |
| GA4 - Redirect to Payment | GA4 Event | `redirect_to_payment` | CE - redirect_to_payment |

---

## Parte 8: Funil Completo

```
[Usuário acessa o site]
        │
        ▼
   page_view (GA4 Config + History Change)
        │
        ▼
   quiz_start (usuário inicia o quiz)
        │
        ▼
   quiz_complete (usuário finaliza o quiz)
        │
        ▼
   begin_checkout (página de checkout carrega)
        │
        ▼
   redirect_to_payment (clica para ir ao pagamento Cakto)
        │
        ▼
   [Cakto processa pagamento]
        │
        ▼
   purchase (webhook → backend → GA4 Measurement Protocol)
```

---

## Parte 9: Arquivos do Código Relacionados

| Arquivo | Função |
|---------|--------|
| `index.html` | Script GTM/Stape e noscript |
| `vercel.json` | CSP headers permitindo domínios GTM |
| `src/utils/gtmTracking.ts` | Funções para push no dataLayer e captura do GA Client ID |
| `src/pages/Quiz.tsx` | Dispara `quiz_start` e `quiz_complete` |
| `src/pages/Checkout/index.tsx` | Dispara `begin_checkout` e `redirect_to_payment` |
| `src/pages/PaymentSuccess.tsx` | Dispara `page_view` na página de sucesso |
| `backend/src/utils/serverTracking.ts` | Envia `purchase` via Measurement Protocol |
| `backend/src/routes/payment.ts` | Chama `sendPurchaseToStape` no webhook Cakto |

---

## Parte 10: Botoes GTM-Compativeis (gtm.linkClick)

Todos os CTAs publicos foram convertidos para `<a>` com `href`, `id` e `class`, permitindo que o GTM os identifique nativamente como `gtm.linkClick`.

### IDs dos Botoes

| ID | Arquivo | Destino |
|----|---------|---------|
| `cta_quiz_hero_promo` | HeroSection.tsx | /quiz |
| `cta_quiz_hero_main` | HeroSection.tsx | /quiz |
| `cta_quiz_pricing_{planId}` | RegionalPricingSection.tsx | /quiz |
| `cta_quiz_header_desktop` | Header.tsx | /quiz |
| `cta_quiz_header_mobile` | Header.tsx | /quiz |
| `nav_radiola_desktop` | Header.tsx | /#radiola |
| `nav_radiola_mobile` | Header.tsx | /#radiola |
| `nav_faq_desktop` | Header.tsx | /#faq |
| `nav_faq_mobile` | Header.tsx | /#faq |
| `cta_payment_checkout_mobile` | Checkout/index.tsx | Cakto (externo) |
| `cta_payment_checkout_desktop` | Checkout/index.tsx | Cakto (externo) |
| `cta_payment_checkout_fixed` | Checkout/index.tsx | Cakto (externo) |
| `cta_whatsapp_success` | PaymentSuccess.tsx | WhatsApp (externo) |
| `cta_quiz_about` | About.tsx | /quiz |
| `cta_quiz_howitworks_page` | HowItWorks.tsx (pagina) | /quiz |
| `cta_pricing_howitworks` | HowItWorks.tsx (pagina) | /#pricing |
| `cta_quiz_howitworks` | HowItWorks.tsx (componente) | /quiz |
| `cta_quiz_pricing_page` | Pricing.tsx | /quiz |
| `cta_home_songdownload` | SongDownload.tsx | / |
| `cta_home_songdownload_notfound` | SongDownload.tsx | / |
| `footer_link_home` | Footer.tsx | / |
| `footer_link_quiz` | Footer.tsx | /quiz |
| `footer_link_radiola` | Footer.tsx | /#radiola |
| `footer_link_faq` | Footer.tsx | /#faq |
| `footer_link_pricing` | Footer.tsx | /#pricing |
| `footer_link_terms` | Footer.tsx | /terms |
| `footer_link_privacy` | Footer.tsx | /privacy |

### Configuracao no GTM para capturar linkClick

1. **Variables** → Built-in → marque: `Click URL`, `Click Text`, `Click ID`, `Click Classes`
2. **Triggers** → Just Links → Todos os cliques em links (ou filtre por `Click ID` starts with `cta_`)
3. **Tags** → GA4 Event usando os campos Click ID/Click URL para parametros

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| Script GTM não carrega (404/400) | Verificar se o Custom Loader do Stape está salvo e publicado |
| CSP bloqueando script | Adicionar domínios no `vercel.json` (script-src, connect-src, frame-src) |
| Eventos não aparecem no Tag Assistant | Verificar se o container GTM está publicado |
| `ga_client_id` erro no schema cache | Executar `NOTIFY pgrst, 'reload schema';` no SQL Editor do Supabase |
| Purchase não chega ao GA4 | Verificar variáveis `GA4_MEASUREMENT_ID` e `GA4_API_SECRET` na Vercel |
| Tag Assistant não mostra painel colorido | O painel abre em aba separada (tagassistant.google.com) |
| page_view não dispara em rotas SPA | Verificar acionador History Change e tag GA4 Page View SPA |
