// 静态导入翻译数据
import languageNamesData from './translations/language-names.json';
import translationsData from './translations/translations.json';

// 导出语言名称
export const languageNames: Record<string, string> = languageNamesData;

// 导出翻译数据
export const translations = translationsData;

export type TranslationKey = keyof typeof translations;
export type LanguageCode = keyof typeof languageNames;

export function baseTryT<T>(
  dictionary: T,
  key: keyof T,
  language: string,
): string | keyof T | null {
  const translation = dictionary[key];
  if (!translation) return null;

  return (translation as Record<string, string>)[language];
}

export function baseT<T>(
  dictionary: T,
  key: keyof T,
  language: string,
): string | keyof T {
  return (
    baseTryT(dictionary, key, language) ||
    baseTryT(dictionary, key, 'en') ||
    key
  );
}

export function t(key: TranslationKey, language: string): string {
  return baseT(translations, key, language);
}

export function getLanguageName(code: string): string {
  return languageNames[code] || code;
}
