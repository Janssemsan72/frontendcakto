import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "@/utils/iconImports";
// ✅ DIFERENCIAÇÃO: Usar avatares diferentes da página inicial (não os mesmos das avaliações)
// Avatares da página inicial vêm de public/testimonials
const heroAvatar1 = "/testimonials/avatar-1.webp";
const heroAvatar2 = "/testimonials/avatar-2.webp";
const heroAvatar3 = "/testimonials/avatar-3.webp";
import { useUtmParams } from "@/hooks/useUtmParams";

// ✅ OTIMIZAÇÃO: Versão única 240p para carregamento INSTANTÂNEO (otimizado para mobile - 99% dos usuários)
// Fallback para vídeo original se versão comprimida não existir
const heroVideoSources = {
  minimal: '/video/musiclovaly-240p.webm',  // Versão padrão - carregamento INSTANTÂNEO (< 1s) - 163KB
  original: '/video/musiclovaly.webm'        // Vídeo original (fallback se versão comprimida não existir)
};
const heroPoster = '/images/collage-memories-new.webp';

export default function HeroSection() {
  const { navigateWithUtms } = useUtmParams();

  // ✅ CORREÇÃO MOBILE: Detectar dispositivo mobile uma vez
  const isMobileDevice = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return isMobile || (window.innerWidth <= 768 && isTouchDevice);
  }, []);

  // ✅ CORREÇÃO: Usar sessionStorage para preservar estado do vídeo entre remontagens
  const [videoReady, setVideoReady] = React.useState(() => {
    try {
      return sessionStorage.getItem('hero_video_ready') === 'true';
    } catch {
      return false;
    }
  });
  const [shouldLoadVideo, setShouldLoadVideo] = React.useState(() => {
    try {
      return sessionStorage.getItem('hero_should_load_video') === 'true';
    } catch {
      return false;
    }
  });
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const mountedRef = React.useRef(true);

  // Função para gerar links (apenas português)
  const getLocalizedLink = (path: string) => path;

  // ✅ CORREÇÃO PRODUÇÃO: Ref para prevenir cliques duplicados
  const isNavigatingRef = React.useRef(false);
  
  // Navegação para quiz
  const handleQuizClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // ✅ CORREÇÃO PRODUÇÃO: Prevenir cliques duplicados
    if (isNavigatingRef.current) {
      return;
    }
    
    isNavigatingRef.current = true;
    
    // Preload agressivo do Quiz antes de redirecionar
    import('../pages/Quiz').catch(() => {});
    const quizPath = getLocalizedLink('/quiz');
    navigateWithUtms(quizPath);
    
    // Resetar flag após navegação (fallback de segurança)
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  // ✅ OTIMIZAÇÃO: Listener para evento online (recarregar vídeo quando conexão voltar)
  React.useEffect(() => {
    const handleOnline = () => {
      if (mountedRef.current && shouldLoadVideo && !videoReady && videoRef.current) {
        // Recarregar vídeo quando conexão voltar
        videoRef.current.load();
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [shouldLoadVideo, videoReady]);

  React.useEffect(() => {
    mountedRef.current = true;

    let observer: PerformanceObserver | null = null;
    let fallbackTimerId: number | null = null;
    let idleCallbackId: number | null = null;

    const startVideoLoad = () => {
      if (!mountedRef.current) return;
      try {
        sessionStorage.setItem('hero_should_load_video', 'true');
      } catch {}
      setShouldLoadVideo(true);
    };

    const scheduleFallback = () => {
      if (typeof window === "undefined") return;

      const w = window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };

      // ✅ CORREÇÃO MOBILE: Timeout mais curto em mobile (500ms vs 2500ms)
      const timeout = isMobileDevice ? 500 : 2500;

      if (typeof w.requestIdleCallback === "function") {
        idleCallbackId = w.requestIdleCallback(startVideoLoad, { timeout });
        return;
      }

      fallbackTimerId = window.setTimeout(startVideoLoad, timeout);
    };

    // ✅ CORREÇÃO MOBILE: Em mobile, iniciar vídeo imediatamente após DOMContentLoaded
    if (isMobileDevice) {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // DOM já está pronto, iniciar imediatamente
        startVideoLoad();
      } else {
        // Aguardar DOMContentLoaded
        document.addEventListener('DOMContentLoaded', startVideoLoad, { once: true });
        // Fallback de segurança
        fallbackTimerId = window.setTimeout(startVideoLoad, 300);
      }
    } else {
      // Desktop: usar PerformanceObserver como antes
      if (typeof PerformanceObserver !== "undefined") {
        try {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
              if (entry.entryType === "largest-contentful-paint") {
                startVideoLoad();
                observer?.disconnect();
                observer = null;
                return;
              }
            }
          });
          observer.observe({ entryTypes: ["largest-contentful-paint"] });
          // ✅ CORREÇÃO: Timeout de segurança para PerformanceObserver (caso LCP não seja detectado)
          fallbackTimerId = window.setTimeout(startVideoLoad, 3000);
        } catch {
          scheduleFallback();
        }
      } else {
        scheduleFallback();
      }
    }

    return () => {
      mountedRef.current = false;
      observer?.disconnect();
      if (fallbackTimerId !== null) {
        window.clearTimeout(fallbackTimerId);
      }
      const w = window as unknown as { cancelIdleCallback?: (id: number) => void };
      if (idleCallbackId !== null && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleCallbackId);
      }
    };
  }, []);

  // ✅ CORREÇÃO: Garantir que o vídeo continue reproduzindo após remontagem
  React.useEffect(() => {
    if (shouldLoadVideo && videoRef.current) {
      const video = videoRef.current;
      const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
      
      // ✅ CORREÇÃO MOBILE: Tentar play imediatamente quando vídeo estiver pronto (readyState >= 2)
      if (video.readyState >= 2) {
        if (video.paused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              // ✅ CORREÇÃO MOBILE: Se autoplay falhar, tentar novamente após pequeno delay
              if (isMobile) {
                setTimeout(() => {
                  if (video && video.paused) {
                    video.play().catch(() => {});
                  }
                }, 100);
              }
            });
          }
        }
      } else {
        // ✅ CORREÇÃO MOBILE: Aguardar vídeo estar pronto antes de tentar play
        const handleCanPlay = () => {
          if (video && video.paused) {
            video.play().catch(() => {});
            video.removeEventListener('canplay', handleCanPlay);
          }
        };
        video.addEventListener('canplay', handleCanPlay, { once: true });
        
        return () => {
          video.removeEventListener('canplay', handleCanPlay);
        };
      }
    }
  }, [shouldLoadVideo, videoReady]);

  // ✅ OTIMIZAÇÃO: Versão única 240p - sem upgrade progressivo (otimizado para mobile)

  return (
    <section className="relative overflow-hidden">
      <div className="w-full px-3 pb-2 sm:px-4 sm:pt-0 sm:pb-12 md:px-10 md:pt-0 md:pb-16 text-center">
        <div className="max-w-sm sm:max-w-md md:max-w-2xl mx-auto">
          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl hero-image-container"
            style={{ 
              aspectRatio: '640/269',
              backgroundColor: '#E7D5C4'
            }}
          >
            <div 
              className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50"
              style={{ 
                zIndex: 0,
                willChange: 'auto'
              }}
              aria-hidden="true"
            />
            <picture>
              <source 
                srcSet={`${heroPoster} 1x, ${heroPoster} 2x`}
                type="image/webp"
                sizes="(max-width: 640px) 384px, 640px"
              />
              <img
                className="absolute inset-0 w-full h-full object-cover z-10"
                src={heroPoster}
                alt="Memórias especiais"
                width={640}
                height={269}
                sizes="(max-width: 640px) 384px, (max-width: 1024px) 640px, 1024px"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{ willChange: 'auto' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const posterFallback = "/placeholder.svg";
                  if (!target.src.endsWith(posterFallback)) target.src = posterFallback;
                }}
              />
            </picture>
            {shouldLoadVideo ? (
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
                style={{ zIndex: 20 }} // ✅ CORREÇÃO: z-index maior que a imagem (z-10) para ficar por cima
                poster={heroPoster}
                autoPlay
                loop
                muted
                playsInline
                preload={isMobileDevice ? "metadata" : "none"}
                onCanPlay={() => {
                  if (mountedRef.current) {
                    try {
                      sessionStorage.setItem('hero_video_ready', 'true');
                    } catch {}
                    setVideoReady(true);
                  }
                }}
                onPlaying={() => {
                  if (mountedRef.current) {
                    try {
                      sessionStorage.setItem('hero_video_ready', 'true');
                    } catch {}
                    setVideoReady(true);
                    // ✅ CORREÇÃO: Forçar play se o vídeo estiver pausado após remontagem
                    if (videoRef.current && videoRef.current.paused) {
                      videoRef.current.play().catch(() => {});
                    }
                  }
                }}
                onPlay={() => {
                  // ✅ CORREÇÃO: Garantir que o estado seja atualizado quando o vídeo começa a reproduzir
                  if (mountedRef.current) {
                    try {
                      sessionStorage.setItem('hero_video_ready', 'true');
                    } catch {}
                    setVideoReady(true);
                  }
                }}
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  if (!mountedRef.current) return;
                  setVideoReady(false);
                  setShouldLoadVideo(false);
                  if (videoRef.current === target) videoRef.current = null;
                }}
              >
                {/* ✅ OTIMIZAÇÃO: Versão única 240p (163KB) para carregamento instantâneo - otimizado para mobile */}
                <source src={heroVideoSources.minimal} type="video/webm" />
                <source src={heroVideoSources.original} type="video/webm" />
              </video>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        
        <div className="mt-1 mb-1">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-semibold">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
            <span>A plataforma #1 de músicas personalizadas</span>
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight px-2">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Músicas Personalizadas para Seus Momentos Especiais
          </span>
        </h1>
        
        {/* Copy 2 Versões */}
        <button
          type="button"
          onClick={handleQuizClick}
          className="mb-3 p-2.5 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg border border-yellow-500/30 max-w-md mx-auto w-full cursor-pointer hover:brightness-[1.02] active:brightness-[0.98] transition"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg sm:text-xl">🎁</span>
            <span className="font-bold text-sm sm:text-base">Pague 1, Leve 2 Versões</span>
          </div>
        </button>

        <p 
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-3 sm:mb-4 px-2 sm:px-4 leading-relaxed"
          style={{
            minHeight: '3.5rem',
            contentVisibility: 'auto'
          }}
        >
          Propostas, casamentos, tributos — feitos com amor. Crie música personalizada que conta sua história única.
        </p>

        <div className="flex justify-center items-center mb-4 sm:mb-6 px-2">
          <Button
            size="lg"
            onClick={handleQuizClick}
            className="text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl bg-primary hover:bg-primary-600 text-white shadow-soft hover:shadow-medium transition-all hover:scale-105 w-full sm:w-auto group btn-pulse"
          >
            <span className="flex items-center justify-center gap-2 sm:gap-3">
              {/* ✅ CORREÇÃO: Fallback para garantir texto sempre visível */}
              <span>🎵 Criar Sua Música Aqui</span>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>


        <div className="flex items-center justify-center gap-2 sm:gap-4 px-2">
          <div className="flex -space-x-2 sm:-space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-background overflow-hidden shadow-soft aspect-square">
              <img src={heroAvatar1} alt="Cliente satisfeito" className="w-full h-full object-cover" width={48} height={48} sizes="48px" loading="lazy" decoding="async" />
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-background overflow-hidden shadow-soft aspect-square">
              <img src={heroAvatar2} alt="Cliente satisfeito" className="w-full h-full object-cover" width={48} height={48} sizes="48px" loading="lazy" decoding="async" />
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full border-2 border-background overflow-hidden shadow-soft aspect-square">
              <img src={heroAvatar3} alt="Cliente satisfeito" className="w-full h-full object-cover" width={48} height={48} sizes="48px" loading="lazy" decoding="async" />
            </div>
          </div>
          <div className="text-left">
            <div className="flex gap-0.5 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-amber-400 text-xs sm:text-sm">★</span>
              ))}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Mais de 500 músicas criadas com amor
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
