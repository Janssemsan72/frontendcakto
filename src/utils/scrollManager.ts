/**
 * Sistema centralizado de gerenciamento de scroll
 * Previne múltiplos scrolls simultâneos e garante comportamento consistente
 */

interface ScrollTask {
  id: string;
  target: number;
  container: HTMLElement | Window;
  timeoutId?: NodeJS.Timeout;
  animationFrameId?: number;
}

class ScrollManager {
  private activeScrolls: Map<string, ScrollTask> = new Map();
  private scrollLock: boolean = false;
  private lastScrollTime: number = 0;
  private readonly SCROLL_DEBOUNCE_MS = 50;
  private readonly MAX_SCROLL_DURATION_MS = 2000;

  /**
   * Cancela todos os scrolls ativos
   */
  cancelAllScrolls(): void {
    this.activeScrolls.forEach((task) => {
      if (task.timeoutId) {
        clearTimeout(task.timeoutId);
      }
      if (task.animationFrameId) {
        cancelAnimationFrame(task.animationFrameId);
      }
    });
    this.activeScrolls.clear();
    this.scrollLock = false;
  }

  /**
   * Cancela scrolls para um container específico
   */
  cancelScrollsForContainer(container: HTMLElement | Window): void {
    const containerId = container === window ? 'window' : (container as HTMLElement).id || 'unknown';
    const tasksToCancel: string[] = [];

    this.activeScrolls.forEach((task, id) => {
      if (task.container === container) {
        tasksToCancel.push(id);
        if (task.timeoutId) {
          clearTimeout(task.timeoutId);
        }
        if (task.animationFrameId) {
          cancelAnimationFrame(task.animationFrameId);
        }
      }
    });

    tasksToCancel.forEach((id) => {
      this.activeScrolls.delete(id);
    });
  }

  /**
   * Scroll para o topo (instantâneo, para navegação de páginas)
   */
  scrollToTop(container?: HTMLElement | null): void {
    // Cancelar todos os scrolls anteriores
    this.cancelAllScrolls();

    const now = Date.now();
    // Reduzir debounce para scrolls para o topo (mais responsivo)
    if (now - this.lastScrollTime < 10) {
      return;
    }
    this.lastScrollTime = now;

    const scrollContainer = container || document.getElementById('main-scroll-container');
    const taskId = `scroll-to-top-${Date.now()}`;

    const executeScroll = () => {
      // Prevenir scroll para o final - garantir que sempre vai para o topo
      if (scrollContainer) {
        // Container customizado
        scrollContainer.scrollTop = 0;
        scrollContainer.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
        // Forçar novamente para garantir
        if (scrollContainer.scrollTop !== 0) {
          scrollContainer.scrollTop = 0;
        }
      } else {
        // Window scroll
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
        document.documentElement.scrollTop = 0;
        if (document.body) {
          document.body.scrollTop = 0;
        }
        // Forçar novamente para garantir
        if (window.pageYOffset !== 0) {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          document.documentElement.scrollTop = 0;
          if (document.body) {
            document.body.scrollTop = 0;
          }
        }
      }

      // Garantir que ficou no topo após um pequeno delay (múltiplas verificações)
      const verifyTimeout = setTimeout(() => {
        if (scrollContainer) {
          if (scrollContainer.scrollTop > 5) {
            scrollContainer.scrollTop = 0;
            scrollContainer.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          }
        } else {
          if (window.pageYOffset > 5) {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            document.documentElement.scrollTop = 0;
            if (document.body) {
              document.body.scrollTop = 0;
            }
          }
        }
        
        // Verificação adicional após mais tempo
        setTimeout(() => {
          if (scrollContainer) {
            if (scrollContainer.scrollTop > 5) {
              scrollContainer.scrollTop = 0;
            }
          } else {
            if (window.pageYOffset > 5) {
              window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            }
          }
        }, 200);
        
        this.activeScrolls.delete(taskId);
      }, 100);

      const task: ScrollTask = {
        id: taskId,
        target: 0,
        container: scrollContainer || window,
        timeoutId: verifyTimeout
      };

      this.activeScrolls.set(taskId, task);

      // Auto-remover após duração máxima
      setTimeout(() => {
        this.activeScrolls.delete(taskId);
      }, this.MAX_SCROLL_DURATION_MS);
    };

    // Executar imediatamente
    executeScroll();

    // Verificar novamente após renderização (múltiplas vezes para garantir)
    requestAnimationFrame(() => {
      executeScroll();
      
      // Verificações adicionais
      setTimeout(() => {
        executeScroll();
      }, 50);
      
      setTimeout(() => {
        executeScroll();
      }, 150);
    });
  }

  /**
   * Scroll para um elemento específico (suave, para seções na mesma página)
   */
  scrollToElement(
    elementId: string,
    offset: number = 80,
    container?: HTMLElement | null,
    retries: number = 5 // ✅ CORREÇÃO FAQ: Aumentar retries para elementos lazy (era 3)
  ): void {
    // ✅ CORREÇÃO PULO: Cancelar TODOS os scrolls anteriores antes de iniciar um novo
    // Isso evita "pulos" quando há mudança de hash de uma seção para outra
    this.cancelAllScrolls();
    
    const scrollContainer = container || document.getElementById('main-scroll-container');

    const element = document.getElementById(elementId);
    
    // ✅ VERIFICAÇÃO ROBUSTA: Para FAQ quando scroll está no topo, verificar se elemento está realmente no DOM
    if (!element) {
      if (retries > 0) {
        // ✅ CORREÇÃO FAQ: Aumentar delay e número de retries para elementos lazy
        // Elementos lazy podem demorar mais para renderizar, especialmente quando scroll está no topo
        const delay = elementId === 'faq' ? 500 : 300; // Delay maior para FAQ
        setTimeout(() => {
          this.scrollToElement(elementId, offset, container, retries - 1);
        }, delay);
      }
      return;
    }
    
    // ✅ VERIFICAÇÃO ADICIONAL: Para FAQ quando scroll está no topo, verificar se elemento está visível/calculável
    if (elementId === 'faq' && scrollContainer && scrollContainer.scrollTop < 100) {
      // Verificar se o elemento tem dimensões válidas (está renderizado)
      const rect = element.getBoundingClientRect();
      const hasValidDimensions = rect.width > 0 || rect.height > 0;
      
      // Se o elemento não tem dimensões válidas, pode não estar totalmente renderizado
      // Aguardar um pouco mais antes de calcular
      if (!hasValidDimensions && retries > 0) {
        setTimeout(() => {
          this.scrollToElement(elementId, offset, container, retries - 1);
        }, 200);
        return;
      }
    }
    
    const now = Date.now();
    if (now - this.lastScrollTime < this.SCROLL_DEBOUNCE_MS) {
      return;
    }
    this.lastScrollTime = now;

    const taskId = `scroll-to-${elementId}-${Date.now()}`;

    const executeScroll = () => {
      if (scrollContainer) {
        // Container customizado
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const currentScrollTop = scrollContainer.scrollTop;
        const elementTopRelativeToContainer = elementRect.top - containerRect.top;
        const elementTopInContainer = currentScrollTop + elementTopRelativeToContainer;
        
        // ✅ CORREÇÃO: Para FAQ quando scroll está no topo, usar offsetTop recursivo com fallback robusto
        // O problema é que getBoundingClientRect() retorna posições relativas à viewport,
        // não ao container de scroll, causando cálculo incorreto quando o elemento está fora da viewport
        let targetScroll: number;
        if (elementId === 'faq' && currentScrollTop < 100) {
          // Para FAQ quando scroll está no topo, calcular posição usando offsetTop recursivo
          // Percorrer a árvore DOM do elemento até o container de scroll
          let elementTopInContainer = 0;
          let currentElement: HTMLElement | null = element;
          let foundContainer = false;
          
          // Tentar calcular usando offsetTop recursivo
          while (currentElement && currentElement !== scrollContainer) {
            elementTopInContainer += currentElement.offsetTop;
            const parent = currentElement.offsetParent as HTMLElement | null;
            if (parent === scrollContainer) {
              foundContainer = true;
              break;
            }
            currentElement = parent;
          }
          
          // Se encontrou o container, usar o valor calculado
          if (foundContainer || currentElement === scrollContainer) {
            targetScroll = Math.max(0, elementTopInContainer - offset);
          } else {
            // Fallback 1: Calcular usando offsetTop do elemento menos offsetTop do container
            // Isso funciona mesmo se não encontrarmos o container diretamente
            const elementOffsetTop = element.offsetTop;
            const containerOffsetTop = scrollContainer.offsetTop || 0;
            const relativeOffset = elementOffsetTop - containerOffsetTop;
            
            // Verificar se o cálculo faz sentido (deve ser positivo e razoável)
            if (relativeOffset > 0 && relativeOffset < scrollContainer.scrollHeight) {
              targetScroll = Math.max(0, relativeOffset - offset);
            } else {
              // Fallback 2: Usar getBoundingClientRect mas com cálculo mais preciso
              // Calcular posição absoluta do elemento e do container
              const elementAbsoluteTop = element.getBoundingClientRect().top + currentScrollTop;
              const containerAbsoluteTop = containerRect.top + currentScrollTop;
              const elementRelativeToContainer = elementAbsoluteTop - containerAbsoluteTop;
              targetScroll = Math.max(0, elementRelativeToContainer - offset);
            }
          }
        } else {
          targetScroll = Math.max(0, elementTopInContainer - offset);
        }

        // ✅ CORREÇÃO: Para evitar passar por outras seções (como pricing), usar scroll instantâneo
        // quando a distância for maior que 100px OU quando o elemento é FAQ (que está abaixo de pricing)
        // Isso evita o problema de "parar na seção de preços"
        const currentDistance = Math.abs(scrollContainer.scrollTop - targetScroll);
        const pricingElement = document.getElementById('pricing');
        
        // Verificar se FAQ está abaixo de pricing usando offsetTop (mais confiável que getBoundingClientRect durante scroll)
        let isBelowPricing = false;
        if (pricingElement && element && elementId === 'faq') {
          // Usar offsetTop para comparar posições absolutas no DOM
          const pricingTop = pricingElement.offsetTop;
          const elementTop = element.offsetTop;
          isBelowPricing = elementTop > pricingTop;
        }
        
        // ✅ VALIDAÇÃO: Verificar se targetScroll é válido (não negativo, não maior que scrollHeight)
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const validTargetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
        
        // Se a distância for maior que 100px OU se o elemento é FAQ (que está abaixo de pricing), usar scroll instantâneo
        // SEMPRE usar scroll instantâneo para FAQ para evitar passar por pricing
        if (currentDistance > 100 || isBelowPricing || elementId === 'faq') {
          scrollContainer.scrollTop = validTargetScroll;
        } else {
          scrollContainer.scrollTo({
            top: validTargetScroll,
            left: 0,
            behavior: 'smooth'
          });
        }

        // Garantir posição após scroll
        const verifyTimeout = setTimeout(() => {
          scrollContainer.scrollTop = targetScroll;
          // Verificar novamente
          setTimeout(() => {
            if (Math.abs(scrollContainer.scrollTop - targetScroll) > 10) {
              scrollContainer.scrollTop = targetScroll;
            }
            this.activeScrolls.delete(taskId);
          }, 200);
        }, 1000);

        const task: ScrollTask = {
          id: taskId,
          target: targetScroll,
          container: scrollContainer,
          timeoutId: verifyTimeout
        };

        this.activeScrolls.set(taskId, task);
      } else {
        // Window scroll
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        const targetScroll = Math.max(0, offsetPosition);

        window.scrollTo({
          top: targetScroll,
          left: 0,
          behavior: 'smooth'
        });

        // Garantir posição após scroll
        const verifyTimeout = setTimeout(() => {
          window.scrollTo({
            top: targetScroll,
            left: 0,
            behavior: 'auto'
          });
          // Verificar novamente
          setTimeout(() => {
            if (Math.abs(window.pageYOffset - targetScroll) > 10) {
              window.scrollTo({
                top: targetScroll,
                left: 0,
                behavior: 'auto'
              });
            }
            this.activeScrolls.delete(taskId);
          }, 200);
        }, 1000);

        const task: ScrollTask = {
          id: taskId,
          target: targetScroll,
          container: window,
          timeoutId: verifyTimeout
        };

        this.activeScrolls.set(taskId, task);
      }

      // Auto-remover após duração máxima
      setTimeout(() => {
        this.activeScrolls.delete(taskId);
      }, this.MAX_SCROLL_DURATION_MS);
    };

    // Executar após um pequeno delay para garantir que o DOM está pronto
    requestAnimationFrame(() => {
      executeScroll();
    });
  }
}

// Singleton instance
export const scrollManager = new ScrollManager();

