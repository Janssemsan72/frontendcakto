#!/usr/bin/env node
/**
 * Valida variáveis de ambiente necessárias para o build.
 * Usado no prebuild para alertar sobre variáveis faltando.
 * Não bloqueia o build (prebuild usa || true).
 */

const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missing = required.filter((key) => {
  const val = process.env[key];
  return !val || (typeof val === 'string' && val.trim() === '');
});

if (missing.length > 0 && process.env.NODE_ENV === 'production') {
  console.warn(
    `[validate-env] Variáveis não definidas (Vercel: configure em Project Settings > Environment Variables): ${missing.join(', ')}`
  );
}

// Checkout externo: Cakto usa URL padrão em código se VITE_CAKTO_PAYMENT_URL vazio; Hotmart idem com VITE_HOTMART_PAYMENT_URL.

const relayFn = (process.env.VITE_AUTOMATEIA_RELAY_FUNCTION || '').trim();
if (relayFn === 'n8n-webhook') {
  console.warn(
    '[validate-env] VITE_AUTOMATEIA_RELAY_FUNCTION=n8n-webhook → o front chama n8n-webhook para relay Automaeia. ' +
      'Garanta deploy recente dessa Edge Function (bloco relay) ou remova a env para usar o padrão admin-automaeia-relay.'
  );
}

process.exit(0);
