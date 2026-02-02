import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// ✅ OTIMIZAÇÃO CRÍTICA: Fallback básico para evitar erros antes do lazy load
const fallbackTranslations = {
  notFound: {
    title: 'Página não encontrada',
    description: 'A página que você está procurando não existe ou foi movida.',
    backHome: 'Voltar para Home',
    goBack: 'Voltar'
  }
};

// ✅ OTIMIZAÇÃO: Inicializar i18n com fallback mínimo primeiro (não bloqueia renderização)
// Isso permite que a aplicação funcione mesmo antes do lazy load das traduções completas
try {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        pt: { translation: fallbackTranslations },
      },
      fallbackLng: 'pt',
      lng: 'pt',
      fallbackNS: 'translation',
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      defaultNS: 'translation',
      ns: ['translation'],
      react: {
        useSuspense: false,
      },
      initImmediate: true,
      returnNull: false,
      returnEmptyString: false,
      returnObjects: false,
    });
} catch (initError) {
  console.error('❌ [i18n] Erro crítico ao inicializar i18n:', initError);
}

// ✅ OTIMIZAÇÃO: Função async para lazy load das traduções completas
// Carrega apenas quando necessário, após primeiro paint
export const initI18n = async () => {
  try {
    // Lazy load das traduções completas
    const pt = await import('./locales/pt.json');
    // Corrigir tipo para evitar erro TS2339
    const ptModule = pt as { default?: Record<string, unknown> };
    const ptTranslations = ptModule.default || pt || fallbackTranslations;
    
    // Adicionar traduções completas ao i18n já inicializado
    i18n.addResourceBundle('pt', 'translation', ptTranslations, true, true);
    
    // Garantir que está em português
    await i18n.changeLanguage('pt');
    
    return i18n;
  } catch (err) {
    console.error('❌ [i18n] Erro ao carregar traduções:', err);
    // Manter fallback se houver erro
    return i18n;
  }
};

// Exportar i18n para compatibilidade com código existente
export default i18n;
