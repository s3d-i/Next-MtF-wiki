export const languageNames: Record<string, string> = {
  en: "English",
  "zh-cn": "简体中文",
  "zh-hant": "繁體中文",
  ja: "日本語",
  es: "Español",
};

export const translations = {
  // 导航
  docs: {
    "zh-cn": "文档",
    "zh-hant": "文檔",
    ja: "ドキュメント",
    es: "Documentos",
    en: "Documents",
  },
  about: {
    "zh-cn": "关于",
    "zh-hant": "關於",
    ja: "について",
    es: "Acerca de", 
    en: "About",
  },
  
  // 页脚
  description: {
    "zh-cn": "技术测试站点，内容仅供学习交流使用",
    "zh-hant": "技術測試站點，內容僅供學習交流使用",
    ja: "技術テストサイト、内容は学習・交流目的のみ",
    es: "Sitio de prueba técnica, contenido solo para aprendizaje e intercambio",
    en: "Technical testing site, content for learning and exchange purposes only",
  },
  quickLinks: {
    "zh-cn": "快速链接",
    "zh-hant": "快速連結", 
    ja: "クイックリンク",
    es: "Enlaces rápidos",
    en: "Quick Links",
  },
  browseDocs: {
    "zh-cn": "浏览文档",
    "zh-hant": "瀏覽文檔",
    ja: "ドキュメントを見る",
    es: "Ver documentos",
    en: "Browse Documents",
  },
  aboutUs: {
    "zh-cn": "关于本站",
    "zh-hant": "關於本站",
    ja: "このサイトについて",
    es: "Acerca del sitio",
    en: "About This Site",
  },
  community: {
    "zh-cn": "免责声明",
    "zh-hant": "免責聲明",
    ja: "免責事項",
    es: "Descargo de responsabilidad",
    en: "Disclaimer",
  },
  communityDesc: {
    "zh-cn": "本站为技术测试站点，所有内容仅供参考学习，不承担任何责任",
    "zh-hant": "本站為技術測試站點，所有內容僅供參考學習，不承擔任何責任",
    ja: "このサイトは技術テストサイトです。すべての内容は参考・学習目的のみで、一切の責任を負いません",
    es: "Este sitio es para pruebas técnicas. Todo el contenido es solo de referencia y aprendizaje, sin responsabilidad alguna",
    en: "This site is for technical testing. All content is for reference and learning only, with no liability assumed",
  },
  copyright: {
    "zh-cn": " 技术测试站点，内容仅供学习参考。",
    "zh-hant": " 技術測試站點，內容僅供學習參考。",
    ja: " 技術テストサイト、内容は学習参考用のみ。",
    es: " Sitio de prueba técnica, contenido solo para referencia de aprendizaje.",
    en: " Technical testing site, content for learning reference only.",
  },
  
  // 文档布局
  tableOfContents: {
    "zh-cn": "目录",
    "zh-hant": "目錄",
    ja: "目次",
    es: "Índice",
    en: "Table of Contents",
  },
  showToc: {
    "zh-cn": "显示目录",
    "zh-hant": "顯示目錄",
    ja: "目次を表示",
    es: "Mostrar índice",
    en: "Show Table of Contents",
  },
  noToc: {
    "zh-cn": "此页面暂无目录",
    "zh-hant": "此頁面暫無目錄",
    ja: "このページには目次がありません",
    es: "Esta página no tiene índice",
    en: "No table of contents for this page",
  },
  footnoteLabel: {
    "zh-cn": "注释",
    "zh-hant": "注釋",
    ja: "注釈",
    es: "Nota",
    en: "Footnote",
  },
  navigation:{
    "zh-cn": "导航",
    "zh-hant": "導航",
    ja: "ナビゲーション",
    es: "Navegación",
    en: "Navigation",
  }
} as const;

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