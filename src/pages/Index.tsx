import React, { memo, Suspense, useEffect, useRef, useState } from "react";
import { scrollManager } from "@/utils/scrollManager";

// ✅ OTIMIZAÇÃO PERFORMANCE: Lazy load do Header para reduzir bundle inicial
const Header = React.lazy(() => import("@/components/Header"));
import HeroSection from "@/components/HeroSection";

import { useUtmParams } from "@/hooks/useUtmParams";
import { useUtmifyTracking } from "@/hooks/useUtmifyTracking";
import { Mail } from "@/utils/iconImports";

// ✅ CORREÇÃO PRODUÇÃO: Renderizar componentes críticos imediatamente (sem lazy load)
// Componentes acima do fold devem aparecer imediatamente para melhor UX
import VinylPlayer from "@/components/VinylPlayer";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";

// ✅ OTIMIZAÇÃO: Lazy load apenas de componentes abaixo do fold
const Testimonials = React.lazy(() => {
  return import("@/components/Testimonials").catch((err) => {
    console.error('Erro ao carregar Testimonials:', err);
    throw err;
  });
});
const FAQ = React.lazy(() => {
  return import("@/components/FAQ").catch((err) => {
    console.error('Erro ao carregar FAQ:', err);
    throw err;
  });
});
const Footer = React.lazy(() => {
  return import("@/components/Footer").catch((err) => {
    console.error('Erro ao carregar Footer:', err);
    throw err;
  });
});

function LazySection({
  children,
  minHeight,
  rootMargin,
}: {
  children: React.ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) {
      return;
    }

    const scrollRoot = document.getElementById('main-scroll-container');
    
    // ✅ CORREÇÃO: Forçar visível imediatamente se scrollRoot não existir
    if (!scrollRoot) {
      setVisible(true);
      return;
    }
    
    // ✅ CORREÇÃO CRÍTICA: Verificar se elemento já está visível antes de criar observer
    // Isso resolve o problema de elementos não sendo detectados inicialmente
    const checkInitialVisibility = () => {
      const rect = el.getBoundingClientRect();
      const rootRect = scrollRoot.getBoundingClientRect();
      const isVisible = rect.top < rootRect.bottom + (rootMargin ? parseInt(rootMargin.split(' ')[0]) : 0);
      if (isVisible) {
        setVisible(true);
        return true;
      }
      return false;
    };
    
    // ✅ CORREÇÃO CRÍTICA: Verificar visibilidade inicial após layout estar pronto
    let observer: IntersectionObserver | null = null;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;
    
    const setupObserver = () => {
      if (visible) return;
      
      if (checkInitialVisibility()) {
        return; // Já está visível, não precisa de observer
      }
      
      // Só criar observer se elemento não estiver visível
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setVisible(true);
          }
        },
        { root: scrollRoot, rootMargin: rootMargin ?? '0px 0px', threshold: [0, 0.01, 0.1] }
      );

      observer.observe(el);
      
      // ✅ CORREÇÃO: Safety timer reduzido para 500ms se observer não disparar
      safetyTimer = setTimeout(() => {
        if (!visible) {
          setVisible(true);
        }
      }, 500);
    };
    
    // Verificar visibilidade inicial após layout estar pronto
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setupObserver();
      });
    });
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (safetyTimer) {
        clearTimeout(safetyTimer);
      }
    };
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={minHeight ? { minHeight } : undefined}>
      {visible ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}

const Index = memo(() => {
  // ✅ CORREÇÃO PRODUÇÃO: Prevenir renderização duplicada
  const hasRenderedRef = useRef(false);
  // ✅ CORREÇÃO FAQ: Estado para forçar renderização do FAQ quando hash muda
  const [currentHash, setCurrentHash] = useState<string>('');
  
  useEffect(() => {
    if (hasRenderedRef.current) {
      console.error('❌ [Index] Componente Index está sendo renderizado duas vezes!');
      return;
    }
    hasRenderedRef.current = true;
  }, []);
  
  // ✅ CORREÇÃO FAQ: Atualizar estado quando hash muda para forçar renderização do FAQ
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateHash = () => {
      const newHash = window.location.hash;
      if (newHash !== currentHash) {
        setCurrentHash(newHash);
      }
    };
    // Atualizar imediatamente
    updateHash();
    window.addEventListener('hashchange', updateHash);
    // Escutar mudanças no history também (para replaceState)
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      requestAnimationFrame(() => {
        requestAnimationFrame(updateHash);
      });
    };
    return () => {
      window.removeEventListener('hashchange', updateHash);
      window.history.replaceState = originalReplaceState;
    };
  }, [currentHash]);
  
  // ✅ SIMPLIFICADO: UTMs são capturados automaticamente pelo hook useUtmParams
  const { hasUtms } = useUtmParams();
  const { trackEvent } = useUtmifyTracking();

  // ✅ OTIMIZAÇÃO FASE 1.1: Animações como enhancement (conteúdo precisa aparecer sempre)
  useEffect(() => {
    const win = typeof window === "undefined" ? undefined : window;
    if (!win) return;

    const isMobile = win.innerWidth < 768; // Ponto de quebra para mobile

    const elements = document.querySelectorAll(
      '.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale'
    );

    if (elements.length === 0) return;

    if (isMobile) {
      elements.forEach((el) => {
        el.classList.remove(
          'scroll-animate',
          'scroll-animate-left',
          'scroll-animate-right',
          'scroll-animate-scale'
        );
      });
      return;
    }

    const scrollRoot = document.getElementById('main-scroll-container') || null;
    let revealed = 0;

    const reveal = (el: Element) => {
      if (el.classList.contains('animate-fade-in-up')) return;
      el.classList.add('animate-fade-in-up');
      revealed++;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: scrollRoot,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    const safetyTimer = win.setTimeout(() => {
      if (revealed === 0) {
        elements.forEach((el) => reveal(el));
      }
    }, 2500);

    return () => {
      win.clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, []);

  // ✅ OTIMIZAÇÃO PERFORMANCE: Deferir tracking de homepage_viewed para não bloquear renderização inicial
  useEffect(() => {
    const win = typeof window === "undefined" ? undefined : window;
    if (!win) return;

    let cancelled = false;
    const schedule = () => {
      if (cancelled) return;
      try {
        trackEvent('homepage_viewed', {
          pathname: win.location.pathname,
          hasUtms,
        }).catch(() => {});
      } catch (error) {
        void error;
      }
    };

    if ('requestIdleCallback' in win) {
      const w = win as any;
      const id = w.requestIdleCallback(schedule, { timeout: 6000 });
      return () => {
        cancelled = true;
        if (typeof w.cancelIdleCallback === 'function') {
          w.cancelIdleCallback(id);
        }
      };
    }

    const timer = globalThis.setTimeout(schedule, 5000);
    return () => {
      cancelled = true;
      globalThis.clearTimeout(timer);
    };
  }, [trackEvent, hasUtms]);

  // ✅ OTIMIZAÇÃO FASE 1.3: Preload condicional de Quiz/Checkout quando usuário está próximo de seções com botões
  useEffect(() => {
    const win = typeof window === "undefined" ? undefined : window;
    if (!win) return;

    let cancelled = false;
    let prefetchedQuiz = false;
    let prefetchedCheckout = false;

    const checkScrollAndPreload = () => {
      if (cancelled) return;
      
      const scrollContainer = document.getElementById('main-scroll-container');
      const scrollY = scrollContainer ? scrollContainer.scrollTop : win.pageYOffset;
      const viewportHeight = win.innerHeight;
      
      // ✅ CORREÇÃO BUG 1: Preload baseado apenas em scroll, sem depender de elementos DOM
      // Preload Quiz quando usuário scrollou mais de 1 viewport
      const shouldPreloadQuiz = scrollY > viewportHeight * 0.5 && scrollY < viewportHeight * 3;
      
      if (shouldPreloadQuiz && !prefetchedQuiz) {
        prefetchedQuiz = true;
        import('../pages/Quiz').catch(() => {});
      }
      
      // Preload Checkout apenas quando usuário está muito próximo do final
      if (scrollY > viewportHeight * 3 && !prefetchedCheckout) {
        prefetchedCheckout = true;
        import('../pages/Checkout').catch(() => {});
      }
    };

    // ✅ CORREÇÃO BUG 1: Deferir verificação inicial para garantir que DOM está pronto
    const initialCheck = () => {
      if (cancelled) return;
      // Aguardar um frame para garantir que DOM está renderizado
      win.requestAnimationFrame(() => {
        if (!cancelled) {
          checkScrollAndPreload();
        }
      });
    };
    
    if (win && 'requestIdleCallback' in win) {
      const w = win as any;
      w.requestIdleCallback(initialCheck, { timeout: 1000 });
    } else if (win) {
      win.setTimeout(initialCheck, 1000);
    }

    // Throttle scroll listener
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        win.requestAnimationFrame(() => {
          if (!cancelled) {
            checkScrollAndPreload();
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const scrollContainer = document.getElementById('main-scroll-container');
    const target = scrollContainer || win;
    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      cancelled = true;
      target.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // ✅ OTIMIZAÇÃO FASE 1.4: Deferir deep link hash handling
  useEffect(() => {
    const win = typeof window === "undefined" ? undefined : window;
    if (!win) return;

    let cancelled = false;
    // ✅ CORREÇÃO: Debounce para evitar múltiplos scrolls simultâneos
    let handleHashTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastHash = '';
    
    const handleHash = () => {
      if (cancelled) return;
      const hash = win.location.hash.replace('#', '');
      
      // ✅ CORREÇÃO: Ignorar se o hash não mudou
      if (hash === lastHash) {
        return;
      }
      lastHash = hash;
      
      // ✅ CORREÇÃO: Cancelar handleHash anterior se ainda estiver pendente
      if (handleHashTimeout) {
        clearTimeout(handleHashTimeout);
      }
      
      if (hash) {
        const offset = hash === 'pricing' ? -50 : 80;
        const scrollContainer = document.getElementById('main-scroll-container');
        
        // ✅ CORREÇÃO: Debounce de 50ms para evitar múltiplos scrolls
        handleHashTimeout = setTimeout(() => {
          // ✅ CORREÇÃO FAQ: Para FAQ, aguardar renderização antes de fazer scroll
          // O FAQ pode estar em LazySection e precisa ser renderizado primeiro
          const attemptScroll = (retries = 10) => { // ✅ Aumentar retries para FAQ
            const element = document.getElementById(hash);
            
            if (element) {
              // ✅ CORREÇÃO PULO: Usar scrollManager que cancela scrolls anteriores automaticamente
              scrollManager.scrollToElement(hash, offset, scrollContainer || null);
            } else if (retries > 0) {
              // ✅ CORREÇÃO FAQ: Aguardar mais tempo para FAQ (pode estar em LazySection)
              // Usar setTimeout com delay maior para dar tempo do React renderizar
              setTimeout(() => {
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    attemptScroll(retries - 1);
                  });
                });
              }, hash === 'faq' ? 50 : 16); // Delay maior para FAQ
            } else {
              // Última tentativa com scrollManager (que tem seus próprios retries)
              scrollManager.scrollToElement(hash, offset, scrollContainer || null);
            }
          };
          
          // Iniciar tentativa de scroll
          attemptScroll();
        }, 50);
      }
    };

    // ✅ CORREÇÃO FAQ: Adicionar listener para hashchange
    win.addEventListener('hashchange', handleHash);
    
    // Executar handleHash inicialmente
    if ('requestIdleCallback' in win) {
      const w = win as Window & typeof globalThis;
      const id = w.requestIdleCallback(handleHash, { timeout: 1000 });
      return () => {
        cancelled = true;
        if (handleHashTimeout) {
          clearTimeout(handleHashTimeout);
        }
        w.removeEventListener('hashchange', handleHash);
        if (typeof w.cancelIdleCallback === 'function') {
          w.cancelIdleCallback(id);
        }
      };
    }

    const timer = globalThis.setTimeout(handleHash, 1000);
    return () => {
      cancelled = true;
      if (handleHashTimeout) {
        clearTimeout(handleHashTimeout);
      }
      (win as Window).removeEventListener('hashchange', handleHash);
      globalThis.clearTimeout(timer);
    };
  }, []);

  // ✅ CORREÇÃO PRODUÇÃO: Adicionar classe ao body para desabilitar scroll quando há container customizado
  useEffect(() => {
    document.body.classList.add('has-custom-scroll');
    // ✅ OTIMIZAÇÃO: Forçar height fixo no body para prevenir scroll
    const originalBodyHeight = document.body.style.height;
    document.body.style.height = '100dvh';
    document.body.style.overflowY = 'hidden';
    
    return () => {
      document.body.classList.remove('has-custom-scroll');
      document.body.style.height = originalBodyHeight;
      document.body.style.overflowY = '';
    };
  }, []);

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      {/* ✅ OTIMIZAÇÃO PERFORMANCE: Header lazy loaded com fallback mínimo */}
      <Suspense fallback={<div className="fixed top-0 left-0 right-0 z-50 h-[80px] bg-background border-b border-border/20" />}>
        <Header />
      </Suspense>
      <div 
        id="main-scroll-container"
        className="flex-1 overflow-y-auto overflow-x-hidden main-scroll-container"
        style={{ 
          WebkitOverflowScrolling: 'touch',
        }}
        ref={(el) => {
          // Container de scroll principal
        }}
      >
        <HeroSection />
        
        <main className="container mx-auto px-3 sm:px-4 py-0 sm:py-4 space-y-4 sm:space-y-12">
        
        {/* ✅ CORREÇÃO PRODUÇÃO: Renderizar elementos acima do fold imediatamente SEM Suspense */}
        {/* ✅ OTIMIZAÇÃO FASE 1.2: Aumentar rootMargin para 600px em componentes abaixo do fold */}
        <div id="radiola" className="scroll-mt-20 mt-8 sm:mt-0">
          <div className="grid gap-4 sm:gap-6 items-center max-w-6xl mx-auto px-4">
            <div className="flex justify-center w-full">
              {/* ✅ CORREÇÃO: Renderizar VinylPlayer imediatamente SEM Suspense (não é lazy-loaded) */}
              {/* ✅ CORREÇÃO LARGURA: Limitar largura máxima para manter tamanho original */}
              <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
                <VinylPlayer />
              </div>
            </div>
          </div>
        </div>
        
        <div className="scroll-animate scroll-animate-delay-1">
          {/* ✅ CORREÇÃO: Renderizar HowItWorks imediatamente SEM Suspense (não é lazy-loaded) */}
          <HowItWorks />
        </div>
        
        <div className="scroll-animate scroll-animate-delay-2" id="testimonials-section">
          {/* Testimonials é lazy-loaded, então precisa de Suspense */}
          <Suspense fallback={null}>
            <Testimonials />
          </Suspense>
        </div>
        
        <div className="scroll-animate scroll-animate-delay-3">
          {/* ✅ CORREÇÃO: Renderizar PricingSection imediatamente SEM Suspense (não é lazy-loaded) */}
          <PricingSection />
        </div>
        
        <div className="scroll-animate scroll-animate-delay-4">
          {/* ✅ CORREÇÃO FAQ: Renderizar FAQ imediatamente se há hash #faq na URL */}
          {/* Usar estado currentHash OU verificação direta do window.location.hash para garantir renderização */}
          {typeof window !== 'undefined' && (currentHash === '#faq' || window.location.hash === '#faq') ? (
            <Suspense fallback={null}>
              <FAQ />
            </Suspense>
          ) : (
            <LazySection minHeight={520} rootMargin="600px 0px">
              <FAQ />
            </LazySection>
          )}
        </div>
        
        <div className="scroll-animate scroll-animate-delay-5">
          <section id="contato" className="container mx-auto px-4 py-8 sm:py-10 text-center scroll-mt-24">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Entre em Contato</h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-4">Entre em contato conosco. Estamos prontos para ajudar você a criar a música perfeita para seus momentos especiais!</p>
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <a href="mailto:contato@musiclovely.com" className="text-sm sm:text-base text-primary hover:underline">
                contato@musiclovely.com
              </a>
            </div>
          </section>
        </div>
      </main>

      {/* ✅ OTIMIZAÇÃO FASE 1.4: Footer com IntersectionObserver para preload apenas quando visível */}
      <div className="scroll-animate scroll-animate-delay-6">
        <LazySection minHeight={300} rootMargin="200px 0px">
          <Footer />
        </LazySection>
      </div>
      </div>
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
