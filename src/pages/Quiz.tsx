import { useState, useEffect, memo, useCallback, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};
const devWarn = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.warn(...args);
  }
};
const devError = (...args: any[]) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
};
import { Loader2 } from '@/utils/iconImports';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';
import { useTranslation } from '@/hooks/useTranslation';
import { useUtmParams } from '@/hooks/useUtmParams';
import { useUtmifyTracking } from '@/hooks/useUtmifyTracking';
import { validateQuiz, sanitizeQuiz, sanitizeString, formatValidationErrors, type QuizData, type ValidationError } from '@/utils/quizValidation';
import { saveQuizToStorage, loadQuizFromStorage, getOrCreateQuizSessionId } from '@/utils/quizSync';
import { insertQuizWithRetry, enqueueQuizToServer, type QuizPayload } from '@/utils/quizInsert';
import QuizProgress from './QuizSteps/QuizProgress';
import QuizNavigation from './QuizSteps/QuizNavigation';
import QuizStep1 from './QuizSteps/QuizStep1';
import QuizStep2 from './QuizSteps/QuizStep2';
import QuizStep3 from './QuizSteps/QuizStep3';
import QuizStep4 from './QuizSteps/QuizStep4';
import QuizStep5 from './QuizSteps/QuizStep5';

// These will be replaced with translated versions in the component

const Quiz = memo(() => {
  const { t } = useTranslation();
  const location = useLocation();
  // ✅ SIMPLIFICADO: Preservar UTMs através do funil
  const { navigateWithUtms, utms } = useUtmParams();
  const { trackEvent } = useUtmifyTracking();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const hasShownDataLoadedRef = useRef(false);
  const isSubmittingRef = useRef(false); // ✅ Proteção contra cliques duplicados
  const isNavigatingRef = useRef(false); // ✅ CORREÇÃO PRODUÇÃO: Proteção contra navegação duplicada
  const isStepChangingRef = useRef(false);
  const isMountedRef = useRef(true); // ✅ Verificação de montagem para prevenir erros de DOM
  const dataLoadedRef = useRef(false); // ✅ Flag para indicar que dados foram carregados
  const quizStartedTrackedRef = useRef(false); // ✅ Flag para rastrear se quiz_started já foi enviado
  const quizCompletedTrackedRef = useRef(false); // ✅ Flag para rastrear se quiz_completed já foi enviado

  const [formData, setFormData] = useState({
    relationship: '',
    customRelationship: '',
    aboutWho: '',
    style: '',
    language: 'pt',
    vocalGender: '',
    qualities: '',
    memories: '',
    message: ''
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const markFieldsTouched = useCallback((fields: string[]) => {
    setTouched((prev) => {
      const next = new Set(prev);
      for (const field of fields) {
        next.add(field);
      }
      return next;
    });
  }, []);

  const markFieldTouched = useCallback((field: string) => {
    setTouched((prev) => {
      if (prev.has(field)) return prev;
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }, []);

  const hasFieldError = useCallback(
    (field: string) => touched.has(field) && errors.some((e) => e.field === field),
    [errors, touched]
  );

  const getFieldError = useCallback(
    (field: string) => {
      if (!touched.has(field)) return undefined;
      return errors.find((e) => e.field === field)?.message;
    },
    [errors, touched]
  );

  const updateField = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const quizData = useMemo<QuizData>(() => {
    const isOtherRelationship = formData.relationship === t('quiz.relationships.other');
    const relationshipValue = isOtherRelationship
      ? `Outro: ${sanitizeString(formData.customRelationship)}`
      : formData.relationship;

    return {
      about_who: formData.aboutWho,
      relationship: relationshipValue,
      style: formData.style,
      language: formData.language,
      vocal_gender: formData.vocalGender ? formData.vocalGender : null,
      qualities: formData.qualities,
      memories: formData.memories,
      message: formData.message,
      utm_params: utms,
    };
  }, [formData, t, utms]);

  // Translated constants - Opções separadas por gênero
  // ✅ CORREÇÃO: Usar useMemo para evitar recriação do array e garantir valores únicos
  const RELATIONSHIPS = useMemo(() => {
    const relationships = [
      t('quiz.relationships.spouse_male'),
      t('quiz.relationships.spouse_female'),
      t('quiz.relationships.child_male'),
      t('quiz.relationships.child_female'),
      t('quiz.relationships.father'),
      t('quiz.relationships.mother'),
      t('quiz.relationships.sibling_male'),
      t('quiz.relationships.friend_male'),
      t('quiz.relationships.myself_male'),
      t('quiz.relationships.other')
    ];
    // ✅ CORREÇÃO: Remover valores duplicados caso existam
    const unique = Array.from(new Set(relationships));
    return unique;
  }, [t]);

  const STYLES = [
    t('quiz.styles.pop'),
    t('quiz.styles.rock'),
    t('quiz.styles.mpb'),
    t('quiz.styles.sertanejo'),
    t('quiz.styles.forro'),
    t('quiz.styles.jazz'),
    t('quiz.styles.gospel'),
    t('quiz.styles.reggae'),
    t('quiz.styles.electronic'),
    t('quiz.styles.rap')
  ] as const;

  const VOCAL_OPTIONS = [
    { value: 'f', label: t('quiz.vocalOptions.female') },
    { value: 'm', label: t('quiz.vocalOptions.male') }
  ] as const;

  const totalSteps = 5;
  const progress = useMemo(() => (step / totalSteps) * 100, [step]);

  const [searchParams] = useSearchParams();

  // ✅ TRACKING: Rastrear início do quiz (apenas uma vez)
  useEffect(() => {
    if (!quizStartedTrackedRef.current && step === 1) {
      quizStartedTrackedRef.current = true;
      if (typeof trackEvent === 'function') {
        trackEvent('quiz_started', {
          pathname: location.pathname,
          hasUtms: Object.keys(utms || {}).length > 0,
        }).catch(() => {});
      }
    }
  }, [step, trackEvent, location.pathname, utms]);

  // ✅ OTIMIZAÇÃO: Preload agressivo do Checkout quando usuário está no Quiz
  // Preload quando chega no step 2 ou mais (mais cedo para garantir que está pronto)
  useEffect(() => {
    // Preload Checkout quando usuário está no step 2 ou mais
    if (step >= 2) {
      // Preload imediato e agressivo (sem esperar requestIdleCallback)
      import('../pages/Checkout').catch(() => {});
      
      // Preload de recursos críticos do Checkout imediatamente
      Promise.all([
        import('@/components/ui/button').catch(() => {}),
        import('@/components/ui/card').catch(() => {}),
        import('@/components/ui/input').catch(() => {}),
        import('@/components/ui/badge').catch(() => {}),
        // ✅ OTIMIZAÇÃO: Removido import dinâmico desnecessário de lucide-react
      ]).catch(() => {});
    }
    
    // Preload ainda mais agressivo quando está no último step
    if (step >= 4) {
      // Preload de tudo novamente para garantir que está em cache
      import('../pages/Checkout').catch(() => {});
    }
  }, [step]);
  
  // ✅ OTIMIZAÇÃO: Preload quando usuário começa a preencher o último step
  useEffect(() => {
    if (step >= 4 && formData.message) {
      // Usuário está preenchendo a última pergunta - preload imediato
      import('../pages/Checkout').catch(() => {});
    }
  }, [step, formData.message]);

  // ✅ Cleanup: Marcar componente como desmontado
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, [location.pathname]);

  // ✅ OTIMIZAÇÃO FASE 2.1: Deferir carregamento de dados do quiz para não bloquear renderização inicial
  useEffect(() => {
    const win = typeof window === "undefined" ? undefined : window;
    if (!win) return;

    let cancelled = false;
    const loadQuizData = () => {
      if (cancelled) return;
      
      // ✅ CORREÇÃO: Evitar recarregar se dados já foram carregados
      if (dataLoadedRef.current) {
        return;
      }
      
      // PRIORIDADE 1: Verificar se há parâmetros de edição na URL
      const orderId = searchParams.get('order_id');
      const quizId = searchParams.get('quiz_id');
      const token = searchParams.get('token');
      const edit = searchParams.get('edit');

      if (edit === 'true' && orderId && quizId) {
      devLog('📥 [Quiz] Carregando quiz para edição via URL:', { orderId, quizId, token, edit });
      
      const loadQuizFromDatabase = async () => {
        try {
          // ✅ Verificar montagem antes de atualizar estado
          if (!isMountedRef.current) return;
          setLoading(true);
          
          // Tentar validar token se fornecido (opcional - não bloquear se token falhar)
          if (token) {
            devLog('🔍 [Quiz] Validando token...');
            const { data: linkData, error: linkError } = await supabase
              .from('checkout_links')
              .select('*')
              .eq('order_id', orderId)
              .eq('quiz_id', quizId)
              .eq('token', token)
              .gt('expires_at', new Date().toISOString())
              .is('used_at', null)
              .single();

            if (linkError || !linkData) {
              devWarn('⚠️ [Quiz] Token inválido ou expirado, mas continuando com carregamento:', {
                error: linkError?.message,
                code: linkError?.code,
                details: linkError?.details
              });
            } else {
              devLog('✅ [Quiz] Token válido');
            }
          } else {
            devWarn('⚠️ [Quiz] Token não fornecido na URL, continuando mesmo assim');
          }

          // Buscar quiz do banco (mesmo se token falhar, pois temos order_id e quiz_id válidos)
          devLog('🔍 [Quiz] Buscando quiz no banco:', { quizId });
          
          // Tentar primeiro via RPC (ignora RLS), depois via query normal
          let quizData = null;
          let quizError = null;
          
          try {
            devLog('🔍 [Quiz] Tentando buscar quiz via RPC...');
            const { data: rpcData, error: rpcError } = await supabase
              .rpc('get_quiz_by_id', { quiz_id_param: quizId });
            
            // Verificar se função RPC não existe (erro específico)
            if (rpcError) {
              devWarn('⚠️ [Quiz] Erro ao chamar RPC:', {
                message: rpcError.message,
                code: rpcError.code,
                details: rpcError.details
              });
              
              // Se função não existe (42883 = function does not exist), tentar query normal imediatamente
              if (rpcError.code === '42883' || rpcError.message?.includes('does not exist')) {
                devLog('⚠️ [Quiz] Função RPC não existe, tentando query normal imediatamente...');
                const { data: queryData, error: queryError } = await supabase
                  .from('quizzes')
                  .select('*')
                  .eq('id', quizId)
                  .single();
                
                quizData = queryData;
                quizError = queryError;
              } else {
                // Outro erro, tentar query normal como fallback
                devLog('⚠️ [Quiz] Erro na RPC, tentando query normal como fallback...');
                const { data: queryData, error: queryError } = await supabase
                  .from('quizzes')
                  .select('*')
                  .eq('id', quizId)
                  .single();
                
                quizData = queryData;
                quizError = queryError;
              }
            } else if (rpcData && rpcData.length > 0) {
              quizData = rpcData[0];
              devLog('✅ [Quiz] Quiz encontrado via RPC');
            } else {
              // RPC retornou vazio, tentar query normal
              devLog('⚠️ [Quiz] RPC retornou vazio, tentando query normal...');
              const { data: queryData, error: queryError } = await supabase
                .from('quizzes')
                .select('*')
                .eq('id', quizId)
                .single();
              
              quizData = queryData;
              quizError = queryError;
            }
          } catch (error) {
            devError('❌ [Quiz] Erro ao buscar quiz:', error);
            quizError = error;
          }

          if (quizError) {
            devError('❌ [Quiz] Erro ao buscar quiz:', {
              error: quizError.message,
              code: quizError.code,
              details: quizError.details,
              hint: quizError.hint,
              quizId
            });
            if (isMountedRef.current) {
              toast.error(`Erro ao carregar quiz: ${quizError.message || 'Quiz não encontrado'}`);
              setLoading(false);
            }
            return;
          }

          if (!quizData) {
            devError('❌ [Quiz] Quiz não encontrado no banco:', { quizId });
            if (isMountedRef.current) {
              toast.error('Quiz não encontrado');
              setLoading(false);
            }
            return;
          }

          devLog('✅ [Quiz] Quiz encontrado:', {
            quizId: quizData.id,
            about_who: quizData.about_who,
            style: quizData.style
          });
          
          // Verificar se o quiz pertence ao pedido (segurança adicional)
          devLog('🔍 [Quiz] Verificando se quiz pertence ao pedido:', { orderId });
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('quiz_id, status, customer_email')
            .eq('id', orderId)
            .single();
          
          if (orderError) {
            devError('❌ [Quiz] Erro ao buscar pedido:', {
              error: orderError.message,
              code: orderError.code,
              details: orderError.details,
              orderId
            });
            if (isMountedRef.current) {
              toast.error(`Erro ao verificar pedido: ${orderError.message || 'Pedido não encontrado'}`);
              setLoading(false);
            }
            return;
          }

          if (!orderData) {
            devError('❌ [Quiz] Pedido não encontrado:', { orderId });
            if (isMountedRef.current) {
              toast.error('Pedido não encontrado');
              setLoading(false);
            }
            return;
          }

          if (orderData.quiz_id !== quizId) {
            devError('❌ [Quiz] Quiz não pertence ao pedido:', {
              order_quiz_id: orderData.quiz_id,
              provided_quiz_id: quizId
            });
            if (isMountedRef.current) {
              toast.error('Quiz não corresponde ao pedido');
              setLoading(false);
            }
            return;
          }

          devLog('✅ [Quiz] Quiz pertence ao pedido, continuando...');

          // Parse relationship (handle "Outro: xxx" format)
          let relationship = quizData.relationship || '';
          let customRelationship = '';
          
          if (relationship && relationship.startsWith('Outro: ')) {
            customRelationship = relationship.replace('Outro: ', '');
            relationship = t('quiz.relationships.other');
          }
          
          // ✅ Verificar montagem antes de atualizar estado
          if (!isMountedRef.current) return;
          
          // ✅ CORREÇÃO: Resetar loading ANTES de carregar dados para garantir que campos estejam editáveis
          setLoading(false);
          
          // Populate form with existing data usando função funcional para garantir atualização
          if (!dataLoadedRef.current) {
            setFormData(prev => ({
              ...prev,
              relationship,
              customRelationship,
              aboutWho: quizData.about_who || '',
              style: quizData.style || '',
              language: quizData.language || prev.language,
              vocalGender: quizData.vocal_gender || '',
              qualities: quizData.qualities || '',
              memories: quizData.memories || '',
              message: quizData.message || ''
            }));
            dataLoadedRef.current = true; // ✅ Marcar que dados foram carregados
          }
          
          // Salvar order_id e quiz_id para atualização posterior
          localStorage.setItem('editing_order_id', orderId);
          localStorage.setItem('editing_quiz_id', quizId);
          localStorage.setItem('editing_token', token || '');
          
          devLog('✅ [Quiz] Quiz carregado com sucesso, dados salvos no localStorage');
          if (isMountedRef.current) {
            toast.success('Quiz carregado para edição');
          }
        } catch (error) {
          devError('❌ [Quiz] Erro ao carregar quiz:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          devError('❌ [Quiz] Detalhes do erro:', {
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            error
          });
          if (isMountedRef.current) {
            toast.error(`Erro ao carregar quiz: ${errorMessage}`);
            setLoading(false);
          }
        } finally {
          if (isMountedRef.current) {
            setLoading(false);
          }
        }
      };

        loadQuizFromDatabase();
        return;
      }

      // PRIORIDADE 2: Carregar do localStorage usando utilitário
      // ✅ CORREÇÃO: Evitar recarregar se dados já foram carregados
      if (dataLoadedRef.current) {
        return;
      }
      
      const loadedQuiz = loadQuizFromStorage();
    
    if (loadedQuiz) {
      try {
        // ✅ CORREÇÃO: Resetar loading ANTES de carregar dados para garantir que campos estejam editáveis
        if (isMountedRef.current) {
          setLoading(false);
        }
        
        // Parse relationship (handle "Outro: xxx" format)
        let relationship = loadedQuiz.relationship || '';
        let customRelationship = '';
        
        if (relationship && relationship.startsWith('Outro: ')) {
          customRelationship = relationship.replace('Outro: ', '');
          relationship = t('quiz.relationships.other');
        }
        
        // ✅ Mapear valores antigos para novos (compatibilidade retroativa)
        const relationshipMapping: Record<string, string> = {
          'Esposo(a)': t('quiz.relationships.spouse_male'),
          'Esposa': t('quiz.relationships.spouse_female'),
          'Filho(a)': t('quiz.relationships.child_male'),
          'Filho': t('quiz.relationships.child_male'),
          'Filha': t('quiz.relationships.child_female'),
          'Irmão(ã)': t('quiz.relationships.sibling_male'),
          'Irmão': t('quiz.relationships.sibling_male'),
          'Irmã': t('quiz.relationships.sibling_male'),
          'Amigo(a)': t('quiz.relationships.friend_male'),
          'Amigo': t('quiz.relationships.friend_male'),
          'Amiga': t('quiz.relationships.friend_male'),
          'Eu mesmo(a)': t('quiz.relationships.myself_male'),
          'Eu mesmo': t('quiz.relationships.myself_male'),
          'Eu mesma': t('quiz.relationships.myself_male'),
        };
        
        // Se o relacionamento está no mapeamento, usar o valor mapeado
        if (relationship && relationshipMapping[relationship]) {
          relationship = relationshipMapping[relationship];
        }
        
        // ✅ Verificar montagem antes de atualizar estado
        if (!isMountedRef.current) return;
        
        // ✅ CORREÇÃO: Evitar recarregar se dados já foram carregados
        if (!dataLoadedRef.current) {
          setFormData(prev => ({
            ...prev,
            relationship,
            customRelationship,
            aboutWho: loadedQuiz.about_who || '',
            style: loadedQuiz.style || '',
            language: loadedQuiz.language || prev.language,
            vocalGender: loadedQuiz.vocal_gender || '',
            qualities: loadedQuiz.qualities || '',
            memories: loadedQuiz.memories || '',
            message: loadedQuiz.message || ''
          }));
          dataLoadedRef.current = true; // ✅ Marcar que dados foram carregados
        }
        
        if (!hasShownDataLoadedRef.current) {
          toast.info('Seu progresso foi carregado');
          hasShownDataLoadedRef.current = true;
        }
        
      } catch (error) {
        devError('❌ [Quiz] Erro ao carregar quiz do localStorage:', error);
        toast.error('Erro ao carregar seu progresso.');
        localStorage.removeItem('pending_quiz');
        sessionStorage.removeItem('pending_quiz');
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    } else {
      devLog('📥 [Quiz] Nenhum quiz salvo encontrado.');
      if (!dataLoadedRef.current) {
        dataLoadedRef.current = true;
      }
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
    };

    // ✅ OTIMIZAÇÃO FASE 2.1: Usar requestIdleCallback para não bloquear thread principal
    if ('requestIdleCallback' in win) {
      win.requestIdleCallback(loadQuizData, { timeout: 2000 });
    } else {
      // Fallback para setTimeout para navegadores mais antigos
      setTimeout(loadQuizData, 500);
    }
    
    return () => {
      cancelled = true;
    };
  }, [searchParams, t]);

  const debouncedQuizData = useDebounce(quizData, 500);
  useEffect(() => {
    if (!dataLoadedRef.current) return;
    if (!debouncedQuizData.about_who || !debouncedQuizData.style) return;
    void saveQuizToStorage(debouncedQuizData);
  }, [debouncedQuizData]);

  const validateStep = useCallback((): boolean => {
    const nextErrors: ValidationError[] = [];

    if (step === 1) {
      markFieldsTouched(['relationship', 'customRelationship', 'about_who']);

      if (!sanitizeString(formData.relationship)) {
        nextErrors.push({
          field: 'relationship',
          message: t('quiz.validation.selectRelationship')
        });
      }

      if (formData.relationship === t('quiz.relationships.other')) {
        if (!sanitizeString(formData.customRelationship)) {
          nextErrors.push({
            field: 'customRelationship',
            message: t('quiz.validation.enterRelationship')
          });
        }
      }

      const aboutWho = sanitizeString(formData.aboutWho);
      if (!aboutWho) {
        nextErrors.push({ field: 'about_who', message: t('quiz.validation.enterName') });
      } else if (aboutWho.length > 100) {
        nextErrors.push({ field: 'about_who', message: t('quiz.validation.nameTooLong') });
      }
    }

    if (step === 2) {
      markFieldsTouched(['style', 'vocal_gender']);

      if (!sanitizeString(formData.style)) {
        nextErrors.push({ field: 'style', message: t('quiz.validation.selectStyle') });
      }

      if (!sanitizeString(formData.vocalGender)) {
        const vocalMessage = t('quiz.validation.selectVocal', 'Selecione uma preferência de voz');
        toast.error(vocalMessage);
        nextErrors.push({
          field: 'vocal_gender',
          message: vocalMessage
        });
      }
    }

    if (step === 3) {
      markFieldsTouched(['qualities']);
      if (formData.qualities && formData.qualities.length > 500) {
        nextErrors.push({ field: 'qualities', message: t('quiz.validation.maxCharacters') });
      }
    }

    if (step === 4) {
      markFieldsTouched(['memories']);
      if (formData.memories && formData.memories.length > 800) {
        nextErrors.push({ field: 'memories', message: t('quiz.validation.maxMemories') });
      }
    }

    if (step === 5) {
      markFieldsTouched(['message']);
      if (formData.message && formData.message.length > 500) {
        nextErrors.push({ field: 'message', message: t('quiz.validation.maxMessage') });
      }
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  }, [formData, markFieldsTouched, step, t]);

  const handleNext = useCallback(() => {
    if (isStepChangingRef.current) return;
    if (!validateStep()) {
      return;
    }
    isStepChangingRef.current = true;
    
    // ✅ TRACKING: Rastrear conclusão de etapa
    if (typeof trackEvent === 'function') {
      trackEvent('quiz_step_completed', {
        step,
        total_steps: totalSteps,
        progress: Math.round((step / totalSteps) * 100),
      }).catch(() => {});
    }
    
    setStep(prev => Math.min(prev + 1, totalSteps));
    requestAnimationFrame(() => {
      isStepChangingRef.current = false;
    });
  }, [validateStep, step, totalSteps, trackEvent]);

  const handleBack = useCallback(() => {
    if (isStepChangingRef.current) return;
    isStepChangingRef.current = true;
    setStep(prev => Math.max(prev - 1, 1));
    requestAnimationFrame(() => {
      isStepChangingRef.current = false;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmittingRef.current) {
      devWarn('⚠️ [Quiz] Envio já em andamento, ignorando clique duplicado.');
      return;
    }
    
    if (!validateStep()) {
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    
    try {
      markFieldsTouched([
        'relationship',
        'customRelationship',
        'about_who',
        'style',
        'vocal_gender',
        'qualities',
        'memories',
        'message'
      ]);

      const sanitizedData = sanitizeQuiz(quizData);
      const validationResult = validateQuiz(sanitizedData, { strict: false });

      if (!validationResult.valid) {
        setErrors(validationResult.errors);
        toast.error(formatValidationErrors(validationResult.errors) || 'Dados inválidos. Revise suas respostas.');
        isSubmittingRef.current = false;
        setLoading(false);
        return;
      }
      
      // ✅ CORREÇÃO: Usar o ID do quiz da edição se estiver editando
      const editingQuizId = localStorage.getItem('editing_quiz_id');
      const editingOrderId = localStorage.getItem('editing_order_id');
      const editingToken = localStorage.getItem('editing_token');

      if (editingQuizId && editingOrderId) {
        const { error: updateError } = await supabase
          .from('quizzes')
          .update({
            about_who: sanitizedData.about_who,
            relationship: sanitizedData.relationship,
            style: sanitizedData.style,
            language: sanitizedData.language,
            vocal_gender: sanitizedData.vocal_gender,
            qualities: sanitizedData.qualities,
            memories: sanitizedData.memories,
            message: sanitizedData.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingQuizId);

        if (updateError) {
          devError('❌ [Quiz] Erro ao atualizar quiz (edição):', updateError);
          toast.error('Erro ao salvar alterações. Tente novamente.');
          isSubmittingRef.current = false;
          setLoading(false);
          return;
        }

        localStorage.removeItem('editing_quiz_id');
        localStorage.removeItem('editing_order_id');
        localStorage.removeItem('editing_token');

        // ✅ TRACKING: Rastrear conclusão do quiz (edição)
        if (!quizCompletedTrackedRef.current && typeof trackEvent === 'function') {
          quizCompletedTrackedRef.current = true;
          trackEvent('quiz_completed', {
            step,
            total_steps: totalSteps,
            is_edit: true,
            about_who: sanitizedData.about_who,
            style: sanitizedData.style,
          }).catch(() => {});
        }

        if (isNavigatingRef.current) return;
        isNavigatingRef.current = true;

        if (isMountedRef.current) {
          const tokenParam = editingToken ? `&token=${encodeURIComponent(editingToken)}` : '';
          navigateWithUtms(`/checkout?restore=true&order_id=${editingOrderId}&quiz_id=${editingQuizId}${tokenParam}`);
        }

        return;
      }

      const saveResult = await saveQuizToStorage(sanitizedData);
      const sessionId = getOrCreateQuizSessionId();
      const payload: QuizPayload = {
        user_id: null,
        customer_email: null,
        customer_whatsapp: null,
        about_who: sanitizedData.about_who ?? '',
        relationship: sanitizedData.relationship,
        style: sanitizedData.style ?? '',
        language: sanitizedData.language ?? 'pt',
        vocal_gender: sanitizedData.vocal_gender ?? null,
        qualities: sanitizedData.qualities,
        memories: sanitizedData.memories,
        message: sanitizedData.message,
        key_moments: (quizData as any).key_moments ?? null,
        occasion: (quizData as any).occasion ?? null,
        desired_tone: (quizData as any).desired_tone ?? null,
        answers: (quizData as any).utm_params ? { utm_params: (quizData as any).utm_params } : undefined,
        session_id: sessionId,
      };

      if (!saveResult.success) {
        devError('❌ [Quiz] Erro ao salvar quiz no storage:', saveResult.error);
        toast.error(t('quiz.messages.errorSaving'));
        void (async () => {
          try {
            const res = await insertQuizWithRetry(payload);
            if (!res.success) await enqueueQuizToServer(payload, res.error);
          } catch (e) {
            await enqueueQuizToServer(payload, e);
          }
        })();
      } else {
        try {
          const res = await insertQuizWithRetry(payload);
          if (!res.success) {
            await enqueueQuizToServer(payload, res.error);
            devWarn('⚠️ [Quiz] Quiz enfileirado para retry (persistência ao concluir)');
          } else {
            devLog('✅ [Quiz] Quiz persistido no banco ao concluir', { quiz_id: res.data?.id });
          }
        } catch (persistErr) {
          await enqueueQuizToServer(payload, persistErr);
          devWarn('⚠️ [Quiz] Erro ao persistir quiz, enfileirado para retry', persistErr);
        }
      }

      // ✅ TRACKING: Rastrear conclusão do quiz (novo)
      if (!quizCompletedTrackedRef.current && typeof trackEvent === 'function') {
        quizCompletedTrackedRef.current = true;
        trackEvent('quiz_completed', {
          step,
          total_steps: totalSteps,
          is_edit: false,
          about_who: sanitizedData.about_who,
          style: sanitizedData.style,
        }).catch(() => {});
      }

      if (isNavigatingRef.current) return;
      isNavigatingRef.current = true;

      if (isMountedRef.current) {
        navigateWithUtms('/checkout');
      }
      
    } catch (error) {
      devError('❌ [Quiz] Erro inesperado no envio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Ocorreu um erro inesperado: ${errorMessage}`);
      isSubmittingRef.current = false;
      setLoading(false);
    }
  }, [markFieldsTouched, navigateWithUtms, quizData, t, validateStep]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <QuizStep1
            formData={formData}
            relationships={RELATIONSHIPS}
            updateField={updateField}
            markFieldTouched={markFieldTouched}
            hasFieldError={hasFieldError}
            getFieldError={getFieldError}
          />
        );
      case 2:
        return (
          <QuizStep2
            formData={formData}
            styles={STYLES}
            vocalOptions={VOCAL_OPTIONS}
            updateField={updateField}
            markFieldTouched={markFieldTouched}
            hasFieldError={hasFieldError}
            getFieldError={getFieldError}
          />
        );
      case 3:
        return (
          <QuizStep3
            formData={formData}
            updateField={updateField}
            markFieldTouched={markFieldTouched}
            hasFieldError={hasFieldError}
            getFieldError={getFieldError}
          />
        );
      case 4:
        return (
          <QuizStep4
            formData={formData}
            updateField={updateField}
            markFieldTouched={markFieldTouched}
            hasFieldError={hasFieldError}
            getFieldError={getFieldError}
          />
        );
      case 5:
        return (
          <QuizStep5
            formData={formData}
            updateField={updateField}
            markFieldTouched={markFieldTouched}
            hasFieldError={hasFieldError}
            getFieldError={getFieldError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--quiz-background))] p-3 md:p-6" style={{ minHeight: 'var(--dvh)' }}>
      <div className="max-w-[700px] lg:max-w-[600px] mx-auto py-4 md:py-4">
        <Card className="relative border-[hsl(var(--quiz-border))] shadow-lg">
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--quiz-primary))]" />
            </div>
          )}
          <CardHeader className="pb-0 md:pb-3 px-4 md:px-5 pt-4 md:pt-5">
            <QuizProgress step={step} totalSteps={totalSteps} progress={progress} />
            <CardTitle className="text-2xl md:text-2xl lg:text-2xl mb-0">
              {step === 1 && t('quiz.titles.step1')}
              {step === 2 && t('quiz.titles.step2')}
              {step === 3 && t('quiz.titles.step3')}
              {step === 4 && t('quiz.titles.step4')}
              {step === 5 && t('quiz.titles.step5')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-5 pb-4 md:pb-5 pt-1 md:pt-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
                <div className="transition-opacity duration-300">
                  {renderStep()}
                </div>
              </Suspense>
              <QuizNavigation
                step={step}
                totalSteps={totalSteps}
                onBack={handleBack}
                onNext={handleNext}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default Quiz;
