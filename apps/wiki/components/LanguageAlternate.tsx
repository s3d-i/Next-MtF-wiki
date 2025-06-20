'use client';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

interface LanguageAlternateProps {
  languageAlternate: Map<string, string>;
}

export function LanguageAlternate({
  languageAlternate,
}: LanguageAlternateProps) {
  const [globalLanguageAlternate, setGlobalLanguageAlternate] = useAtom(
    languageAlternateAtom,
  );
  useEffect(() => {
    setGlobalLanguageAlternate(languageAlternate);
    return () => {
      setGlobalLanguageAlternate(null);
    };
  }, [languageAlternate, setGlobalLanguageAlternate]);

  return null;
}

export const languageAlternateAtom = atom<Map<string, string> | null>(null);
