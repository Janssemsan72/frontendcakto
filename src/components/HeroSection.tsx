import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "@/utils/iconImports";
const heroAvatar1 = "/testimonials/avatar-1.webp";
const heroAvatar2 = "/testimonials/avatar-2.webp";
const heroAvatar3 = "/testimonials/avatar-3.webp";
import { LinkWithUtms } from "@/components/LinkWithUtms";

// ✅ OTIMIZAÇÃO: Versão única 240p para carregamento INSTANTÂNEO (otimizado para mobile - 99% dos usuários)
// Fallback para vídeo original se versão comprimida não existir
const heroVideoSources = {
  minimal: '/video/musiclovaly-240p.webm',  // Versão padrão - carregamento INSTANTÂNEO (< 1s) - 163KB
  original: '/video/musiclovaly.webm'        // Vídeo original (fallback se versão comprimida não existir)
};

/** Frame ~50% da duração do clip (extraído do WebM), alinhado ao instante inicial de reprodução — evita “pulo” poster → vídeo. */
const heroVideoPoster = '/video/musiclovaly-poster.webp';

function queueHeroVideoStart(video: HTMLVideoElement, isMobile: boolean): () => void {
  let cancelled = false;
  let seekedListener: (() => void) | null = null;

  const tryPlay = () => {
    if (cancelled) return;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (!cancelled && isMobile) {
          setTimeout(() => {
            if (!cancelled && video.paused) {
              video.play().catch(() => {});
            }
          }, 100);
        }
      });
    }
  };

  const seekToMiddleAndPlay = () => {
    if (cancelled) return;
    const d = video.duration;
    if (!Number.isFinite(d) || d <= 0) {
      tryPlay();
      return;
    }
    const mid = d / 2;
    seekedListener = () => {
      video.removeEventListener("seeked", seekedListener!);
      seekedListener = null;
      if (!cancelled) tryPlay();
    };
    video.addEventListener("seeked", seekedListener);
    video.currentTime = mid;
  };

  const onLoadedMetadata = () => {
    seekToMiddleAndPlay();
  };

  if (
    video.readyState >= HTMLMediaElement.HAVE_METADATA &&
    Number.isFinite(video.duration) &&
    video.duration > 0
  ) {
    seekToMiddleAndPlay();
  } else {
    video.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
  }

  return () => {
    cancelled = true;
    video.removeEventListener("loadedmetadata", onLoadedMetadata);
    if (seekedListener) {
      video.removeEventListener("seeked", seekedListener);
    }
  };
}

export default function HeroSection() {
  const [shouldLoadVideo, setShouldLoadVideo] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const mountedRef = React.useRef(true);
  const detachHeroVideoStartRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Recarregar vídeo quando a conexão voltar após falha/offline
  React.useEffect(() => {
    const handleOnline = () => {
      if (!mountedRef.current || !shouldLoadVideo || !videoRef.current) return;
      const video = videoRef.current;
      const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
      video.load();
      detachHeroVideoStartRef.current?.();
      detachHeroVideoStartRef.current = queueHeroVideoStart(video, isMobile);
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [shouldLoadVideo]);

  // Início no meio do clip (igual ao poster), sem autoPlay — evita frame inicial e “entrada” poster→vídeo
  React.useEffect(() => {
    if (!shouldLoadVideo || !videoRef.current) return;
    const video = videoRef.current;
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
    detachHeroVideoStartRef.current?.();
    detachHeroVideoStartRef.current = queueHeroVideoStart(video, isMobile);
    return () => {
      detachHeroVideoStartRef.current?.();
      detachHeroVideoStartRef.current = null;
    };
  }, [shouldLoadVideo]);

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
            {shouldLoadVideo ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover z-10"
                poster={heroVideoPoster}
                loop
                muted
                playsInline
                preload="auto"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  if (!mountedRef.current) return;
                  setShouldLoadVideo(false);
                  if (videoRef.current === target) videoRef.current = null;
                }}
              >
                {/* ✅ OTIMIZAÇÃO: Versão única 240p (163KB) para carregamento instantâneo - otimizado para mobile */}
                <source src={heroVideoSources.minimal} type="video/webm" />
                <source src={heroVideoSources.original} type="video/webm" />
              </video>
            ) : (
              <img
                src={heroVideoPoster}
                alt=""
                className="absolute inset-0 w-full h-full object-cover z-10"
                width={640}
                height={269}
                decoding="async"
                fetchPriority="high"
              />
            )}
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
        <LinkWithUtms
          to="/quiz"
          id="cta_quiz_hero_promo"
          className="block mb-3 p-2.5 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg border border-yellow-500/30 max-w-md mx-auto w-full cursor-pointer hover:brightness-[1.02] active:brightness-[0.98] transition"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg sm:text-xl">🎁</span>
            <span className="font-bold text-sm sm:text-base">Pague 1, Leve 2 Versões</span>
          </div>
        </LinkWithUtms>

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
          <Button size="lg" asChild
            className="text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl bg-primary hover:bg-primary-600 text-white shadow-soft hover:shadow-medium transition-all hover:scale-105 w-full sm:w-auto group btn-pulse"
          >
            <LinkWithUtms to="/quiz" id="cta_quiz_hero_main">
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                <span>🎵 Criar Sua Música Aqui</span>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </LinkWithUtms>
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
