"use client";
import React, { startTransition } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useProgress } from "./context";
import { useSkeleton } from "./skeleton";
import { formatUrl } from "./format-url";
/**
 * A custom Link component that wraps Next.js's next/link component.
 */
export const Link = React.forwardRef<
  HTMLAnchorElement,
  Parameters<typeof NextLink>[0]
>(function Link({ href, children, replace, scroll, ...rest }, ref) {
  const router = useRouter();
  const { start, complete } = useProgress();
  const { show: showSkeleton, hide: hideSkeleton } = useSkeleton();

  return (
    <NextLink
      ref={ref}
      href={href}
      onNavigate={(e) => {
        const url = typeof href === "string" ? href : formatUrl(href as any);

        // 启动进度条
        start();

        // 检查是否是文档页面路径
        const isDocsPage = url.includes("/docs/");

        // 如果是文档页面，同时显示骨架屏
        if (isDocsPage) {
          showSkeleton();
        }

        // 然后在单独的 transition 中执行路由导航
        startTransition(() => {
          // console.log("准备导航到:", url);
          if (replace) {
            router.replace(url, { scroll });
          } else {
            router.push(url, { scroll });
          }

          // 确保路由完成后再隐藏
          startTransition(() => {
            // 同时完成进度条和隐藏骨架屏
            complete();
            if (isDocsPage) {
              hideSkeleton();
            }
          });
        });

        e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </NextLink>
  );
});
