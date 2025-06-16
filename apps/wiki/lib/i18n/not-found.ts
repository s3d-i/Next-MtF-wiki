import { baseT } from './client';

import translationsData from './translations/not-found-translations.json';

export const translations = translationsData;

export type TranslationKey = keyof typeof translations;

export function notFoundT(key: TranslationKey, language: string): string {
  return baseT(translations, key, language);
}
