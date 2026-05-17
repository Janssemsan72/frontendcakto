/**
 * Integração com Supabase
 * 
 * Exporta o cliente e tipos para uso em toda a aplicação
 */

export { supabase, supabaseSchema, isSupabaseReady, ensureSupabaseInitialized } from './client';
export type { Database, Tables, TablesInsert, TablesUpdate } from './types';
export type {
  Quiz,
  Order,
  Song,
  LyricsApproval,
  EmailLog,
  EmailTemplate,
  Testimonial,
  FAQ,
  Affiliate,
} from './types';
