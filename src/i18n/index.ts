import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import ptTranslations from './locales/pt.json';
import ptBRTranslations from './locales/pt-BR.json';
import enTranslations from './locales/en.json';

const resources = {
  'pt': {
    translation: ptTranslations
  },
  'pt-BR': {
    translation: ptBRTranslations
  },
  'en': {
    translation: enTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    lng: 'pt-BR',
    debug: false,
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'vida-leve-language'
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false
    }
  });

export default i18n;