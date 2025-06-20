import 'server-only';
import { baseT, baseTryT } from './client';

// 静态导入翻译数据
import translationsData from './translations/server-translations.json';

// 导出翻译数据
export const translations = translationsData;

export type TranslationKey = keyof typeof translations;

export function sT(key: TranslationKey, language: string): string {
  return baseT(translations, key, language);
}

export function sTryT(key: TranslationKey, language: string): string | null {
  return baseTryT(translations, key, language);
}
