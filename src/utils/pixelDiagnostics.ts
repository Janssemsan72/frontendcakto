/**
 * ✅ FASE 5: Sistema de diagnóstico e monitoramento para Facebook Pixel e Utmify
 * 
 * Este módulo fornece ferramentas para diagnosticar problemas com o carregamento
 * dos scripts de tracking e monitorar seu estado em tempo real.
 */

export interface PixelDiagnostics {
  fbqAvailable: boolean;
  pixelId: string | null;
  pixelScriptLoaded: boolean;
  utmsScriptLoaded: boolean;
  scriptsLoadTime: number | null;
  eventQueueSize: number;
  lastError: string | null;
  timestamp: number;
}

export interface ScriptLoadStatus {
  pixelScript: {
    loaded: boolean;
    error: boolean;
    loadTime?: number;
  };
  utmsScript: {
    loaded: boolean;
    error: boolean;
    loadTime?: number;
  };
  fbq: {
    available: boolean;
    initialized: boolean;
  };
}

/**
 * Obtém o estado atual do diagnóstico do pixel
 */
export function getPixelDiagnostics(): PixelDiagnostics {
  const diagnostics: PixelDiagnostics = {
    fbqAvailable: false,
    pixelId: null,
    pixelScriptLoaded: false,
    utmsScriptLoaded: false,
    scriptsLoadTime: null,
    eventQueueSize: 0,
    lastError: null,
    timestamp: Date.now()
  };

  try {
    // Verificar fbq
    diagnostics.fbqAvailable = typeof window !== 'undefined' && 
                                typeof (window as any).fbq === 'function';

    // Verificar pixelId
    if (typeof window !== 'undefined' && (window as any).pixelId) {
      diagnostics.pixelId = (window as any).pixelId;
    }

    // Verificar estado do utmify-loader (se disponível em debug)
    if (typeof window !== 'undefined' && (window as any).__utmifyLoaderState) {
      const state = (window as any).__utmifyLoaderState;
      diagnostics.pixelScriptLoaded = state.pixelScriptLoaded || false;
      diagnostics.utmsScriptLoaded = state.utmsScriptLoaded || false;
      
      if (state.pixelScriptError) {
        diagnostics.lastError = 'Erro ao carregar pixel.js';
      } else if (state.utmsScriptError) {
        diagnostics.lastError = 'Erro ao carregar latest.js';
      }
    }

    // Verificar tamanho da queue de eventos (se disponível)
    try {
      // Importar dinamicamente para evitar dependência circular
      const pixelTracking = require('./pixelTracking');
      if (pixelTracking && typeof pixelTracking.getEventQueueSize === 'function') {
        diagnostics.eventQueueSize = pixelTracking.getEventQueueSize();
      }
    } catch (e) {
      // Ignorar se não conseguir importar
    }
  } catch (error) {
    diagnostics.lastError = error instanceof Error ? error.message : 'Erro desconhecido';
  }

  return diagnostics;
}

/**
 * Obtém status detalhado do carregamento dos scripts
 */
export function getScriptLoadStatus(): ScriptLoadStatus {
  const status: ScriptLoadStatus = {
    pixelScript: {
      loaded: false,
      error: false
    },
    utmsScript: {
      loaded: false,
      error: false
    },
    fbq: {
      available: false,
      initialized: false
    }
  };

  try {
    // Verificar estado do utmify-loader
    if (typeof window !== 'undefined' && (window as any).__utmifyLoaderState) {
      const state = (window as any).__utmifyLoaderState;
      status.pixelScript.loaded = state.pixelScriptLoaded || false;
      status.pixelScript.error = state.pixelScriptError || false;
      status.utmsScript.loaded = state.utmsScriptLoaded || false;
      status.utmsScript.error = state.utmsScriptError || false;
    }

    // Verificar fbq
    status.fbq.available = typeof window !== 'undefined' && 
                           typeof (window as any).fbq === 'function';
    
    if (status.fbq.available) {
      try {
        const fbq = (window as any).fbq;
        // Verificar se fbq está inicializado (tem queue)
        status.fbq.initialized = Array.isArray(fbq.q) || Array.isArray(fbq.queue);
      } catch (e) {
        // Ignorar erro
      }
    }
  } catch (error) {
    console.warn('[PixelDiagnostics] Erro ao obter status:', error);
  }

  return status;
}

/**
 * Verifica se os scripts estão carregados corretamente
 */
export function areScriptsLoaded(): boolean {
  const status = getScriptLoadStatus();
  return status.pixelScript.loaded && 
         status.utmsScript.loaded && 
         status.fbq.available;
}

/**
 * Loga diagnóstico completo no console (apenas em dev ou se debug ativado)
 */
export function logDiagnostics(): void {
  const isDev = import.meta.env.DEV;
  const debugEnabled = typeof window !== 'undefined' && 
                       localStorage.getItem('utmify_debug') === 'true';

  if (!isDev && !debugEnabled) {
    return;
  }

  const diagnostics = getPixelDiagnostics();
  const status = getScriptLoadStatus();

  console.group('🔍 [PixelDiagnostics] Diagnóstico do Facebook Pixel e Utmify');
  console.log('📊 Estado Geral:', {
    'fbq Disponível': diagnostics.fbqAvailable ? '✅' : '❌',
    'Pixel ID': diagnostics.pixelId || 'Não definido',
    'Scripts Carregados': areScriptsLoaded() ? '✅' : '❌',
    'Eventos na Queue': diagnostics.eventQueueSize
  });

  console.log('📜 Status dos Scripts:', {
    'pixel.js': status.pixelScript.loaded ? '✅ Carregado' : 
                status.pixelScript.error ? '❌ Erro' : '⏳ Aguardando',
    'latest.js': status.utmsScript.loaded ? '✅ Carregado' : 
                 status.utmsScript.error ? '❌ Erro' : '⏳ Aguardando',
    'fbq': status.fbq.available ? 
           (status.fbq.initialized ? '✅ Disponível e Inicializado' : '⚠️ Disponível mas não inicializado') :
           '❌ Não disponível'
  });

  if (diagnostics.lastError) {
    console.warn('⚠️ Último Erro:', diagnostics.lastError);
  }

  console.log('🕐 Timestamp:', new Date(diagnostics.timestamp).toISOString());
  console.groupEnd();
}

/**
 * Monitora o carregamento dos scripts e executa callback quando estiverem prontos
 */
export function waitForScripts(
  callback: () => void,
  timeout: number = 10000
): void {
  const startTime = Date.now();
  
  const checkInterval = setInterval(() => {
    if (areScriptsLoaded()) {
      clearInterval(checkInterval);
      callback();
    } else if (Date.now() - startTime >= timeout) {
      clearInterval(checkInterval);
      console.warn('[PixelDiagnostics] Timeout aguardando scripts');
    }
  }, 500);

  // Verificar imediatamente também
  if (areScriptsLoaded()) {
    clearInterval(checkInterval);
    callback();
  }
}

/**
 * Escuta eventos customizados do utmify-loader
 */
export function setupDiagnosticListeners(): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // No-op se não estiver no browser
  }

  const isDev = import.meta.env.DEV;
  const debugEnabled = localStorage.getItem('utmify_debug') === 'true';

  const logEvent = (eventName: string, detail?: any) => {
    if (isDev || debugEnabled) {
      console.log(`[PixelDiagnostics] Evento: ${eventName}`, detail || '');
    }
  };

  const handleFbqReady = (event: Event) => {
    logEvent('fbq-ready', (event as CustomEvent).detail);
    logDiagnostics();
  };

  const handleScriptsLoaded = (event: Event) => {
    logEvent('utmify-scripts-loaded', (event as CustomEvent).detail);
    logDiagnostics();
  };

  const handleScriptsFailed = (event: Event) => {
    logEvent('utmify-scripts-failed', (event as CustomEvent).detail);
    console.error('[PixelDiagnostics] ❌ Scripts falharam ao carregar:', (event as CustomEvent).detail);
    logDiagnostics();
  };

  window.addEventListener('fbq-ready', handleFbqReady);
  window.addEventListener('utmify-scripts-loaded', handleScriptsLoaded);
  window.addEventListener('utmify-scripts-failed', handleScriptsFailed);

  // Retornar função de cleanup
  return () => {
    window.removeEventListener('fbq-ready', handleFbqReady);
    window.removeEventListener('utmify-scripts-loaded', handleScriptsLoaded);
    window.removeEventListener('utmify-scripts-failed', handleScriptsFailed);
  };
}

/**
 * Inicializa o sistema de diagnóstico
 */
export function initDiagnostics(): () => void {
  const cleanup = setupDiagnosticListeners();
  
  // Logar diagnóstico inicial após um pequeno delay
  setTimeout(() => {
    logDiagnostics();
  }, 1000);

  return cleanup;
}
