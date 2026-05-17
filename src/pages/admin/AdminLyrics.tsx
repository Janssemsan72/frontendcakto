import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EnhancedTabs, EnhancedTabsContent, EnhancedTabsList, EnhancedTabsTrigger } from "@/components/ui/enhanced-tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, RefreshCw, Search, Loader2, RotateCcw, Play, Pause, ChevronLeft, ChevronRight } from "@/utils/iconImports";
import { useLyricsApprovals } from "@/hooks/useLyricsApprovals";
import { LyricsCard } from "@/components/admin/LyricsCard";
import { RegenerateAllProgressDialog } from "@/components/admin/RegenerateAllProgressDialog";
import type { LyricsApproval, LyricsStatus } from "@/types/admin";
import { logger } from "@/utils/logger";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { AdminPageLoading } from "@/components/admin/AdminPageLoading";
import { useDebounce } from "@/hooks/use-debounce";
import { useRegenerateAllLyrics } from "@/hooks/useRegenerateAllLyrics";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminAutoJobs,
  useAdminAutoJobRealtime,
  ADMIN_AUTO_JOB_TYPES,
} from "@/hooks/useAdminAutoJobs";

const LYRICS_QUERY_KEYS = {
  list: ["lyrics-approvals"],
  count: ["lyrics-approvals-count"],
} as const;

export default function AdminLyrics() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // ✅ OTIMIZAÇÃO: Debounce para reduzir filtros
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  // ✅ PAGINAÇÃO: 50 itens por página para suportar 60k+ registros
  const ITEMS_PER_PAGE = 50;
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);

  // ✅ CORREÇÃO: Usar useMemo para evitar recriação de arrays a cada render
  const pendingStatus = useMemo(() => ['pending'] as LyricsStatus[], []);
  const approvedStatus = useMemo(() => ['approved'] as LyricsStatus[], []);
  const rejectedStatus = useMemo(() => ['rejected'] as LyricsStatus[], []);

  // ✅ PRIORIDADE: Estado para controlar qual tab está ativa (pendentes carregam primeiro)
  const [activeTab, setActiveTab] = useState<string>("pending");

  // ✅ CORREÇÃO: Query adicional para buscar letras por email em todos os status quando houver busca
  const [searchResults, setSearchResults] = useState<LyricsApproval[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Aprovação automática: flag em admin_auto_jobs; worker no backend a cada 8s (página pode estar fechada)
  const {
    isEnabled: isAutoApproveEnabled,
    setEnabled: setAutoApproveEnabled,
    isUpdating: isAutoApproveUpdating,
  } = useAdminAutoJobs();
  useAdminAutoJobRealtime();

  // ✅ PRIORIDADE: Hook para aprovações pendentes com paginação
  // Pendentes sempre carregam primeiro (sempre habilitado)
  const {
    approvals: pendingApprovalsPage,
    totalCount: pendingTotalCount,
    isLoading: loadingPending,
    error: errorPending,
    refetch: refetchPending,
    approve,
    reject,
    regenerate,
    delete: deletePending,
    isApproving,
    isRejecting,
    isRegenerating,
    isDeleting: isDeletingPending
  } = useLyricsApprovals({ 
    status: pendingStatus, 
    includeExpired: true,
    limit: ITEMS_PER_PAGE,
    offset: (pendingPage - 1) * ITEMS_PER_PAGE,
    enabled: true // ✅ Pendentes sempre carregam primeiro
  });

  // ✅ OTIMIZAÇÃO: Hooks separados para totais (sempre carregam para mostrar badges corretas)
  const { totalCount: approvedTotalCount } = useLyricsApprovals({ 
    status: approvedStatus, 
    includeExpired: true,
    enabled: true // ✅ Sempre habilitado para mostrar total correto
  });

  const { totalCount: rejectedTotalCount } = useLyricsApprovals({ 
    status: rejectedStatus, 
    includeExpired: true,
    enabled: true // ✅ Sempre habilitado para mostrar total correto
  });

  // Hook para aprovações aprovadas com paginação
  // ✅ OTIMIZAÇÃO: Só carregar dados quando a tab estiver ativa
  const {
    approvals: approvedApprovalsPage,
    isLoading: loadingApproved,
    error: errorApproved,
    refetch: refetchApproved,
    unapprove,
    delete: deleteApproved,
    isUnapproving,
    isDeleting: isDeletingApproved
  } = useLyricsApprovals({ 
    status: approvedStatus, 
    includeExpired: true,
    limit: ITEMS_PER_PAGE,
    offset: (approvedPage - 1) * ITEMS_PER_PAGE,
    enabled: activeTab === "approved" // ✅ Só carregar dados quando tab estiver ativa
  });

  // Refs para refetch: evita reexecutar o effect a cada render e manter intervalo estável de 8s
  const refetchPendingRef = useRef(refetchPending);
  const refetchApprovedRef = useRef(refetchApproved);
  refetchPendingRef.current = refetchPending;
  refetchApprovedRef.current = refetchApproved;

  // Invalidar lista e contagem (para o badge "Pendentes" diminuir como ao clicar em Aprovar)
  const invalidateLyricsQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: LYRICS_QUERY_KEYS.list });
    queryClient.invalidateQueries({ queryKey: LYRICS_QUERY_KEYS.count });
  }, [queryClient]);

  // Fallback: com a página aberta e aprovação automática ativada, o frontend chama a Edge Function a cada 8s
  const autoApproveOn = isAutoApproveEnabled(
    ADMIN_AUTO_JOB_TYPES.AUTO_APPROVE_LYRICS
  );
  useEffect(() => {
    if (!autoApproveOn) return;
    const LYRICS_INTERVAL_MS = 8000;

    const runOnce = () => {
      supabase.functions
        .invoke("run-one-auto-approve-lyrics", { body: {} })
        .then(({ data, error }) => {
          if (!error && data?.ok !== false) {
            invalidateLyricsQueries();
            refetchPendingRef.current?.();
            refetchApprovedRef.current?.();
          }
          if (error && import.meta.env.DEV) {
            console.warn("[Auto-approve] Erro na Edge Function:", error);
            toast.error(
              "Aprovação automática: falha na chamada. Verifique o console."
            );
          }
        })
        .catch((err) => {
          refetchPendingRef.current?.();
          refetchApprovedRef.current?.();
          if (import.meta.env.DEV) {
            console.warn(
              "[Auto-approve] Falha ao chamar run-one-auto-approve-lyrics:",
              err
            );
            toast.error(
              "Aprovação automática: falha (CORS/rede?). Verifique o console."
            );
          }
        });
    };

    runOnce();
    const t = setInterval(runOnce, LYRICS_INTERVAL_MS);
    return () => clearInterval(t);
  }, [autoApproveOn, invalidateLyricsQueries]);

  // Hook para aprovações rejeitadas com paginação (só carrega quando a tab estiver ativa)
  const {
    approvals: rejectedApprovalsPage,
    isLoading: loadingRejected,
    error: errorRejected,
    refetch: refetchRejected,
    delete: deleteRejected,
    isDeleting: isDeletingRejected
  } = useLyricsApprovals({ 
    status: rejectedStatus, 
    includeExpired: true,
    limit: ITEMS_PER_PAGE,
    offset: (rejectedPage - 1) * ITEMS_PER_PAGE,
    enabled: activeTab === "rejected"
  });

  // ✅ Hook robusto para regeneração em massa
  const handleRefetchAll = useCallback(async () => {
    await Promise.all([refetchPending(), refetchApproved(), refetchRejected()]);
  }, [refetchPending, refetchApproved, refetchRejected]);

  const {
    progress: regenerateProgress,
    isRunning: isRegeneratingAll,
    hasSavedProgress,
    start: startRegenerate,
    resume: resumeRegenerate,
    stop: stopRegenerate,
    clear: clearRegenerate
  } = useRegenerateAllLyrics(handleRefetchAll);

  // Mostrar diálogo automaticamente se há progresso salvo não concluído
  useEffect(() => {
    if (hasSavedProgress && regenerateProgress && !regenerateProgress.isComplete) {
      setShowProgressDialog(true);
    }
  }, [hasSavedProgress, regenerateProgress]);

  // ✅ CORREÇÃO: Buscar letras por email em todos os status quando houver termo de busca
  useEffect(() => {
    const searchByEmail = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      const term = debouncedSearchTerm.trim().toLowerCase();
      
      // Verificar se o termo parece ser um email (contém @)
      const isEmailSearch = term.includes('@');

      if (!isEmailSearch) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        // ✅ CORREÇÃO: Primeiro buscar os pedidos pelo email
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id")
          .ilike("customer_email", `%${term}%`);

        if (ordersError) {
          logger.error('Erro ao buscar pedidos por email', ordersError);
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        if (!orders || orders.length === 0) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        // ✅ CORREÇÃO: Buscar letras de todos os status associadas aos pedidos encontrados
        const orderIds = orders.map(o => o.id);
        const { data: allApprovals, error } = await supabase
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
          `)
          .in("order_id", orderIds)
          .order("created_at", { ascending: false });

        if (error) {
          logger.error('Erro ao buscar letras por email', error);
          setSearchResults([]);
        } else {
          setSearchResults((allApprovals || []) as unknown as LyricsApproval[]);
        }
      } catch (error) {
        logger.error('Erro ao buscar letras por email', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchByEmail();
  }, [debouncedSearchTerm]);

  const handleApprove = useCallback(async (approvalId: string, orderId?: string | null) => {
    try {
      // Verificar autenticação antes de prosseguir
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Usuário não autenticado. Faça login novamente.');
        logger.error('Usuário não autenticado ao aprovar letras', authError);
        return;
      }

      logger.debug('Iniciando aprovação de letras', { approvalId, orderId });
      // ✅ CORREÇÃO: Aguardar confirmação do servidor antes de mostrar sucesso
      await approve({ approvalId, orderId });
      // ✅ CORREÇÃO: Só mostrar sucesso após confirmação - o card será movido via invalidação de queries
      toast.success('Letras aprovadas com sucesso!');
      logger.event('lyrics_approved', { approvalId });
    } catch (error) {
      logger.error('Erro ao aprovar letras', error, { approvalId });
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao aprovar letras: ${errorMessage}`);
    }
  }, [approve]);

  const handleReject = useCallback(async (approvalId: string, reason: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Usuário não autenticado. Faça login novamente.');
        logger.error('Usuário não autenticado ao reprovar letras', authError);
        return;
      }

      logger.debug('Iniciando reprovação de letras', { approvalId, reason });
      await reject({ approvalId, reason });
      toast.success('Letra reprovada. Nova letra será gerada automaticamente.');
      logger.event('lyrics_rejected', { approvalId });
    } catch (error) {
      logger.error('Erro ao reprovar letras', error, { approvalId });
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao reprovar letras: ${errorMessage}`);
    }
  }, [reject]);

  const handleRegenerate = useCallback(async (approvalId: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Usuário não autenticado. Faça login novamente.');
        logger.error('Usuário não autenticado ao regenerar letras', authError);
        return;
      }

      logger.debug('Iniciando regeneração de letras', { approvalId });
      await regenerate(approvalId);
      toast.success('Regeneração de letra iniciada!');
      logger.event('lyrics_regenerated', { approvalId });
    } catch (error) {
      logger.error('Erro ao regenerar letras', error, { approvalId });
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao regenerar letras: ${errorMessage}`);
    }
  }, [regenerate]);

  const handleUnapprove = useCallback(async (approvalId: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Usuário não autenticado. Faça login novamente.');
        logger.error('Usuário não autenticado ao desaprovar letras', authError);
        return;
      }

      logger.debug('Iniciando desaprovação de letras', { approvalId });
      await unapprove(approvalId);
      toast.success('Letra desaprovada. Ela voltará para a lista de pendentes.');
      logger.event('lyrics_unapproved', { approvalId });
    } catch (error) {
      logger.error('Erro ao desaprovar letras', error, { approvalId });
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao desaprovar letras: ${errorMessage}`);
    }
  }, [unapprove]);

  const handleDelete = useCallback(async (approvalId: string, status: string) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Usuário não autenticado. Faça login novamente.');
        logger.error('Usuário não autenticado ao deletar letras', authError);
        return;
      }

      logger.debug('Iniciando exclusão de letras', { approvalId, status });
      
      if (status === 'pending') {
        await deletePending(approvalId);
      } else if (status === 'approved') {
        await deleteApproved(approvalId);
      } else if (status === 'rejected') {
        await deleteRejected(approvalId);
      }
      
      toast.success('Letra excluída com sucesso!');
      logger.event('lyrics_deleted', { approvalId, status });
    } catch (error) {
      logger.error('Erro ao deletar letras', error, { approvalId, status });
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao deletar letras: ${errorMessage}`);
    }
  }, [deletePending, deleteApproved, deleteRejected]);

  const handleEdit = useCallback(async (approvalId: string, lyrics: any) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Usuário não autenticado. Faça login novamente.');
        logger.error('Usuário não autenticado ao editar letras', authError);
        throw new Error('Usuário não autenticado');
      }

      logger.debug('Iniciando edição de letras', { approvalId, lyrics });
      
      // Chamar edge function para atualizar letras
      const { data, error } = await supabase.functions.invoke('admin-edit-lyrics', {
        body: {
          approval_id: approvalId,
          lyrics: lyrics
        }
      });

      if (error) {
        logger.error('Erro na edge function admin-edit-lyrics', error, { approvalId });
        throw error;
      }

      // Verificar resposta da edge function
      if (data && data.error) {
        logger.error('Erro retornado pela edge function', data.error, { approvalId });
        throw new Error(data.error || 'Erro ao editar letra');
      }

      if (!data || !data.success) {
        logger.error('Resposta inválida da edge function', { data, approvalId });
        throw new Error('Resposta inválida do servidor');
      }

      toast.success('Letra atualizada com sucesso!');
      
      // Atualizar todas as tabs para garantir que os dados estejam sincronizados
      await Promise.all([
        refetchPending(),
        refetchApproved(),
        refetchRejected()
      ]);
      
      logger.event('lyrics_edited', { approvalId });
    } catch (error) {
      logger.error('Erro ao editar letras', error, { approvalId });
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao editar letras: ${errorMessage}`);
      throw error; // Re-throw para que o componente possa tratar
    }
  }, [refetchPending, refetchApproved, refetchRejected]);

  // ✅ OTIMIZAÇÃO: Estados para lazy loading com paginação real
  // ✅ CORREÇÃO: Removidos estados de paginação (carrega tudo de uma vez)

  // Função para remover duplicatas - mantém apenas a aprovação mais recente por order_id e status
  const removeDuplicates = useCallback((approvals: LyricsApproval[]): LyricsApproval[] => {
    if (!approvals || approvals.length === 0) return [];
    
    // Criar um mapa para agrupar por order_id e status
    const map = new Map<string, LyricsApproval>();
    
    approvals.forEach(approval => {
      const orderId = approval.order_id || '';
      const status = approval.status || 'pending';
      const key = `${orderId}_${status}`;
      
      // Se já existe uma aprovação com essa chave, manter a mais recente
      const existing = map.get(key);
      if (!existing) {
        map.set(key, approval);
      } else {
        // Comparar created_at para manter a mais recente
        const existingDate = new Date(existing.created_at || 0);
        const currentDate = new Date(approval.created_at || 0);
        if (currentDate > existingDate) {
          map.set(key, approval);
        }
      }
    });
    
    return Array.from(map.values());
  }, []);

  // ✅ CORREÇÃO: Verificar se é uma busca por email
  const isEmailSearch = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();
    return term.includes('@');
  }, [debouncedSearchTerm]);

  // ✅ OTIMIZAÇÃO: Filtrar aprovações por email e remover duplicatas
  const filteredPendingApprovals = useMemo(() => {
    // ✅ CORREÇÃO: Se for busca por email, usar resultados da busca global
    if (isEmailSearch && searchResults.length > 0) {
      return removeDuplicates(searchResults.filter(a => a.status === 'pending'));
    }

    let approvals = pendingApprovalsPage || [];
    
    // ✅ CORREÇÃO: Remover duplicatas primeiro, mas garantir que todas as letras válidas apareçam
    approvals = removeDuplicates(approvals);
    
    // ✅ CORREÇÃO: Não filtrar letras - mostrar todas as pendentes
    // Apenas aplicar filtro de busca se houver termo de busca
    if (!debouncedSearchTerm.trim()) {
      // ✅ GARANTIR: Retornar todas as aprovações pendentes sem filtros adicionais
      return approvals;
    }
    
    const term = debouncedSearchTerm.toLowerCase();
    return approvals.filter(approval => 
      approval.orders?.customer_email?.toLowerCase().includes(term) ||
      approval.quizzes?.about_who?.toLowerCase().includes(term) ||
      approval.lyrics_preview?.toLowerCase().includes(term) ||
      (typeof approval.lyrics === 'object' && approval.lyrics?.title?.toLowerCase().includes(term))
    );
  }, [pendingApprovalsPage, debouncedSearchTerm, removeDuplicates, isEmailSearch, searchResults]);

  const filteredApprovedApprovals = useMemo(() => {
    // ✅ CORREÇÃO: Se for busca por email, usar resultados da busca global
    if (isEmailSearch && searchResults.length > 0) {
      return removeDuplicates(searchResults.filter(a => a.status === 'approved'));
    }

    let approvals = approvedApprovalsPage || [];
    
    // Remover duplicatas primeiro
    approvals = removeDuplicates(approvals);
    
    // Depois aplicar filtro de busca (usar debounced)
    if (!debouncedSearchTerm.trim()) return approvals;
    const term = debouncedSearchTerm.toLowerCase();
    return approvals.filter(approval => 
      approval.orders?.customer_email?.toLowerCase().includes(term) ||
      approval.quizzes?.about_who?.toLowerCase().includes(term)
    );
  }, [approvedApprovalsPage, debouncedSearchTerm, removeDuplicates, isEmailSearch, searchResults]);

  const filteredRejectedApprovals = useMemo(() => {
    // ✅ CORREÇÃO: Se for busca por email, usar resultados da busca global
    if (isEmailSearch && searchResults.length > 0) {
      return removeDuplicates(searchResults.filter(a => a.status === 'rejected'));
    }

    let approvals = rejectedApprovalsPage || [];
    
    // Remover duplicatas primeiro
    approvals = removeDuplicates(approvals);
    
    // Depois aplicar filtro de busca (usar debounced)
    if (!debouncedSearchTerm.trim()) return approvals;
    const term = debouncedSearchTerm.toLowerCase();
    return approvals.filter(approval => 
      approval.orders?.customer_email?.toLowerCase().includes(term) ||
      approval.quizzes?.about_who?.toLowerCase().includes(term)
    );
  }, [rejectedApprovalsPage, debouncedSearchTerm, removeDuplicates, isEmailSearch, searchResults]);

  // ✅ OTIMIZAÇÃO: Usar diretamente os dados filtrados (já paginados do backend)
  const visiblePending = filteredPendingApprovals;
  const visibleApproved = filteredApprovedApprovals;
  const visibleRejected = filteredRejectedApprovals;

  // ✅ CORREÇÃO: Removida lógica de paginação - carrega tudo de uma vez

  // Função para obter estado de loading/approving por approval ID
  // ✅ CORREÇÃO: Retornar todos os estados para todos os status
  const getApprovalState = useCallback((approvalId: string, status: string) => {
    return {
      isApproving: isApproving,
      isRejecting: isRejecting,
      isRegenerating: isRegenerating,
      isUnapproving: isUnapproving,
      isDeleting: status === 'pending' ? isDeletingPending : 
                  status === 'approved' ? isDeletingApproved : 
                  isDeletingRejected,
      isEditing: false
    };
  }, [isApproving, isRejecting, isRegenerating, isUnapproving, isDeletingPending, isDeletingApproved, isDeletingRejected]);

  // Função para atualizar todas as tabs
  const handleRefresh = useCallback(() => {
    refetchPending();
    refetchApproved();
    refetchRejected();
    toast.success('Dados atualizados!');
  }, [refetchPending, refetchApproved, refetchRejected]);

  // ✅ Função robusta para regenerar todas as letras pendentes
  const handleRegenerateAll = useCallback(async () => {
    try {
      // Confirmar ação
      const confirmed = window.confirm(
        `Tem certeza que deseja regenerar TODAS as letras pendentes?\n\n` +
        `⚡ O processo continuará mesmo se você fechar o navegador.\n` +
        `💾 O progresso é salvo automaticamente.\n` +
        `▶️ Se interrompido, você pode continuar de onde parou.\n\n` +
        `Total de letras pendentes: ${pendingTotalCount || 'calculando...'}`
      );

      if (!confirmed) {
        return;
      }

      setShowProgressDialog(true);
      await startRegenerate();
      
    } catch (error) {
      logger.error('Erro ao iniciar regeneração de todas as letras', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao regenerar letras: ${errorMessage}`);
    }
  }, [pendingTotalCount, startRegenerate]);

  // ✅ Função para retomar regeneração pausada
  const handleResumeRegenerate = useCallback(async () => {
    try {
      await resumeRegenerate();
    } catch (error) {
      logger.error('Erro ao retomar regeneração', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao retomar: ${errorMessage}`);
    }
  }, [resumeRegenerate]);

  return (
    <>
      
      <RegenerateAllProgressDialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
        progress={regenerateProgress}
        isRunning={isRegeneratingAll}
        onPause={stopRegenerate}
        onResume={handleResumeRegenerate}
        onClear={clearRegenerate}
        onClose={() => {
          // Não limpar progresso automaticamente - deixar usuário decidir
        }}
      />
      
      <div className="container mx-auto p-0 space-y-2 md:space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">📝 Gerenciar Letras</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Aprove, reprove ou regenere letras de músicas
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleRefresh} 
            variant="ghost"
            size="sm"
            className="h-9 bg-card hover:bg-card/80 border border-border"
            disabled={isRegeneratingAll}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button
            onClick={async () => {
              const jobType = ADMIN_AUTO_JOB_TYPES.AUTO_APPROVE_LYRICS;
              const next = !isAutoApproveEnabled(jobType);
              try {
                await setAutoApproveEnabled(jobType, next);
                toast.success(
                  next
                    ? "Aprovação automática ativada (roda no servidor a cada 8s)."
                    : "Aprovação automática desativada."
                );
              } catch {
                toast.error("Erro ao alterar aprovação automática.");
              }
            }}
            variant={
              isAutoApproveEnabled(ADMIN_AUTO_JOB_TYPES.AUTO_APPROVE_LYRICS)
                ? "default"
                : "outline"
            }
            size="sm"
            className={`h-9 ${
              isAutoApproveEnabled(ADMIN_AUTO_JOB_TYPES.AUTO_APPROVE_LYRICS)
                ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                : "border-orange-500/50 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            }`}
            disabled={isRegeneratingAll || isAutoApproveUpdating}
            title={
              isAutoApproveEnabled(ADMIN_AUTO_JOB_TYPES.AUTO_APPROVE_LYRICS)
                ? "Desativar para parar. Roda no servidor a cada 8 segundos (página pode estar fechada)."
                : "Ativar aprovação automática no servidor (a cada 8s). Desative pelo botão para parar."
            }
          >
            {isAutoApproveUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isAutoApproveEnabled(
                ADMIN_AUTO_JOB_TYPES.AUTO_APPROVE_LYRICS
              ) ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Desativar aprovação automática{" "}
                {visiblePending.length > 0 && "(a cada 8s no servidor)"}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Ativar aprovação automática
              </>
            )}
          </Button>
          {/* Botão para continuar progresso salvo */}
          {hasSavedProgress && regenerateProgress && !regenerateProgress.isComplete && !isRegeneratingAll && (
            <Button 
              onClick={() => setShowProgressDialog(true)} 
              variant="outline"
              size="sm"
              className="h-9 border-green-500/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
            >
              <Play className="h-4 w-4 mr-2" />
              Continuar ({regenerateProgress.items.length - regenerateProgress.currentIndex} restantes)
            </Button>
          )}
          
          <Button 
            onClick={handleRegenerateAll} 
            variant="outline"
            size="sm"
            className="h-9 border-orange-500/50 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
            disabled={isRegeneratingAll || (pendingTotalCount !== null && pendingTotalCount === 0)}
          >
            <RotateCcw className={`h-4 w-4 mr-2 ${isRegeneratingAll ? 'animate-spin' : ''}`} />
            {isRegeneratingAll ? 'Regenerando...' : 'Regenerar Todas Pendentes'}
          </Button>
        </div>
      </div>

      <EnhancedTabs 
        defaultValue="pending" 
        variant="modern" 
        size="lg" 
        className="space-y-4 md:space-y-6"
        onValueChange={(value) => {
          setActiveTab(value);
          // Resetar página ao trocar de tab
          setPendingPage(1);
          setApprovedPage(1);
          setRejectedPage(1);
        }}
      >
        <div className="flex flex-col md:flex-row gap-4 md:gap-4 items-stretch md:items-center">
          <EnhancedTabsList className="enhanced-tabs-modern enhanced-tabs-lyrics flex flex-row w-full gap-1 md:gap-2 flex-1">
            <EnhancedTabsTrigger 
              value="pending" 
              icon={<Clock className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />}
              badge={pendingTotalCount !== null && pendingTotalCount !== undefined && pendingTotalCount > 0 ? (
                <span className="enhanced-tabs-badge">{pendingTotalCount}</span>
              ) : undefined}
            >
              Pendentes
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="approved" 
              icon={<CheckCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />}
              badge={approvedTotalCount && approvedTotalCount > 0 ? (
                <span className="enhanced-tabs-badge">{approvedTotalCount}</span>
              ) : undefined}
            >
              Aprovadas
            </EnhancedTabsTrigger>
            <EnhancedTabsTrigger 
              value="rejected" 
              icon={<XCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />}
              badge={rejectedTotalCount && rejectedTotalCount > 0 ? (
                <span className="enhanced-tabs-badge">{rejectedTotalCount}</span>
              ) : undefined}
            >
              Rejeitadas
            </EnhancedTabsTrigger>
          </EnhancedTabsList>

          {/* Busca por email */}
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 w-full md:w-64"
              style={{ paddingLeft: '3.5rem' }}
            />
          </div>
        </div>

        <EnhancedTabsContent value="pending" className="space-y-4">
          {loadingPending ? (
            <AdminPageLoading text="Carregando letras pendentes..." />
          ) : errorPending ? (
            <div className="text-center py-12">
              <p className="text-destructive">Erro ao carregar letras pendentes</p>
              <p className="text-sm text-muted-foreground mt-2">{errorPending instanceof Error ? errorPending.message : 'Erro desconhecido'}</p>
            </div>
          ) : visiblePending.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-xl font-semibold">Letras Pendentes</h2>
                <div className="flex items-center gap-3">
                  {pendingTotalCount !== null && pendingTotalCount !== undefined ? (
                    <span className="text-base text-primary font-medium">
                      {pendingTotalCount} {pendingTotalCount === 1 ? 'item' : 'itens'}
                    </span>
                  ) : (
                    <span className="text-base text-muted-foreground">Calculando...</span>
                  )}
                  {!isEmailSearch && (pendingTotalCount ?? 0) > ITEMS_PER_PAGE && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                        disabled={pendingPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Página {pendingPage} de {Math.max(1, Math.ceil((pendingTotalCount ?? 0) / ITEMS_PER_PAGE))}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPendingPage(p => p + 1)}
                        disabled={pendingPage >= Math.max(1, Math.ceil((pendingTotalCount ?? 0) / ITEMS_PER_PAGE))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 auto-rows-fr [&>*]:min-h-[280px]">
                {visiblePending.map((approval) => {
                  const state = getApprovalState(approval.id, 'pending');
                  return (
                    <LyricsCard
                      key={approval.id}
                      approval={approval}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onRegenerate={handleRegenerate}
                      onDelete={(id) => handleDelete(id, 'pending')}
                      onEdit={handleEdit}
                      isApproving={state.isApproving}
                      isRejecting={state.isRejecting}
                      isRegenerating={state.isRegenerating}
                      isDeleting={state.isDeleting}
                      isEditing={state.isEditing}
                      compact={false}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {debouncedSearchTerm ? 'Nenhuma letra encontrada com esse filtro' : 'Nenhuma letra pendente de aprovação'}
              </p>
            </div>
          )}
        </EnhancedTabsContent>

        <EnhancedTabsContent value="approved" className="space-y-4">
          {(loadingApproved || (isEmailSearch && isSearching)) ? (
            <AdminPageLoading text={isEmailSearch ? "Buscando letras por email..." : "Carregando letras aprovadas..."} />
          ) : errorApproved ? (
            <div className="text-center py-12">
              <p className="text-destructive">Erro ao carregar letras aprovadas</p>
              <p className="text-sm text-muted-foreground mt-2">{errorApproved instanceof Error ? errorApproved.message : 'Erro desconhecido'}</p>
            </div>
          ) : visibleApproved.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-xl font-semibold">Letras Aprovadas</h2>
                <div className="flex items-center gap-3">
                  <span className="text-base text-primary font-medium">
                    {approvedTotalCount} {approvedTotalCount === 1 ? 'item' : 'itens'}
                  </span>
                  {!isEmailSearch && (approvedTotalCount ?? 0) > ITEMS_PER_PAGE && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setApprovedPage(p => Math.max(1, p - 1))}
                        disabled={approvedPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Página {approvedPage} de {Math.max(1, Math.ceil((approvedTotalCount ?? 0) / ITEMS_PER_PAGE))}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setApprovedPage(p => p + 1)}
                        disabled={approvedPage >= Math.max(1, Math.ceil((approvedTotalCount ?? 0) / ITEMS_PER_PAGE))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 auto-rows-fr [&>*]:min-h-[280px]">
                {visibleApproved.map((approval) => {
                  const state = getApprovalState(approval.id, 'approved');
                  return (
                    <LyricsCard
                      key={approval.id}
                      approval={approval}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onUnapprove={handleUnapprove}
                      onRegenerate={handleRegenerate}
                      onDelete={(id) => handleDelete(id, 'approved')}
                      onEdit={handleEdit}
                      isApproving={state.isApproving}
                      isRejecting={state.isRejecting}
                      isUnapproving={state.isUnapproving}
                      isRegenerating={state.isRegenerating}
                      isDeleting={state.isDeleting}
                      isEditing={state.isEditing}
                      compact={false}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {debouncedSearchTerm ? 'Nenhuma letra encontrada com esse filtro' : 'Nenhuma letra aprovada ainda'}
              </p>
            </div>
          )}
        </EnhancedTabsContent>

        <EnhancedTabsContent value="rejected" className="space-y-4">
          {(loadingRejected || (isEmailSearch && isSearching)) ? (
            <AdminPageLoading text={isEmailSearch ? "Buscando letras por email..." : "Carregando letras rejeitadas..."} />
          ) : errorRejected ? (
            <div className="text-center py-12">
              <p className="text-destructive">Erro ao carregar letras rejeitadas</p>
              <p className="text-sm text-muted-foreground mt-2">{errorRejected instanceof Error ? errorRejected.message : 'Erro desconhecido'}</p>
            </div>
          ) : visibleRejected.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-xl font-semibold">Letras Rejeitadas</h2>
                <div className="flex items-center gap-3">
                  <span className="text-base text-primary font-medium">
                    {rejectedTotalCount} {rejectedTotalCount === 1 ? 'item' : 'itens'}
                  </span>
                  {!isEmailSearch && (rejectedTotalCount ?? 0) > ITEMS_PER_PAGE && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRejectedPage(p => Math.max(1, p - 1))}
                        disabled={rejectedPage <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Página {rejectedPage} de {Math.max(1, Math.ceil((rejectedTotalCount ?? 0) / ITEMS_PER_PAGE))}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRejectedPage(p => p + 1)}
                        disabled={rejectedPage >= Math.max(1, Math.ceil((rejectedTotalCount ?? 0) / ITEMS_PER_PAGE))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 auto-rows-fr [&>*]:min-h-[280px]">
                {visibleRejected.map((approval) => {
                  const state = getApprovalState(approval.id, 'rejected');
                  return (
                    <LyricsCard
                      key={approval.id}
                      approval={approval}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onRegenerate={handleRegenerate}
                      onDelete={(id) => handleDelete(id, 'rejected')}
                      onEdit={handleEdit}
                      isApproving={state.isApproving}
                      isRejecting={state.isRejecting}
                      isRegenerating={state.isRegenerating}
                      isDeleting={state.isDeleting}
                      isEditing={state.isEditing}
                      compact={false}
                    />
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                {debouncedSearchTerm ? 'Nenhuma letra encontrada com esse filtro' : 'Nenhuma letra rejeitada'}
              </p>
            </div>
          )}
        </EnhancedTabsContent>
      </EnhancedTabs>
      </div>
    </>
  );
}
