// 静态导入翻译数据
import languageNamesData from './translations/language-names.json';
import translationsData from './translations/translations.json';

// 导出语言名称
export const languageNames: Record<string, string> = languageNamesData;

// 导出翻译数据
export const translations = translationsData;

export type TranslationKey = keyof typeof translations;
export type LanguageCode = keyof typeof languageNames;

export function t(key: TranslationKey, language: string): string {
  const translation = translations[key];
  if (!translation) return key;
  
  return (translation as Record<string, string>)[language] || (translation as Record<string, string>).en || key;
}

export function getLanguageName(code: string): string {
  return languageNames[code] || code;
} 