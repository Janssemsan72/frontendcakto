# MusicLovely Frontend

Frontend da aplicação MusicLovely - Plataforma para criação de músicas personalizadas.

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes UI
- **React Router** - Roteamento
- **Supabase** - Backend as a Service
- **TanStack Query** - Gerenciamento de estado servidor

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase (para variáveis de ambiente)

## 🔧 Instalação

```bash
# Instalar dependências
npm install
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://zagkvtxarndluusiluhb.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
VITE_API_URL=https://web-production-83be.up.railway.app

# Opcional: garante o pixel no browser mesmo se a tabela meta_pixels estiver vazia ou RLS bloquear
# VITE_META_PIXEL_ID=123456789012345
# VITE_META_PIXEL_IDS=111111111111111,222222222222222

# Checkout externo: omitir ou `cakto` (padrão); use `hotmart` para página de pagamento Hotmart
# VITE_PAYMENT_GATEWAY=hotmart
# VITE_HOTMART_PAYMENT_URL=https://pay.hotmart.com/SUA_OFERTA  # opcional (senão usa default do código)
# VITE_CAKTO_PAYMENT_URL=https://pay.cakto.com.br/...  # opcional quando gateway for cakto
```

**Onde obter a chave anon:**
1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá em **Settings** → **API**
3. Copie a chave **anon public** (não a service_role!)

⚠️ **IMPORTANTE:** O arquivo `.env` está no `.gitignore` e não será commitado. Nunca commite chaves de API.

## 🛠️ Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# O servidor estará disponível em http://localhost:5173
```

## 📦 Build

```bash
# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Verificar tipos TypeScript
npm run typecheck
```

## 📁 Estrutura do Projeto

```
src/
├── components/     # Componentes React reutilizáveis
├── pages/         # Páginas da aplicação
├── hooks/         # Custom hooks
├── lib/           # Utilitários e helpers
├── services/      # Serviços externos
├── types/         # Definições TypeScript
└── utils/         # Funções utilitárias

public/
├── images/        # Imagens estáticas
├── video/         # Vídeos
├── audio/         # Áudios
└── testimonials/  # Imagens de depoimentos
```

## 🚀 Deploy

### Vercel (Recomendado)

O projeto está configurado para deploy no Vercel. O arquivo `vercel.json` contém as configurações necessárias.

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no dashboard do Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (opcional)
   - `VITE_META_PIXEL_ID` ou `VITE_META_PIXEL_IDS` (opcional; fallback do Meta Pixel)
   - `VITE_PAYMENT_GATEWAY` = `hotmart` ou `cakto` (opcional; padrão `cakto`)
   - `VITE_HOTMART_PAYMENT_URL` / `VITE_CAKTO_PAYMENT_URL` (opcional; URLs de checkout)
3. O deploy será automático a cada push

### Build Command
```bash
npm run build
```

### Output Directory
```
dist
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run typecheck` - Verifica tipos TypeScript

## 🔒 Segurança

- ✅ Use apenas a chave **anon** (pública) no frontend
- ❌ **NUNCA** use a chave `service_role` no frontend
- ✅ O arquivo `.env` está no `.gitignore` (não será commitado)
- ✅ Variáveis de ambiente devem ser configuradas no provedor de hospedagem

## 📄 Licença

Este projeto é privado e proprietário.

## 🤝 Contribuindo

Este é um projeto privado. Para contribuições, entre em contato com a equipe de desenvolvimento.
