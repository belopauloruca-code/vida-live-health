import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LanguageSwitcherProps {
  variant?: 'full' | 'compact';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'full' }) => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'pt-BR', label: t('languages.pt-BR') },
    { code: 'pt', label: t('languages.pt') },
    { code: 'en', label: t('languages.en') }
  ];

  const handleLanguageChange = async (languageCode: string) => {
    // Change the language in i18next
    await i18n.changeLanguage(languageCode);
    
    // Update document language attribute
    document.documentElement.lang = languageCode;
    
    // Save to localStorage
    localStorage.setItem('vida-leve-language', languageCode);
    
    // Save to user metadata in Supabase if authenticated
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { language: languageCode }
        });
      }
    } catch (error) {
      console.log('Could not save language preference to user metadata:', error);
    }
  };

  if (variant === 'compact') {
    return (
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-12 h-10 p-0 border-none bg-transparent hover:bg-accent">
          <div className="flex items-center justify-center w-full">
            <Globe className="h-4 w-4" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Globe className="h-5 w-5" />
      <div className="flex-1">
        <p className="font-medium">{t('common.language')}</p>
        <Select value={i18n.language} onValueChange={handleLanguageChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('common.language')} />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};