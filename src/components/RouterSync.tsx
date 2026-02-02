import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const isDev = import.meta.env.DEV;

/**
 * Componente que detecta divergências entre window.location e React Router
 * e força atualização quando necessário
 * Resolve problema onde URL muda mas componente não renderiza
 */
export default function RouterSync({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const lastReactPathRef = useRef<string>('');
  const lastWindowPathRef = useRef<string>('');
  const locationRef = useRef<{ pathname: string; search: string }>({ pathname: '', search: '' });
  const isSyncingRef = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountCountRef = useRef(0);
  const renderCountRef = useRef(0);
  
  // ✅ CORREÇÃO MOBILE: Proteção contra renderização dupla
  useEffect(() => {
    mountCountRef.current += 1;
    renderCountRef.current += 1;
    
    if (isDev) {
      console.log('[RouterSync] Componente montado/renderizado', {
        mountCount: mountCountRef.current,
        renderCount: renderCountRef.current,
        timestamp: Date.now()
      });
    }
    
    // Se o componente foi montado mais de uma vez, pode indicar problema
    if (mountCountRef.current > 1 && isDev) {
      console.warn('[RouterSync] ⚠️ Componente foi montado múltiplas vezes!', {
        mountCount: mountCountRef.current
      });
    }
    
    return () => {
      if (isDev) {
        console.log('[RouterSync] Componente desmontado', {
          mountCount: mountCountRef.current
        });
      }
    };
  }, []);

  useEffect(() => {
    locationRef.current = { pathname: location.pathname, search: location.search };
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as any;

    if (!win.__ML_HISTORY_PATCHED__) {
      win.__ML_HISTORY_PATCHED__ = true;

      try {
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        window.history.pushState = function (...args: any[]) {
          const result = originalPushState.apply(this, args as any);
          window.dispatchEvent(new Event('ml-history'));
          return result;
        };

        window.history.replaceState = function (...args: any[]) {
          const result = originalReplaceState.apply(this, args as any);
          window.dispatchEvent(new Event('ml-history'));
          return result;
        };
      } catch {
      }
    }

    const syncFromWindowLocation = () => {
      // ✅ CORREÇÃO CRÍTICA: RouterSync deve ser PASSIVO
      // Não deve interferir quando React Router está navegando normalmente
      // Só deve sincronizar em casos específicos:
      // 1. Quando usuário digita URL diretamente no navegador
      // 2. Quando usuário usa botões voltar/avançar do navegador (popstate)
      // 3. Quando há uma divergência REAL que não foi causada pelo React Router
      
      // Se já está sincronizando, evitar loops
      if (isSyncingRef.current) {
        return;
      }

      const reactPath = locationRef.current.pathname + locationRef.current.search;
      const windowPath = window.location.pathname + window.location.search;

      // Se já estão sincronizados, não fazer nada
      if (windowPath === reactPath) {
        return;
      }

      // Se windowPath não mudou desde a última verificação, não fazer nada
      if (windowPath === lastWindowPathRef.current) {
        return;
      }

      // ✅ CORREÇÃO CRÍTICA: NÃO sincronizar se windowPath é '/' e reactPath não é '/'
      // Isso pode ser um redirect intencional que não devemos interferir
      if (windowPath === '/') {
        lastWindowPathRef.current = windowPath;
        return;
      }

      // ✅ CORREÇÃO CRÍTICA: Aguardar um pouco antes de sincronizar
      // Isso dá tempo para o React Router processar a navegação normalmente
      // Se o React Router já está navegando, não precisamos interferir
      isSyncingRef.current = true;
      lastWindowPathRef.current = windowPath;

      // Usar um pequeno delay para dar tempo ao React Router
      setTimeout(() => {
        const currentReactPath = locationRef.current.pathname + locationRef.current.search;
        const currentWindowPath = window.location.pathname + window.location.search;

        // Se ainda há divergência após o delay, sincronizar
        // Mas apenas se windowPath não mudou (não foi causado por outra navegação)
        if (currentWindowPath !== currentReactPath && currentWindowPath === windowPath && currentWindowPath !== '/') {
          navigate(currentWindowPath, { replace: true });
        }

        isSyncingRef.current = false;
      }, 50); // Pequeno delay de 50ms para dar tempo ao React Router
    };

    window.addEventListener('ml-history', syncFromWindowLocation);
    window.addEventListener('popstate', syncFromWindowLocation);
    window.addEventListener('hashchange', syncFromWindowLocation);

    return () => {
      window.removeEventListener('ml-history', syncFromWindowLocation);
      window.removeEventListener('popstate', syncFromWindowLocation);
      window.removeEventListener('hashchange', syncFromWindowLocation);
    };
  }, [navigate]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const reactPath = location.pathname + location.search;
    const windowPath = window.location.pathname + window.location.search;
    
    // ✅ CORREÇÃO MOBILE: Log temporário para debug (apenas em dev)
    if (isDev) {
      console.log('[RouterSync] Verificando sincronização', {
        reactPath,
        windowPath,
        lastReactPath: lastReactPathRef.current,
        lastWindowPath: lastWindowPathRef.current,
        isSyncing: isSyncingRef.current
      });
    }
    
    // Se React Router atualizou, atualizar referências
    if (reactPath !== lastReactPathRef.current) {
      lastReactPathRef.current = reactPath;
      lastWindowPathRef.current = windowPath;
      isSyncingRef.current = false;
      
      // Limpar timeout se existir
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    }
    
    // ✅ CORREÇÃO CRÍTICA: REMOVER sincronização agressiva no useEffect
    // O RouterSync deve ser PASSIVO e só sincronizar via eventos (popstate, hashchange)
    // Não deve tentar sincronizar a cada mudança de location do React Router
    // Isso estava causando conflitos onde o RouterSync tentava "corrigir" navegações normais do React Router
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, [location.pathname, location.search, navigate]);
  
  return <>{children}</>;
}
