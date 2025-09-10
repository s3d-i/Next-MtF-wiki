'use client';

import { useSkeleton } from '@/components/progress';
import { usePathname, useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';

/**
 * 用于存储用户访问历史的sessionStorage键名
 * 最多保存2个页面的访问记录，用于判断用户是否访问过目标子页面
 */
const HISTORY_KEY = 'lastPages';

interface SingleChildRedirectProps {
  language: string;
  currentPath: string;
  /** 目标子页面路径 */
  redirectToSingleChild?: string | null;
}

export default function SingleChildRedirect({
  language,
  currentPath,
  redirectToSingleChild,
}: SingleChildRedirectProps) {
  const router = useRouter();
  const pathname = usePathname();
  // 使用noFlushSync避免在useLayoutEffect中调用flushSync导致React警告
  const { showImmediately } = useSkeleton({ noFlushSync: true });

  useLayoutEffect(() => {
    try {
      const history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');

      if (redirectToSingleChild) {
        const parentPath = `/${language}/${currentPath}`;
        const childPath = `/${language}/${redirectToSingleChild}`;

        // 仅在访问父页面且最近未访问过子页面时跳转
        if (pathname === parentPath) {
          const hasChildInHistory = history.some((page: string) =>
            page?.startsWith(childPath),
          );

          if (!hasChildInHistory) {
            // 显示骨架屏并跳转到子页面
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
    } catch {
      // 如果sessionStorage不可用，直接直接忽略跳转，用户体验降级
      return;
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
