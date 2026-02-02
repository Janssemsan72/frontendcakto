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

process.exit(0);
