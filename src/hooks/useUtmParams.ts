import { useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { getOrCreateSck, getOrCreateFbc } from '@/utils/gtmTracking';

/**
 * Hook para capturar, salvar e preservar parâmetros UTM através do funil
 * Mantém UTMs em localStorage e injeta em todas as navegações
 */
export function useUtmParams() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Verificar se está em rota administrativa - não capturar nem preservar UTMs
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                       location.pathname.startsWith('/app/admin');

  // Parâmetros de tracking completos (UTMs + Google Ads + Facebook + outros)
  // ✅ CORREÇÃO: Definido como constante fora de useMemo para evitar recriação
  const TRACKING_PARAMS = [
    // UTMs padrão
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    // Google Ads
    'gclid', 'gclsrc', 'gad_source', 'gad_campaignid', 'gbraid',
    // Google Analytics
    '_ga', '_gid',
    // Facebook
    'fbclid', 'fb_action_ids', 'fb_action_types',
    // Microsoft/Bing
    'msclkid',
    // Google Ads HSA (Historical Search Ads)
    'hsa_acc', 'hsa_cam', 'hsa_grp', 'hsa_ad', 'hsa_src', 'hsa_tgt', 'hsa_kw', 'hsa_mt', 'hsa_net', 'hsa_ver',
    // Outros parâmetros de tracking
    'ref', 'source', 'sck', 'xcod', 'network',
    // Google Analytics Campaign
    '_gac',
  ];

  // Capturar TODOS os parâmetros de tracking da URL atual
  // ✅ CORREÇÃO: Hook sempre é chamado, mas retorna vazio para rotas admin
  const currentTrackingParams = useMemo(() => {
    if (isAdminRoute) return {};
    
    const params: Record<string, string> = {};
    TRACKING_PARAMS.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        params[param] = value;
      }
    });
    
    // Também capturar parâmetros _gac_* (Google Analytics Campaign com formato _gac_GA_MEASUREMENT_ID__CAMPAIGN_ID__TIMESTAMP)
    searchParams.forEach((value, key) => {
      if (key.startsWith('_gac_') && !params[key]) {
        params[key] = value;
      }
    });
    
    return params;
  }, [searchParams, isAdminRoute]);

  // UTMs padrão (para compatibilidade)
  const currentUtms = useMemo(() => {
    if (isAdminRoute) return {};
    
    const utmsResult: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      if (currentTrackingParams[param]) {
        utmsResult[param] = currentTrackingParams[param];
      }
    });
    return utmsResult;
  }, [currentTrackingParams, isAdminRoute]);

  // Salvar TODOS os parâmetros de tracking no localStorage quando detectados
  // ✅ CORREÇÃO: Hook sempre é chamado, mas não faz nada para rotas admin
  useEffect(() => {
    if (isAdminRoute) return;
    if (Object.keys(currentTrackingParams).length > 0) {
      localStorage.setItem('musiclovely_tracking_params', JSON.stringify(currentTrackingParams));
      if (import.meta.env.DEV) {
        console.log('✅ Parâmetros de tracking salvos:', currentTrackingParams);
      }
    }
  }, [currentTrackingParams, isAdminRoute]);

  // Carregar parâmetros de tracking salvos do localStorage
  const savedTrackingParams = useMemo(() => {
    if (isAdminRoute) return {};
    
    try {
      const saved = localStorage.getItem('musiclovely_tracking_params');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, [isAdminRoute]);

  // Parâmetros de tracking finais: mesclar URL atual + localStorage (URL atual tem prioridade)
  const allTrackingParams = useMemo(() => {
    if (isAdminRoute) return {};
    
    // Sempre mesclar: parâmetros da URL atual + parâmetros salvos
    const merged = { ...savedTrackingParams, ...currentTrackingParams };
    return merged;
  }, [currentTrackingParams, savedTrackingParams, isAdminRoute]);

  // UTMs padrão (para compatibilidade com código existente)
  const utms = useMemo(() => {
    if (isAdminRoute) return {};
    
    const utmsResult: Record<string, string> = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      if (allTrackingParams[param]) {
        utmsResult[param] = allTrackingParams[param];
      }
    });
    return utmsResult;
  }, [allTrackingParams, isAdminRoute]);

  // Salvar parâmetros mesclados no localStorage sempre que mudarem
  // Garante que sck (external_id) exista desde a primeira visita e que _fbc seja gerado se fbclid estiver presente
  useEffect(() => {
    if (isAdminRoute) return;

    const params = { ...allTrackingParams };
    if (!params.sck) params.sck = getOrCreateSck();
    getOrCreateFbc();

    if (Object.keys(params).length > 0) {
      localStorage.setItem('musiclovely_tracking_params', JSON.stringify(params));
    }
  }, [allTrackingParams, isAdminRoute]);

  /**
   * Função helper para navegar preservando TODOS os parâmetros de tracking
   * ✅ CORREÇÃO: Usar useCallback para estabilidade e considerar isAdminRoute
   */
  const navigateWithUtms = useCallback((path: string, options?: { replace?: boolean; state?: unknown }) => {
    // Em rotas admin, navegar sem UTMs
    if (isAdminRoute) {
      navigate(path, options);
      return;
    }
    
    const url = new URL(path, window.location.origin);
    
    // Preservar parâmetros existentes na URL
    const existingParams = new URLSearchParams(url.search);
    
    // Adicionar/substituir TODOS os parâmetros de tracking na URL
    Object.entries(allTrackingParams).forEach(([key, value]) => {
      if (value) {
        existingParams.set(key, value as string);
      }
    });

    // ✅ CORREÇÃO: Ordem correta: pathname → ?search params (UTMs) → #hash
    // Preservar hash se existir no path original
    const hash = url.hash || '';
    const finalPath = url.pathname + (existingParams.toString() ? `?${existingParams.toString()}` : '') + hash;
    if (import.meta.env.DEV) {
      console.log('🔄 Navegando com parâmetros de tracking:', { path, finalPath, trackingParams: allTrackingParams });
    }
    navigate(finalPath, options);
  }, [navigate, allTrackingParams, isAdminRoute]);

  /**
   * Função para obter query string com TODOS os parâmetros de tracking
   * ✅ CORREÇÃO: Usar useCallback para estabilidade
   */
  const getUtmQueryString = useCallback((includeExisting = true): string => {
    // Em rotas admin ou se não há parâmetros, retornar vazio
    if (isAdminRoute || Object.keys(allTrackingParams).length === 0) {
      return '';
    }
    
    const params = new URLSearchParams();
    
    if (includeExisting) {
      // Incluir parâmetros existentes na URL atual
      searchParams.forEach((value, key) => {
        params.set(key, value);
      });
    }
    
    // Adicionar TODOS os parâmetros de tracking salvos (se não já estiverem presentes)
    Object.entries(allTrackingParams).forEach(([key, value]) => {
      if (value && !params.has(key)) {
        params.set(key, value as string);
      }
    });

    const queryString = params.toString();
    
    if (!queryString) {
      return '';
    }
    
    // Se includeExisting é false e já temos params na URL atual, usar & ao invés de ?
    if (!includeExisting && searchParams.toString()) {
      // Retornar apenas os parâmetros novos com &
      const newParams = new URLSearchParams();
      Object.entries(allTrackingParams).forEach(([key, value]) => {
        if (value && !searchParams.has(key)) {
          newParams.set(key, value as string);
        }
      });
      const newParamsString = newParams.toString();
      return newParamsString ? `&${newParamsString}` : '';
    }
    
    return `?${queryString}`;
  }, [searchParams, allTrackingParams, isAdminRoute]);

  /**
   * Limpar parâmetros de tracking salvos (útil para testes ou reset)
   * ✅ CORREÇÃO: Usar useCallback para estabilidade
   */
  const clearUtms = useCallback(() => {
    localStorage.removeItem('musiclovely_tracking_params');
    localStorage.removeItem('musiclovely_utms'); // Manter compatibilidade
  }, []);

  return {
    utms, // UTMs padrão (para compatibilidade)
    allTrackingParams, // TODOS os parâmetros de tracking
    currentUtms, // UTMs da URL atual (para compatibilidade)
    currentTrackingParams, // Todos os parâmetros da URL atual
    savedUtms: utms, // Para compatibilidade
    savedTrackingParams, // Todos os parâmetros salvos
    hasUtms: Object.keys(utms).length > 0,
    hasTrackingParams: Object.keys(allTrackingParams).length > 0,
    navigateWithUtms,
    getUtmQueryString,
    clearUtms,
  };
}
