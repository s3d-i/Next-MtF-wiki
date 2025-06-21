'use client';

import { Link } from '@/components/progress';
import { notFoundT } from '@/lib/i18n/not-found';
import { getLanguageConfigs } from '@/lib/site-config';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<string>('');

  useEffect(() => {
    // 从路径中提取语言信息
    const pathSegments = pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];

    // 检查第一个路径段是否是支持的语言代码
    const supportedLanguages = getLanguageConfigs().map((lang) => lang.code);
    if (supportedLanguages.includes(firstSegment)) {
      setLanguage(firstSegment);
    }
  }, [pathname]);

  // 如果检测到语言，使用该语言的翻译
  if (language) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-base-content mb-4">
              {notFoundT('notFound', language)}
            </h2>
            <p className="text-base-content/70 mb-8">
              {notFoundT('notFoundDescription', language)}
            </p>
          </div>

          <div className="space-y-4">
            <Link href={`/${language}`} className="btn btn-outline btn-block">
              {notFoundT('backToHome', language)}
            </Link>
          </div>

          <div className="mt-8 text-sm text-base-content/50">
            <p>
              {notFoundT('path', language)}: {pathname}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有检测到语言，显示中英双语
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-base-content mb-4">
            {notFoundT('notFound', 'en')} / {notFoundT('notFound', 'zh-cn')}
          </h2>
          <p className="text-base-content/70 mb-8">
            {notFoundT('notFoundDescription', 'en')}
            <br />
            {notFoundT('notFoundDescription', 'zh-cn')}
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/" className="btn btn-outline btn-block">
            {notFoundT('backToHome', 'zh-cn')} / {notFoundT('backToHome', 'en')}
          </Link>
        </div>

        <div className="mt-8 text-sm text-base-content/50">
          <p>
            {notFoundT('path', 'en')} / {notFoundT('path', 'zh-cn')}: {pathname}
          </p>
        </div>
      </div>
    </div>
  );
}
