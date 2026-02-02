(function(){
  'use strict';
  
  // ✅ FASE 1: Verificação de ambiente melhorada
  var hostname = location.hostname;
  var isProd =
    hostname === 'musiclovely.com' ||
    hostname === 'www.musiclovely.com' ||
    hostname === 'musiclovely.com.br' ||
    hostname === 'www.musiclovely.com.br' ||
    hostname.endsWith('.vercel.app');
  
  // NÃO CARREGAR EM DESENVOLVIMENTO - evita erros no console
  if (!isProd) {
    return;
  }

  // ✅ FASE 1: Sistema de diagnóstico e logs estruturados
  var DEBUG = false; // Pode ser ativado via localStorage.setItem('utmify_debug', 'true')
  try {
    DEBUG = localStorage.getItem('utmify_debug') === 'true';
  } catch (e) {
    // Ignorar se localStorage não estiver disponível
  }

  var log = function(level, message, data) {
    if (!DEBUG && level !== 'error') return;
    var prefix = '[UtmifyLoader]';
    var logMessage = prefix + ' ' + message;
    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  };

  // ✅ FASE 1: Estado de carregamento
  var state = {
    pixelScriptLoaded: false,
    utmsScriptLoaded: false,
    fbqAvailable: false,
    pixelScriptError: false,
    utmsScriptError: false,
    retryCount: 0,
    maxRetries: 3,
    retryDelay: 2000
  };

  // ✅ FASE 1: Pixel ID do Utmify
  window.pixelId = "68f98a3f196fbe7f0e5683c7";

  // ✅ FASE 1: Verificar se fbq está disponível
  var checkFbqAvailable = function() {
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        if (!state.fbqAvailable) {
          state.fbqAvailable = true;
          log('info', '✅ fbq disponível');
          
          // ✅ FASE 1: Disparar evento customizado quando fbq estiver disponível
          try {
            var event = new CustomEvent('fbq-ready', { 
              detail: { 
                timestamp: Date.now(),
                pixelId: window.pixelId 
              } 
            });
            window.dispatchEvent(event);
          } catch (e) {
            log('error', 'Erro ao disparar evento fbq-ready', e);
          }
        }
        return true;
      }
    } catch (e) {
      log('error', 'Erro ao verificar fbq', e);
    }
    return false;
  };

  // ✅ FASE 1: Verificação periódica de fbq (fallback)
  var fbqCheckInterval = null;
  var startFbqCheck = function() {
    if (fbqCheckInterval) return;
    
    var attempts = 0;
    var maxAttempts = 50; // 50 tentativas = ~25 segundos (500ms cada)
    
    fbqCheckInterval = setInterval(function() {
      attempts++;
      if (checkFbqAvailable() || attempts >= maxAttempts) {
        if (fbqCheckInterval) {
          clearInterval(fbqCheckInterval);
          fbqCheckInterval = null;
        }
        if (attempts >= maxAttempts && !state.fbqAvailable) {
          log('warn', '⚠️ fbq não disponível após ' + maxAttempts + ' tentativas');
        }
      }
    }, 500);
  };

  // ✅ FASE 1: Função para carregar script com retry logic
  var loadScript = function(url, scriptName, onLoad, onError) {
    var script = document.createElement('script');
    script.async = true;
    script.defer = false; // ✅ FASE 1: Remover defer para garantir execução mais rápida
    
    var handleLoad = function() {
      log('info', '✅ Script carregado: ' + scriptName);
      if (onLoad) onLoad();
    };
    
    var handleError = function() {
      log('error', '❌ Erro ao carregar script: ' + scriptName);
      if (onError) onError();
    };
    
    script.onload = handleLoad;
    script.onerror = handleError;
    script.src = url;
    
    // ✅ FASE 1: Timeout de segurança (10 segundos)
    var timeout = setTimeout(function() {
      if (!script.onload || script.onload === handleLoad) {
        log('warn', '⚠️ Timeout ao carregar script: ' + scriptName);
        handleError();
      }
    }, 10000);
    
    script.onload = function() {
      clearTimeout(timeout);
      handleLoad();
    };
    
    // ✅ FASE 1: Adicionar ao head imediatamente
    var head = document.head || document.getElementsByTagName('head')[0];
    if (head) {
      head.appendChild(script);
    } else {
      // ✅ FASE 1: Se head não estiver disponível, aguardar DOM
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          var head = document.head || document.getElementsByTagName('head')[0];
          if (head) head.appendChild(script);
        }, { once: true });
      } else {
        // Fallback: criar head se não existir
        var newHead = document.createElement('head');
        document.documentElement.insertBefore(newHead, document.documentElement.firstChild);
        newHead.appendChild(script);
      }
    }
    
    return script;
  };

  // ✅ FASE 1: Função principal de carregamento com retry
  var loadScripts = function(isRetry) {
    if (isRetry) {
      state.retryCount++;
      log('info', '🔄 Tentativa ' + state.retryCount + ' de ' + state.maxRetries);
      
      if (state.retryCount > state.maxRetries) {
        log('error', '❌ Máximo de tentativas atingido. Scripts não carregados.');
        
        // ✅ FASE 1: Disparar evento de falha
        try {
          var event = new CustomEvent('utmify-scripts-failed', {
            detail: {
              timestamp: Date.now(),
              retryCount: state.retryCount,
              pixelScriptError: state.pixelScriptError,
              utmsScriptError: state.utmsScriptError
            }
          });
          window.dispatchEvent(event);
        } catch (e) {
          log('error', 'Erro ao disparar evento de falha', e);
        }
        return;
      }
    }

    log('info', '🚀 Iniciando carregamento dos scripts...');

    // ✅ FASE 1: Carregar script de pixel (Facebook Pixel)
    if (!state.pixelScriptLoaded && !state.pixelScriptError) {
      loadScript(
        'https://cdn.utmify.com.br/scripts/pixel/pixel.js',
        'pixel.js',
        function() {
          state.pixelScriptLoaded = true;
          checkFbqAvailable();
          startFbqCheck(); // Iniciar verificação periódica
        },
        function() {
          state.pixelScriptError = true;
          // Retry após delay
          setTimeout(function() {
            if (!state.pixelScriptLoaded) {
              loadScripts(true);
            }
          }, state.retryDelay);
        }
      );
    }

    // ✅ FASE 1: Carregar script de UTMs
    if (!state.utmsScriptLoaded && !state.utmsScriptError) {
      var utmsScript = loadScript(
        'https://cdn.utmify.com.br/scripts/utms/latest.js',
        'latest.js',
        function() {
          state.utmsScriptLoaded = true;
          log('info', '✅ Scripts Utmify carregados com sucesso');
          
          // ✅ FASE 1: Disparar evento de sucesso
          try {
            var event = new CustomEvent('utmify-scripts-loaded', {
              detail: {
                timestamp: Date.now(),
                pixelScriptLoaded: state.pixelScriptLoaded,
                utmsScriptLoaded: state.utmsScriptLoaded
              }
            });
            window.dispatchEvent(event);
          } catch (e) {
            log('error', 'Erro ao disparar evento de sucesso', e);
          }
        },
        function() {
          state.utmsScriptError = true;
          // Retry após delay
          setTimeout(function() {
            if (!state.utmsScriptLoaded) {
              loadScripts(true);
            }
          }, state.retryDelay);
        }
      );
      
      // ✅ FASE 1: Adicionar atributo para prevenir subids
      utmsScript.setAttribute('data-utmify-prevent-subids', '');
    }
  };

  // ✅ FASE 1: Executar imediatamente (não esperar DOM)
  // O script deve executar o mais rápido possível
  if (document.readyState === 'loading') {
    // Se o DOM ainda está carregando, aguardar mas não bloquear
    document.addEventListener('DOMContentLoaded', function() {
      loadScripts(false);
    }, { once: true });
  } else {
    // DOM já está pronto, executar imediatamente
    loadScripts(false);
  }

  // ✅ FASE 1: Expor estado globalmente para diagnóstico (apenas em debug)
  if (DEBUG) {
    window.__utmifyLoaderState = state;
    window.__utmifyLoaderCheckFbq = checkFbqAvailable;
  }
})();
