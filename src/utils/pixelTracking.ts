/**
 * Utilitários protegidos para tracking do Meta Pixel
 * Protege contra crashes quando o pixel está bloqueado ou não carregou
 * ✅ FASE 3: Melhorado com queue de eventos e verificação periódica
 */

// ✅ FASE 3: Queue de eventos para eventos disparados antes do pixel estar pronto
interface QueuedEvent {
  eventName: string;
  eventData?: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

const eventQueue: QueuedEvent[] = [];
const MAX_QUEUE_SIZE = 50;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo
const FBQ_CHECK_INTERVAL = 500; // Verificar a cada 500ms
const MAX_FBQ_CHECK_ATTEMPTS = 100; // ~50 segundos no total

let fbqCheckInterval: ReturnType<typeof setInterval> | null = null;
let fbqCheckAttempts = 0;
let isProcessingQueue = false;

/**
 * Verifica se o Meta Pixel (fbq) está disponível
 */
export function isFbqAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 
           typeof (window as any).fbq === 'function';
  } catch {
    return false;
  }
}

/**
 * ✅ FASE 3: Inicia verificação periódica de fbq
 */
function startFbqCheck(): void {
  if (fbqCheckInterval) return;
  
  fbqCheckAttempts = 0;
  fbqCheckInterval = setInterval(() => {
    fbqCheckAttempts++;
    
    if (isFbqAvailable()) {
      // fbq disponível, processar queue
      if (fbqCheckInterval) {
        clearInterval(fbqCheckInterval);
        fbqCheckInterval = null;
      }
      processEventQueue();
    } else if (fbqCheckAttempts >= MAX_FBQ_CHECK_ATTEMPTS) {
      // Timeout - parar verificação
      if (fbqCheckInterval) {
        clearInterval(fbqCheckInterval);
        fbqCheckInterval = null;
      }
    }
  }, FBQ_CHECK_INTERVAL);
}

/**
 * ✅ FASE 3: Adiciona evento à queue
 */
function enqueueEvent(eventName: string, eventData?: Record<string, unknown>): void {
  // Limitar tamanho da queue
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    // Remover evento mais antigo
    eventQueue.shift();
  }
  
  eventQueue.push({
    eventName,
    eventData,
    timestamp: Date.now(),
    retries: 0
  });
  
  // Iniciar verificação periódica se ainda não estiver rodando
  if (!isFbqAvailable() && !fbqCheckInterval) {
    startFbqCheck();
  }
  
  // Tentar processar imediatamente se fbq já estiver disponível
  if (isFbqAvailable()) {
    processEventQueue();
  }
}

/**
 * ✅ FASE 3: Processa eventos na queue
 */
function processEventQueue(): void {
  if (isProcessingQueue || !isFbqAvailable()) {
    return;
  }
  
  isProcessingQueue = true;
  
  try {
    const fbq = (window as any).fbq;
    const eventsToProcess = [...eventQueue];
    eventQueue.length = 0; // Limpar queue
    
    eventsToProcess.forEach((queuedEvent) => {
      try {
        if (queuedEvent.eventData) {
          fbq('track', queuedEvent.eventName, queuedEvent.eventData);
        } else {
          fbq('track', queuedEvent.eventName);
        }
      } catch (error) {
        // Se falhar, re-adicionar à queue para retry (até MAX_RETRIES)
        if (queuedEvent.retries < MAX_RETRIES) {
          queuedEvent.retries++;
          eventQueue.push(queuedEvent);
        }
      }
    });
  } catch (error) {
    // Em caso de erro, re-adicionar eventos à queue
    console.warn('[PixelTracking] Erro ao processar queue:', error);
  } finally {
    isProcessingQueue = false;
  }
}

/**
 * ✅ FASE 3: Rastreia evento de forma segura, usando queue se necessário
 */
function safeTrackWithQueue(eventName: string, eventData?: Record<string, unknown>): boolean {
  try {
    if (isFbqAvailable()) {
      const fbq = (window as any).fbq;
      if (eventData) {
        fbq('track', eventName, eventData);
      } else {
        fbq('track', eventName);
      }
      return true;
    } else {
      // fbq não disponível, adicionar à queue
      enqueueEvent(eventName, eventData);
      return false; // Retornar false mas evento será processado quando fbq estiver disponível
    }
  } catch (error) {
    // Em caso de erro, tentar adicionar à queue
    enqueueEvent(eventName, eventData);
    return false;
  }
}

/**
 * Rastreia evento de Lead de forma segura
 * @param eventData - Dados opcionais do evento
 * @returns true se o evento foi rastreado com sucesso, false caso contrário
 */
export function safeTrackLead(eventData?: Record<string, unknown>): boolean {
  return safeTrackWithQueue('Lead', eventData);
}

/**
 * Rastreia evento de AddToCart de forma segura
 * @param eventData - Dados opcionais do evento (ex: { value: 1 })
 * @returns true se o evento foi rastreado com sucesso, false caso contrário
 */
export function safeTrackAddToCart(eventData?: Record<string, unknown>): boolean {
  const defaultData = { value: 1, currency: 'BRL' };
  const finalData = eventData ? { ...defaultData, ...eventData } : defaultData;
  return safeTrackWithQueue('AddToCart', finalData);
}

/**
 * Rastreia evento de InitiateCheckout de forma segura
 * @param eventData - Dados opcionais do evento
 * @returns true se o evento foi rastreado com sucesso, false caso contrário
 */
export function safeTrackCheckout(eventData?: Record<string, unknown>): boolean {
  return safeTrackWithQueue('InitiateCheckout', eventData);
}

/**
 * Rastreia evento de Purchase de forma segura
 * @param eventData - Dados do evento (deve incluir value e currency)
 * @returns true se o evento foi rastreado com sucesso, false caso contrário
 */
export function safeTrackPurchase(eventData: { value: number; currency: string; [key: string]: unknown }): boolean {
  return safeTrackWithQueue('Purchase', eventData);
}

/**
 * Função genérica para rastrear qualquer evento do Meta Pixel de forma segura
 * @param eventName - Nome do evento (ex: 'Lead', 'AddToCart', 'InitiateCheckout')
 * @param eventData - Dados opcionais do evento
 * @returns true se o evento foi rastreado com sucesso, false caso contrário
 */
export function safeTrackEvent(eventName: string, eventData?: Record<string, unknown>): boolean {
  return safeTrackWithQueue(eventName, eventData);
}

/**
 * Executa função de tracking de forma segura, garantindo que erros não quebrem o código
 * @param trackingFunction - Função de tracking a ser executada
 * @returns true se executou sem erros, false caso contrário
 */
export function safeExecuteTracking(trackingFunction: () => void): boolean {
  try {
    trackingFunction();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * ✅ FASE 3: Limpa a queue de eventos (útil para testes ou reset)
 */
export function clearEventQueue(): void {
  eventQueue.length = 0;
}

/**
 * ✅ FASE 3: Retorna o tamanho atual da queue (útil para diagnóstico)
 */
export function getEventQueueSize(): number {
  return eventQueue.length;
}

/**
 * ✅ FASE 3: Força processamento da queue (útil quando fbq fica disponível)
 */
export function flushEventQueue(): boolean {
  if (isFbqAvailable()) {
    processEventQueue();
    return true;
  }
  return false;
}

// ✅ FASE 3: Escutar evento 'fbq-ready' do utmify-loader
if (typeof window !== 'undefined') {
  window.addEventListener('fbq-ready', () => {
    // Quando fbq estiver disponível, processar queue imediatamente
    flushEventQueue();
  }, { once: false });
}
