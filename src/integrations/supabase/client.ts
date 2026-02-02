/**
 * Cliente Supabase para comunicação com o backend
 * 
 * Este arquivo fornece:
 * - Cliente Supabase singleton
 * - Funções de inicialização e verificação de estado
 * - Tipagem correta para o banco de dados
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

// Declaração global para manter singleton
declare global {
  interface Window {
    __SUPABASE_CLIENT_INSTANCE__?: SupabaseClient<Database> & { __isRealClient?: boolean };
  }
}

// Função para criar cliente dummy quando as variáveis de ambiente não estão configuradas
function createDummyClient(): SupabaseClient<Database> {
  console.warn('[Supabase] Variáveis de ambiente não configuradas. Usando cliente dummy.');
  
  const dummyClient = {
    __isRealClient: false,
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: { message: 'Supabase não configurado' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: { message: 'Supabase não configurado' } }),
      update: () => ({ data: null, error: { message: 'Supabase não configurado' } }),
      delete: () => ({ data: null, error: { message: 'Supabase não configurado' } }),
      upsert: () => ({ data: null, error: { message: 'Supabase não configurado' } }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Supabase não configurado' } }),
        download: async () => ({ data: null, error: { message: 'Supabase não configurado' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        createSignedUrl: async () => ({ data: null, error: { message: 'Supabase não configurado' } }),
      }),
    },
    functions: {
      invoke: async () => ({ data: null, error: { message: 'Supabase não configurado' } }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => {},
    rpc: async () => ({ data: null, error: { message: 'Supabase não configurado' } }),
  } as unknown as SupabaseClient<Database> & { __isRealClient: boolean };
  
  return dummyClient;
}

// Função para criar o cliente Supabase real
function createSupabaseClient(): SupabaseClient<Database> {
  // Verificar se as variáveis de ambiente estão configuradas
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas');
    console.error('[Supabase] URL:', SUPABASE_URL ? '✅' : '❌');
    console.error('[Supabase] KEY:', SUPABASE_ANON_KEY ? '✅' : '❌');
    return createDummyClient();
  }

  try {
    const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
      global: {
        headers: {
          'x-client-info': 'musiclovely-frontend',
        },
      },
    });

    // Marcar como cliente real
    (client as any).__isRealClient = true;
    
    console.log('[Supabase] Cliente inicializado com sucesso');
    return client;
  } catch (error) {
    console.error('[Supabase] Erro ao criar cliente:', error);
    return createDummyClient();
  }
}

// Função para obter ou criar o cliente singleton
function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    // SSR - criar novo cliente
    return createSupabaseClient();
  }

  // Verificar se já existe uma instância
  if (window.__SUPABASE_CLIENT_INSTANCE__) {
    return window.__SUPABASE_CLIENT_INSTANCE__;
  }

  // Criar nova instância
  const client = createSupabaseClient();
  window.__SUPABASE_CLIENT_INSTANCE__ = client as SupabaseClient<Database> & { __isRealClient?: boolean };
  
  return client;
}

// Exportar o cliente singleton
export const supabase = getSupabaseClient();

/**
 * Verifica se o Supabase está pronto para uso
 * @returns true se o cliente está inicializado e é um cliente real
 */
export function isSupabaseReady(): boolean {
  if (typeof window === 'undefined') return false;
  
  const client = window.__SUPABASE_CLIENT_INSTANCE__;
  if (!client) return false;
  
  // Verificar se é um cliente real (não dummy)
  return (client as any).__isRealClient === true;
}

/**
 * Garante que o Supabase está inicializado
 * Força a criação do cliente se ainda não existir
 */
export function ensureSupabaseInitialized(): void {
  if (typeof window === 'undefined') return;
  
  // Se não tem instância, criar uma nova
  if (!window.__SUPABASE_CLIENT_INSTANCE__) {
    console.log('[Supabase] Inicializando cliente...');
    window.__SUPABASE_CLIENT_INSTANCE__ = createSupabaseClient() as SupabaseClient<Database> & { __isRealClient?: boolean };
    return;
  }
  
  // Se tem instância mas não é real, tentar criar uma real
  const current = window.__SUPABASE_CLIENT_INSTANCE__;
  if (!(current as any).__isRealClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    console.log('[Supabase] Reinicializando com credenciais...');
    window.__SUPABASE_CLIENT_INSTANCE__ = createSupabaseClient() as SupabaseClient<Database> & { __isRealClient?: boolean };
  }
}

// Exportar tipos úteis
export type { SupabaseClient };
