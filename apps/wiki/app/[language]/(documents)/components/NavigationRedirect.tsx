'use client';

import { useSkeleton } from '@/components/progress';
import { usePathname, useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';

const HISTORY_KEY = 'lastPages';

interface NavigationRedirectProps {
  language: string;
  currentPath: string;
  redirectToSingleChild?: string | null;
}

export default function NavigationRedirect({
  language,
  currentPath,
  redirectToSingleChild,
}: NavigationRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showImmediately } = useSkeleton({ noFlushSync: true });

  useLayoutEffect(() => {
    const history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');

    if (redirectToSingleChild) {
      const parentPath = `/${language}/${currentPath}`;
      const childPath = `/${language}/${redirectToSingleChild}`;

      if (!pathname.startsWith(childPath) && pathname === parentPath) {
        const hasChildInHistory = history.some((page: string) =>
          page?.startsWith(childPath),
        );

        if (!hasChildInHistory) {
          // 立即显示骨架屏，使用noFlushSync避免useLayoutEffect中的React错误
          showImmediately(childPath);
          router.replace(childPath);
          return;
        }
      }
    }

    if (history[0] !== pathname) {
      history.unshift(pathname);
      if (history.length > 2) history.pop();
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [
    language,
    currentPath,
    redirectToSingleChild,
    router,
    pathname,
    showImmediately,
  ]);

  return null;
}
