import { useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { LyricsApproval, LyricsStatus } from "@/types/admin";
import { getDeviceInfo } from "@/utils/detection/deviceDetection";
import { logger } from "@/utils/logger";
import {
  sendLyricsPendingWebhook,
  sendN8nLyricsApproved,
} from "@/utils/webhook";

// Verificar se está em desenvolvimento
const isDev = import.meta.env.DEV;

// ✅ CORREÇÃO: Canal realtime compartilhado (singleton) para evitar múltiplas subscriptions
let sharedRealtimeChannel: ReturnType<typeof supabase.channel> | null = null;
let sharedChannelSubscribers = 0;
let globalInvalidationTimeout: NodeJS.Timeout | null = null;
let globalLastInvalidation = 0;
const GLOBAL_DEBOUNCE_MS = 3000; // ✅ CORREÇÃO: Debounce global de 3 segundos para evitar loops

/** Dispara webhook Automaeia quando uma letra entra como pendente (Realtime). */
async function notifyLyricsPendingWebhookForOrder(
  orderId: string | null | undefined
): Promise<void> {
  if (!orderId) return;
  const { data: ord, error } = await supabase
    .from("orders")
    .select("customer_email, customer_whatsapp")
    .eq("id", orderId)
    .maybeSingle();
  if (error) {
    logger.warn("[lyrics_pending webhook] Falha ao buscar pedido", { orderId, error });
  }
  try {
    await sendLyricsPendingWebhook(
      orderId,
      ord?.customer_email ?? "",
      ord?.customer_whatsapp ?? null
    );
  } catch (e) {
    logger.error("[lyrics_pending webhook] Envio falhou", e, { orderId });
  }
}

interface UseLyricsApprovalsOptions {
  status?: LyricsStatus[];
  includeExpired?: boolean;
  limit?: number; // ✅ NOVO: Limite de itens por página
  offset?: number; // ✅ NOVO: Offset para paginação
  enabled?: boolean; // ✅ NOVO: Controlar se a query deve ser executada
}

export function useLyricsApprovals(options: UseLyricsApprovalsOptions = {}) {
  const { status = ['pending'], includeExpired = false, limit, offset = 0, enabled = true } = options;
  const queryClient = useQueryClient();

  // ✅ CORREÇÃO: Desabilitar refetch automático - usar apenas realtime para atualizações
  // Isso evita que as páginas admin fiquem piscando/recarregando constantemente
  const refetchInterval = false; // Desabilitado - usar apenas realtime
  const refetchIntervalInBackground = false; // Desabilitado

  // ✅ CORREÇÃO: Função auxiliar para invalidar queries de dados e contagem
  const invalidateAllQueries = useCallback((refetchType: 'active' | 'all' = 'active') => {
    queryClient.invalidateQueries({ 
      queryKey: ["lyrics-approvals"],
      refetchType
    });
    queryClient.invalidateQueries({ 
      queryKey: ["lyrics-approvals-count"],
      refetchType
    });
  }, [queryClient]);

  // ✅ OTIMIZAÇÃO: Query para buscar aprovações com paginação real
  const { data: approvals, isLoading, error, refetch } = useQuery({
    queryKey: ["lyrics-approvals", status, includeExpired, limit, offset],
    enabled: enabled, // ✅ Controlar se a query deve ser executada
    queryFn: async () => {
      logger.debug('Fetching lyrics approvals', { status, includeExpired, limit, offset });
      
      try {
        // ✅ OTIMIZAÇÃO CRÍTICA: Query única otimizada (removida estratégia de duas queries)
        // ✅ CORREÇÃO: Incluir campo lyrics para exibição (necessário para mostrar as letras)
        // ✅ OTIMIZAÇÃO: Removida busca de songs - carregar apenas quando necessário (lazy loading)
        let query = supabase
          .from("lyrics_approvals")
          .select(`
            id,
            job_id,
            order_id,
            quiz_id,
            status,
            lyrics,
            lyrics_preview,
            voice,
            expires_at,
            created_at,
            updated_at,
            regeneration_count,
            is_highlighted,
            orders(customer_email, plan),
            quizzes(about_who, style, desired_tone, music_prompt, vocal_gender),
            jobs(id, suno_task_id, status)
          `, { count: 'exact' });
        
        // Aplicar filtros
        if (status.length === 1) {
          query = query.eq("status", status[0]);
        } else {
          query = query.in("status", status);
        }
        
        // Aplicar filtro de expires_at ANTES da ordenação para usar índice
        if (!includeExpired) {
          const nowISO = new Date().toISOString();
          query = query.gt('expires_at', nowISO);
        }
        
        // Ordenar
        query = query.order("created_at", { ascending: false });
        
        // ✅ CORREÇÃO: Aplicar paginação apenas se limit estiver definido
        if (limit !== undefined) {
          query = query.range(offset || 0, (offset || 0) + limit - 1);
        }

        const { data: pageData, error } = await query;
      
        if (error) {
          // Tratamento de erro RLS
          const isRLSError = error.code === '42501' || 
                            error.message?.toLowerCase().includes('permission denied') ||
                            error.message?.toLowerCase().includes('row-level security') ||
                            error.message?.toLowerCase().includes('policy violation');
          
          if (isRLSError) {
            const rlsError = new Error(
              'Acesso negado: Você precisa estar autenticado como administrador para acessar as aprovações de letras. ' +
              'Verifique se você está logado e se sua conta tem a role "admin".'
            ) as any;
            rlsError.code = error.code;
            logger.error('Erro de RLS ao buscar lyrics approvals', rlsError, { status, includeExpired });
            throw rlsError;
          }
          
          logger.error('Erro ao buscar lyrics approvals', error, { status, includeExpired });
          throw error;
        }
        
        // ✅ OTIMIZAÇÃO: Removida busca de songs - carregar apenas quando necessário (lazy loading)
        logger.debug('Lyrics approvals loaded', { count: pageData?.length || 0, limit, offset });
        return (pageData || []) as unknown as LyricsApproval[];
      } catch (queryError: any) {
        if (isDev) {
          console.error('❌ [useLyricsApprovals] Erro ao executar query:', queryError);
        }
        logger.error('Erro ao buscar lyrics approvals', queryError, { status, includeExpired });
        throw queryError;
      }
    },
    refetchInterval: refetchInterval, // ✅ Desabilitado - usar apenas realtime
    refetchIntervalInBackground: refetchIntervalInBackground, // ✅ Desabilitado
    refetchOnWindowFocus: false, // ✅ Desabilitado para evitar recarregamentos
    refetchOnMount: false, // ✅ OTIMIZAÇÃO: Não refetch ao montar (usar cache)
    refetchOnReconnect: false, // ✅ Desabilitado - realtime já reconecta automaticamente
    staleTime: 3 * 60 * 1000, // ✅ OTIMIZAÇÃO: 3 minutos - reduzido para melhor performance
    gcTime: 10 * 60 * 1000, // ✅ Manter cache por 10 minutos
    placeholderData: (previousData) => previousData, // ✅ Manter dados anteriores durante refetch (evita piscar)
  });

  // ✅ OTIMIZAÇÃO: Query separada para contar o total
  // ✅ CORREÇÃO: Priorizar RPC count_lyrics_approvals_by_status (SECURITY DEFINER) - bypassa RLS e retorna count real (60k+)
  const { data: totalCount, isLoading: isLoadingCount } = useQuery({
    queryKey: ["lyrics-approvals-count", status, includeExpired],
    enabled: true,
    queryFn: async () => {
      try {
        // ✅ RPC bypassa RLS - retorna count real mesmo com 60k+ registros
        if (status.length === 1) {
          const { data: rpcCount, error: rpcError } = await supabase.rpc('count_lyrics_approvals_by_status', {
            p_status: status[0],
            p_include_expired: includeExpired
          });

          if (!rpcError && rpcCount !== null && rpcCount !== undefined) {
            return Number(rpcCount);
          }
          // Se RPC falhar (ex: função não existe ainda), continua para fallback
          if (isDev && rpcError) {
            console.warn('⚠️ [useLyricsApprovals] RPC count falhou, usando fallback:', rpcError.message);
          }
        }

        // Fallback: query via REST (pode retornar count limitado por RLS)
        let countQuery = supabase
          .from("lyrics_approvals")
          .select("id", { count: 'exact' })
          .range(0, 0);

        if (status.length === 1) {
          countQuery = countQuery.eq("status", status[0]);
        } else {
          countQuery = countQuery.in("status", status);
        }

        if (!includeExpired) {
          const nowISO = new Date().toISOString();
          countQuery = countQuery.gt('expires_at', nowISO);
        }

        const { count, error } = await countQuery;

        if (error) {
          logger.warn('Erro ao contar lyrics approvals', { error });
          return await countManually();
        }

        return count ?? 0;
      } catch (error) {
        logger.warn('Erro ao contar lyrics approvals', { error });
        if (isDev) {
          console.error('❌ [useLyricsApprovals] Erro na contagem:', error);
        }
        return null;
      }
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // ✅ FUNÇÃO AUXILIAR: Contar manualmente (fallback se COUNT falhar)
  const countManually = async (): Promise<number> => {
    let allApprovals: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore && from < 100000) { // Limite de segurança
      let countQuery = supabase
        .from("lyrics_approvals")
        .select("id", { count: 'exact' });
      
      if (status.length === 1) {
        countQuery = countQuery.eq("status", status[0]);
      } else {
        countQuery = countQuery.in("status", status);
      }
      
      countQuery = countQuery.range(from, from + pageSize - 1);

      if (!includeExpired) {
        const nowISO = new Date().toISOString();
        countQuery = countQuery.gt('expires_at', nowISO);
      }

      const { data: pageData, error } = await countQuery;

      if (error || !pageData) {
        break;
      }

      if (pageData.length > 0) {
        allApprovals = allApprovals.concat(pageData);
        from += pageSize;
        hasMore = pageData.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    return allApprovals.length;
  };

  // ✅ CORREÇÃO: Realtime subscription compartilhada (singleton) para evitar múltiplas subscriptions
  // Usar ref para capturar queryClient de forma estável
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient; // Atualizar ref sempre que queryClient mudar
  
  useEffect(() => {
    // ✅ CORREÇÃO ERRO 401: Verificar autenticação antes de criar channel
    const setupRealtime = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          logger.debug('Usuário não autenticado, pulando criação de channel Realtime');
          return;
        }
        
        // Criar canal compartilhado se não existir
        if (!sharedRealtimeChannel) {
          sharedRealtimeChannel = supabase
            .channel('lyrics-approvals-realtime-shared')
            .on('postgres_changes', { 
              event: '*', 
              schema: 'public', 
              table: 'lyrics_approvals' 
            }, (payload) => {
          const now = Date.now();
          
          // ✅ CORREÇÃO: Log detalhado para debug
          logger.debug('Realtime event recebido', {
            event: payload.eventType,
            new: payload.new,
            old: payload.old,
            table: payload.table
          });
          
          // ✅ CORREÇÃO: Se for INSERT de uma aprovação com status 'pending', invalidar e refetchar imediatamente
          if (payload.eventType === 'INSERT' && payload.new?.status === 'pending') {
            logger.debug('Nova aprovação pendente detectada, invalidando e refetchando imediatamente', {
              approval_id: payload.new?.id,
              order_id: payload.new?.order_id
            });

            void notifyLyricsPendingWebhookForOrder(
              payload.new?.order_id as string | undefined
            );
            
            // Invalidar todas as queries relacionadas (incluindo contagem)
            queryClientRef.current.invalidateQueries({ 
              queryKey: ["lyrics-approvals"],
              refetchType: 'active'
            });
            queryClientRef.current.invalidateQueries({ 
              queryKey: ["lyrics-approvals-count"],
              refetchType: 'active'
            });
            
            // Forçar refetch imediato das queries ativas
            const activeQueries = queryClientRef.current.getQueryCache().findAll({ 
              queryKey: ["lyrics-approvals"],
              type: 'active'
            });
            
            activeQueries.forEach(query => {
              queryClientRef.current.refetchQueries({ 
                queryKey: query.queryKey,
                type: 'active'
              });
            });
            
            globalLastInvalidation = now;
            return;
          }
          
          // ✅ CORREÇÃO: Se for UPDATE que muda status para 'pending', também invalidar
          if (payload.eventType === 'UPDATE' && payload.new?.status === 'pending' && payload.old?.status !== 'pending') {
            logger.debug('Aprovação atualizada para pendente, invalidando imediatamente', {
              approval_id: payload.new?.id,
              order_id: payload.new?.order_id
            });

            void notifyLyricsPendingWebhookForOrder(
              payload.new?.order_id as string | undefined
            );

            queryClientRef.current.invalidateQueries({ 
              queryKey: ["lyrics-approvals"],
              refetchType: 'active'
            });
            queryClientRef.current.invalidateQueries({ 
              queryKey: ["lyrics-approvals-count"],
              refetchType: 'active'
            });
            globalLastInvalidation = now;
            return;
          }
          
          // ✅ CORREÇÃO: Debounce GLOBAL para evitar invalidações excessivas de múltiplas instâncias
          // Se já invalidou recentemente (< 3s), aguardar antes de invalidar novamente
          if (now - globalLastInvalidation < GLOBAL_DEBOUNCE_MS) {
            if (globalInvalidationTimeout) {
              clearTimeout(globalInvalidationTimeout);
            }
            globalInvalidationTimeout = setTimeout(() => {
              logger.debug('Invalidando queries após debounce global');
              queryClientRef.current.invalidateQueries({ 
                queryKey: ["lyrics-approvals"],
                refetchType: 'active' // ✅ CORREÇÃO: Refetchar queries ativas para mostrar novas aprovações
              });
              queryClientRef.current.invalidateQueries({ 
                queryKey: ["lyrics-approvals-count"],
                refetchType: 'active'
              });
              globalLastInvalidation = Date.now();
            }, GLOBAL_DEBOUNCE_MS - (now - globalLastInvalidation));
          } else {
            // Invalidar imediatamente se passou tempo suficiente
            logger.debug('Invalidando queries (realtime compartilhado)');
            queryClientRef.current.invalidateQueries({ 
              queryKey: ["lyrics-approvals"],
              refetchType: 'active' // ✅ CORREÇÃO: Refetchar queries ativas para mostrar novas aprovações
            });
            queryClientRef.current.invalidateQueries({ 
              queryKey: ["lyrics-approvals-count"],
              refetchType: 'active'
            });
            globalLastInvalidation = now;
          }
            })
            .on('postgres_changes', {
              event: 'UPDATE',
              schema: 'public',
              table: 'jobs'
            }, async (payload) => {
              // ✅ NOVO: Quando um job receber suno_task_id, aprovar automaticamente a letra
              const newJob = payload.new as any;
              const oldJob = payload.old as any;
              
              // Verificar se o job foi enviado para o Suno (recebeu suno_task_id)
              const wasSentToSuno = !oldJob?.suno_task_id && newJob?.suno_task_id;
              
              if (wasSentToSuno) {
                logger.debug('Job enviado para Suno detectado, aprovando letra automaticamente', {
                  job_id: newJob?.id,
                  suno_task_id: newJob?.suno_task_id
                });
                
                try {
                  // Buscar a lyrics_approval associada a este job
                  const { data: approval, error: approvalError } = await supabase
                    .from('lyrics_approvals')
                    .select('id, status, order_id')
                    .eq('job_id', newJob.id)
                    .eq('status', 'pending')
                    .maybeSingle();
                  
                  if (approvalError) {
                    logger.error('Erro ao buscar lyrics_approval para aprovar', approvalError);
                    return;
                  }
                  
                  if (approval) {
                    // Atualizar status para 'approved'
                    const { error: updateError } = await supabase
                      .from('lyrics_approvals')
                      .update({ 
                        status: 'approved',
                        approved_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', approval.id);
                    
                    if (updateError) {
                      logger.error('Erro ao aprovar letra automaticamente', updateError);
                    } else {
                      logger.debug('Letra aprovada automaticamente após envio para Suno', {
                        approval_id: approval.id,
                        job_id: newJob.id
                      });
                      // Automaeia lyrics_approved (não bloqueante)
                      sendN8nLyricsApproved(approval.id, approval.order_id ?? undefined).catch((err) =>
                        logger.error('Erro ao enviar webhook lyrics_approved (Automaeia)', err)
                      );
                      // Invalidar queries para atualizar as listas
                      queryClientRef.current.invalidateQueries({ 
                        queryKey: ["lyrics-approvals"],
                        refetchType: 'active'
                      });
                      queryClientRef.current.invalidateQueries({ 
                        queryKey: ["lyrics-approvals-count"],
                        refetchType: 'active'
                      });
                    }
                  }
                } catch (error) {
                  logger.error('Erro ao processar aprovação automática', error);
                }
              }
            });
          
          // Subscrever apenas uma vez
          sharedRealtimeChannel.subscribe((status) => {
            logger.debug('Status da subscription realtime:', { status });
            // Logs removidos para reduzir verbosidade - apenas erros críticos serão logados
            if (status === 'CHANNEL_ERROR' && isDev) {
              console.error('❌ [Realtime] Erro na subscription');
            }
          });
          logger.debug('Canal realtime compartilhado criado e subscrito');
          
          // Incrementar contador de subscribers apenas quando channel for criado
          sharedChannelSubscribers++;
          logger.debug('Subscriber adicionado', { total: sharedChannelSubscribers });
        } else {
          // Channel já existe, apenas incrementar contador
          sharedChannelSubscribers++;
          logger.debug('Subscriber adicionado (channel existente)', { total: sharedChannelSubscribers });
        }
      } catch (error) {
        logger.warn('Erro ao verificar autenticação para Realtime:', error);
      }
    };
    
    setupRealtime();

    return () => {
      // Decrementar contador
      sharedChannelSubscribers--;
      logger.debug('Subscriber removido', { total: sharedChannelSubscribers });
      
      // Se não há mais subscribers, limpar canal
      if (sharedChannelSubscribers <= 0 && sharedRealtimeChannel) {
        logger.debug('Removendo canal realtime compartilhado (sem subscribers)');
        
        // ✅ CORREÇÃO: Usar apenas unsubscribe() que é mais seguro
        // O Supabase gerencia a remoção do canal automaticamente após unsubscribe
        const channelToCleanup = sharedRealtimeChannel;
        sharedRealtimeChannel = null;
        sharedChannelSubscribers = 0;
        
        // Limpar timeout global se existir
        if (globalInvalidationTimeout) {
          clearTimeout(globalInvalidationTimeout);
          globalInvalidationTimeout = null;
        }
        
        // ✅ CORREÇÃO: Usar unsubscribe de forma assíncrona e segura
        // Não chamar removeChannel diretamente para evitar erros de WebSocket
        if (channelToCleanup && typeof channelToCleanup.unsubscribe === 'function') {
          // Usar Promise.resolve para garantir que é tratado como assíncrono
          Promise.resolve(channelToCleanup.unsubscribe()).catch((err: any) => {
            // Ignorar erros silenciosamente - o canal pode já estar desconectado
            // Isso é esperado quando o componente é desmontado rapidamente
            if (isDev && err?.message && !err.message.includes('closed')) {
              logger.debug('Erro ao desinscrever canal (não crítico)', err);
            }
          });
        }
      }
    };
  }, []); // ✅ CORREÇÃO: Array vazio - queryClient capturado via ref, não precisa estar nas dependências

  // Mutation para aprovar letras
  const approveMutation = useMutation({
    mutationFn: async (vars: { approvalId: string; orderId?: string | null }) => {
      const { approvalId } = vars;
      try {
        // Verificar se o cliente Supabase está inicializado corretamente
        if (!supabase || !supabase.functions) {
          logger.error('Cliente Supabase não inicializado corretamente', { hasSupabase: !!supabase, hasFunctions: !!supabase?.functions });
          throw new Error('Cliente Supabase não está configurado. Recarregue a página.');
        }

        // Obter sessão (opcional - algumas Edge Functions não requerem autenticação)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const authToken = session?.access_token;

        logger.debug('Chamando Edge Function admin-approve-lyrics', { approvalId, hasToken: !!authToken });

        // Chamar edge function que aprova e inicia geração de áudio - passar headers apenas se houver token
        const { data, error } = await supabase.functions.invoke('admin-approve-lyrics', {
          body: { approval_id: approvalId },
          headers: authToken ? {
            Authorization: `Bearer ${authToken}`
          } : undefined
        });

        if (error) {
          logger.error('Erro na Edge Function admin-approve-lyrics', error, { 
            approvalId, 
            status: error.status,
            message: error.message,
            context: error.context
          });
          throw error;
        }

        // ✅ CORREÇÃO: Verificar se a resposta confirma sucesso antes de retornar
        if (!data || (data.success === false)) {
          const errorMessage = data?.error || 'Erro ao aprovar letra';
          logger.error('Erro ao aprovar letra - resposta da edge function indica falha', { approvalId, data });
          throw new Error(errorMessage);
        }

        return data;
      } catch (error) {
        logger.error('Erro ao aprovar letras', error, { approvalId });
        throw error;
      }
    },
    onSuccess: (data, vars) => {
      const { approvalId, orderId } = vars;
      // Automaeia lyrics_approved (aprovação manual; não bloqueante)
      sendN8nLyricsApproved(approvalId, orderId ?? undefined).catch((err) =>
        logger.error('Erro ao enviar webhook lyrics_approved manual (Automaeia)', err)
      );
      // ✅ CORREÇÃO: Aguardar delay suficiente para garantir que o toast de sucesso apareça primeiro
      // O card só desaparecerá após a mensagem de sucesso aparecer e ser visível
      setTimeout(() => {
        invalidateAllQueries('active');
        globalLastInvalidation = Date.now();
        logger.debug('Aprovação confirmada - queries invalidadas', { approvalId });
      }, 300); // Delay de 300ms para garantir que o toast apareça e seja visível antes do card desaparecer
    },
    onError: (error) => {
      // ✅ CORREÇÃO: Não invalidar queries em caso de erro - manter o card visível
      logger.error('Erro na mutation de aprovação - card permanece em pendentes', error);
    }
  });

  // Mutation para rejeitar letras
  const rejectMutation = useMutation({
    mutationFn: async ({ approvalId, reason }: { approvalId: string; reason: string }) => {
      try {
        // Verificar se o cliente Supabase está inicializado corretamente
        if (!supabase || !supabase.functions) {
          logger.error('Cliente Supabase não inicializado corretamente', { hasSupabase: !!supabase, hasFunctions: !!supabase?.functions });
          throw new Error('Cliente Supabase não está configurado. Recarregue a página.');
        }

        // Obter sessão (opcional - algumas Edge Functions não requerem autenticação)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const authToken = session?.access_token;

        logger.debug('Chamando Edge Function admin-reject-lyrics', { approvalId, hasToken: !!authToken });

        // Chamar edge function que rejeita e atualiza job - passar headers apenas se houver token
        const { data, error } = await supabase.functions.invoke('admin-reject-lyrics', {
          body: { approval_id: approvalId, reason: reason },
          headers: authToken ? {
            Authorization: `Bearer ${authToken}`
          } : undefined
        });

        if (error) {
          logger.error('Erro na Edge Function admin-reject-lyrics', error, { 
            approvalId, 
            status: error.status,
            message: error.message,
            context: error.context
          });
          throw error;
        }

        return data;
      } catch (error) {
        logger.error('Erro ao rejeitar letras', error, { approvalId });
        throw error;
      }
    },
    onSuccess: () => {
      // ✅ CORREÇÃO: Usar debounce global para invalidação
      const now = Date.now();
      if (now - globalLastInvalidation < GLOBAL_DEBOUNCE_MS) {
        if (globalInvalidationTimeout) {
          clearTimeout(globalInvalidationTimeout);
        }
        globalInvalidationTimeout = setTimeout(() => {
          invalidateAllQueries('active');
          globalLastInvalidation = Date.now();
        }, GLOBAL_DEBOUNCE_MS - (now - globalLastInvalidation));
      } else {
        invalidateAllQueries('active');
        globalLastInvalidation = now;
      }
    }
  });

  // Mutation para regenerar letras
  const regenerateMutation = useMutation({
    mutationFn: async (approvalId: string) => {
      try {
        // Verificar se o cliente Supabase está inicializado corretamente
        if (!supabase || !supabase.functions) {
          logger.error('Cliente Supabase não inicializado corretamente', { hasSupabase: !!supabase, hasFunctions: !!supabase?.functions });
          throw new Error('Cliente Supabase não está configurado. Recarregue a página.');
        }

        // Obter sessão (opcional - algumas Edge Functions não requerem autenticação)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const authToken = session?.access_token;

        // ✅ DIAGNÓSTICO: Verificar URL do Supabase antes de chamar Edge Function (apenas em dev)
        const supabaseUrl = (supabase as any).supabaseUrl || (supabase as any).rest?.url || 'não detectado';
        if (isDev) {
          console.log('🔍 [DIAGNÓSTICO] Chamando Edge Function regenerate-lyrics:', {
            approvalId,
            hasToken: !!authToken,
            supabaseUrl,
            isLocalhost: supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1'),
            hasFunctions: !!supabase.functions
          });
        }
        
        // ✅ CORREÇÃO CRÍTICA: Se estiver em localhost, avisar que Edge Functions só funcionam no remoto
        if (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1')) {
          const errorMsg = 'Edge Functions não estão disponíveis em localhost. O cliente Supabase precisa estar configurado para usar a URL remota do Supabase.';
          if (isDev) {
            console.error('❌ [DIAGNÓSTICO]', errorMsg);
          }
          logger.error('Tentativa de chamar Edge Function em localhost', { supabaseUrl, approvalId });
          throw new Error(errorMsg);
        }

        logger.debug('Chamando Edge Function regenerate-lyrics', { approvalId, hasToken: !!authToken, supabaseUrl });

        // Chamar a Edge Function de regeneração - passar headers apenas se houver token (mesmo padrão das outras)
        const { data, error } = await supabase.functions.invoke('regenerate-lyrics', {
          body: { approval_id: approvalId },
          headers: authToken ? {
            Authorization: `Bearer ${authToken}`
          } : undefined
        });
        
        if (error) {
          // Extrair mensagem de erro mais detalhada
          let errorMessage = error.message || 'Erro desconhecido ao chamar Edge Function';
          
          // Se for erro 404, a função pode não estar deployada
          if (error.status === 404) {
            errorMessage = 'Edge Function "regenerate-lyrics" não encontrada. Verifique se está deployada no Supabase Dashboard.';
          } else if (error.status === 503 || errorMessage.includes('Failed to send a request')) {
            errorMessage = 'Não foi possível conectar à Edge Function. A função pode não estar deployada ou há um problema de rede. Verifique o Supabase Dashboard.';
          } else if (error.status) {
            errorMessage = `Erro ${error.status}: ${errorMessage}`;
          }
          
          logger.error('Erro na Edge Function regenerate-lyrics', error, { 
            approvalId, 
            status: error.status,
            message: error.message,
            context: error.context,
            errorMessage
          });
          
          throw new Error(errorMessage);
        }

        // ✅ CORREÇÃO: Algumas funções retornam HTTP 200 com success=false para evitar erro non-2xx no invoke
        // Nesse caso, precisamos tratar aqui e lançar um erro para a UI.
        if ((data as any)?.success === false || (data as any)?.error) {
          const msg =
            (data as any)?.error ||
            'Erro ao regenerar letra. Verifique as secrets (OPENAI_API_KEY/SUPABASE_SERVICE_ROLE_KEY) e logs da Edge Function.';
          logger.error('regenerate-lyrics retornou falha', { approvalId, data });
          throw new Error(msg);
        }
        
        return { approvalId, data };
      } catch (error) {
        // Se já for um Error com mensagem, re-throw
        if (error instanceof Error) {
          throw error;
        }
        
        // Caso contrário, criar um novo Error
        logger.error('Erro ao regenerar letras', error, { approvalId });
        throw new Error('Erro desconhecido ao regenerar letras');
      }
    },
    onSuccess: ({ approvalId, data }) => {
      // Atualização otimista: aplicar lyrics/preview retornados (se vierem) no item do cache
      const updatedApproval = data?.approval;
      const keys = queryClient.getQueryCache().findAll({ queryKey: ["lyrics-approvals"] }) || [];
      if (updatedApproval) {
        keys.forEach(k => {
          queryClient.setQueryData(k.queryKey, (old: any[] = []) =>
            old.map(a => a?.id === approvalId ? { ...a, ...updatedApproval } : a)
          );
        });
      }
      // ✅ CORREÇÃO: Usar debounce global para invalidação
      const now = Date.now();
      if (now - globalLastInvalidation < GLOBAL_DEBOUNCE_MS) {
        if (globalInvalidationTimeout) {
          clearTimeout(globalInvalidationTimeout);
        }
        globalInvalidationTimeout = setTimeout(() => {
          invalidateAllQueries('active');
          globalLastInvalidation = Date.now();
        }, GLOBAL_DEBOUNCE_MS - (now - globalLastInvalidation));
      } else {
        invalidateAllQueries('active');
        globalLastInvalidation = now;
      }
    }
  });

  // Mutation para desaprovar letras (reverter approved -> pending)
  const unapproveMutation = useMutation({
    mutationFn: async (approvalId: string) => {
      try {
        // Verificar se o cliente Supabase está inicializado corretamente
        if (!supabase || !supabase.functions) {
          logger.error('Cliente Supabase não inicializado corretamente', { hasSupabase: !!supabase, hasFunctions: !!supabase?.functions });
          throw new Error('Cliente Supabase não está configurado. Recarregue a página.');
        }

        // Obter sessão (opcional - algumas Edge Functions não requerem autenticação)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const authToken = session?.access_token;

        logger.debug('Chamando Edge Function admin-unapprove-lyrics', { approvalId, hasToken: !!authToken });

        const { data, error } = await supabase.functions.invoke('admin-unapprove-lyrics', {
          body: { approval_id: approvalId },
          headers: authToken ? {
            Authorization: `Bearer ${authToken}`
          } : undefined
        });

        if (error) {
          logger.error('Erro na Edge Function admin-unapprove-lyrics', error, { 
            approvalId, 
            status: error.status,
            message: error.message,
            context: error.context
          });
          throw error;
        }

        return data;
      } catch (error) {
        logger.error('Erro ao desaprovar letras', error, { approvalId });
        throw error;
      }
    },
    onSuccess: async () => {
      // ✅ CORREÇÃO: Usar debounce global para invalidação
      const now = Date.now();
      if (now - globalLastInvalidation < GLOBAL_DEBOUNCE_MS) {
        if (globalInvalidationTimeout) {
          clearTimeout(globalInvalidationTimeout);
        }
        globalInvalidationTimeout = setTimeout(async () => {
          invalidateAllQueries('active');
          globalLastInvalidation = Date.now();
        }, GLOBAL_DEBOUNCE_MS - (now - globalLastInvalidation));
      } else {
        invalidateAllQueries('active');
        globalLastInvalidation = now;
      }
    }
  });

  // Mutation para deletar letras
  const deleteMutation = useMutation({
    mutationFn: async (approvalId: string) => {
      try {
        // Verificar se o cliente Supabase está inicializado corretamente
        if (!supabase || !supabase.functions) {
          logger.error('Cliente Supabase não inicializado corretamente', { hasSupabase: !!supabase, hasFunctions: !!supabase?.functions });
          throw new Error('Cliente Supabase não está configurado. Recarregue a página.');
        }

        // Obter sessão (opcional - algumas Edge Functions não requerem autenticação)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        const authToken = session?.access_token;

        logger.debug('Chamando Edge Function delete-lyrics-approval', { approvalId, hasToken: !!authToken });

        const { data, error } = await supabase.functions.invoke('delete-lyrics-approval', {
          body: { approval_id: approvalId },
          headers: authToken ? {
            Authorization: `Bearer ${authToken}`
          } : undefined
        });

        if (error) {
          logger.error('Erro na Edge Function delete-lyrics-approval', error, { 
            approvalId, 
            status: error.status,
            message: error.message,
            context: error.context
          });
          throw error;
        }

        return { approvalId };
      } catch (error) {
        logger.error('Erro ao deletar letras', error, { approvalId });
        throw error;
      }
    },
    onMutate: async (approvalId: string) => {
      // Cancelar refetches em andamento
      await queryClient.cancelQueries({ queryKey: ["lyrics-approvals"] });

      // Snapshot do cache atual para restaurar em caso de erro
      const keys = queryClient.getQueryCache().findAll({ queryKey: ["lyrics-approvals"] }) || [];
      const snapshots = keys.map(k => ({ key: k.queryKey, data: queryClient.getQueryData(k.queryKey) }));

      // Remoção otimista para todas as variantes (pending/approved/rejected)
      keys.forEach(k => {
        queryClient.setQueryData(k.queryKey, (old: any[] = []) => old.filter(a => a?.id !== approvalId));
      });

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      // Restaurar snapshots em caso de falha
      if (ctx?.snapshots) {
        ctx.snapshots.forEach((s: any) => queryClient.setQueryData(s.key, s.data));
      }
    },
    onSettled: () => {
      // ✅ CORREÇÃO: Usar debounce global para invalidação
      const now = Date.now();
      if (now - globalLastInvalidation < GLOBAL_DEBOUNCE_MS) {
        if (globalInvalidationTimeout) {
          clearTimeout(globalInvalidationTimeout);
        }
        globalInvalidationTimeout = setTimeout(() => {
          invalidateAllQueries('active');
          globalLastInvalidation = Date.now();
        }, GLOBAL_DEBOUNCE_MS - (now - globalLastInvalidation));
      } else {
        invalidateAllQueries('active');
        globalLastInvalidation = now;
      }
    }
  });

  return {
    approvals: approvals || [],
    // ✅ CORREÇÃO: Para pendentes, não usar fallback de length para evitar mostrar contagem errada
    // Só mostrar totalCount quando estiver pronto, ou usar length apenas se não for pending
    totalCount: status.includes('pending') 
      ? (totalCount ?? null) // Para pending, aguardar contagem filtrada completa
      : (totalCount ?? (approvals?.length ?? 0)), // Para outros status, usar fallback
    isLoading: isLoading || isLoadingCount, // Incluir loading da contagem
    error,
    refetch,
    approve: approveMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    unapprove: unapproveMutation.mutateAsync,
    regenerate: regenerateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isUnapproving: unapproveMutation.isPending,
    isRegenerating: regenerateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
