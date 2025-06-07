"use client"
import React, { startTransition } from 'react'
import { useEffect, useRef, useTransition } from "react";
import NextLink from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useProgress } from "./context";
import { useSkeleton } from "./skeleton";
import { formatUrl } from './format-url';


// Copied from  https://github.com/vercel/next.js/blob/canary/packages/next/src/client/link.tsx#L180-L191
function isModifiedEvent(event: React.MouseEvent): boolean {
    const eventTarget = event.currentTarget as HTMLAnchorElement | SVGAElement;
    const target = eventTarget.getAttribute("target");
    return (
        (target && target !== "_self") ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey || // triggers resource download
        (event.nativeEvent && event.nativeEvent.which === 2)
    );
}

/**
 * A custom Link component that wraps Next.js's next/link component.
 */
export const Link = React.forwardRef<HTMLAnchorElement, Parameters<typeof NextLink>[0]>(function Link({
    href,
    children,
    replace,
    scroll,
    ...rest
}, ref) {
    const router = useRouter();
    const { start, complete } = useProgress();
    const { show: showSkeleton, hide: hideSkeleton } = useSkeleton();

    return (
        <NextLink
            ref={ref}
            href={href}
            onClick={(e) => {
                if (isModifiedEvent(e)) return;
                e.preventDefault();
                
                const url = typeof href === 'string' ? href : formatUrl(href as any);
                
                // 检查是否是文档页面路径
                const isDocsPage = url.includes('/docs/');
                
                // console.log("=== Link 点击事件 ===");
                // console.log("目标 href:", href);
                // console.log("当前 pathname:", pathname);
                
                // 启动进度条
                start();
                
                // 如果是文档页面，同时显示骨架屏
                if (isDocsPage) {
                    showSkeleton();
                }
                
                // 然后在单独的 transition 中执行路由导航
                startTransition(() => {
                    // console.log("准备导航到:", url);
                    if (replace) {
                        router.replace(url, { scroll })
                    } else {
                        router.push(url, { scroll })
                    }
                    
                    // 确保路由完成后再隐藏
                    startTransition(() => {
                        // 同时完成进度条和隐藏骨架屏
                        complete();
                        if (isDocsPage) {
                            hideSkeleton();
                        }
                    });
                })
            }}
            {...rest}
        >
            {children}
        </NextLink>
    );
})