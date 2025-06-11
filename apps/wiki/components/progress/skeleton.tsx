"use client";
import React, { useCallback, useRef } from "react";
import { m, LazyMotion, domAnimation } from "motion/react";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { flushSync } from "react-dom";

/**
 * Internal context for the skeleton wrapper.
 */
const SkeletonContext = createContext<ReturnType<
  typeof useSkeletonInternal
> | null>(null);

/**
 * Reads the skeleton context.
 */
function useSkeletonContext() {
  const skeleton = useContext(SkeletonContext);

  if (skeleton === null) {
    throw new Error(
      "Make sure to use `SkeletonProvider` before using the skeleton wrapper."
    );
  }

  return skeleton;
}

/**
 * Custom hook for managing skeleton state.
 * @returns An object containing the current state and functions to show and hide the skeleton.
 */
export function useSkeletonInternal() {
  const prevPathname = useRef<string | null>(null);
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // 使用 ref 来存储定时器和状态
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  // 路径变化的监听
  useEffect(() => {
    // console.log("useEffect() 路径变化: ", prevPathname.current, pathname);
    if (prevPathname.current && pathname !== prevPathname.current) {
      hide();
    }
    prevPathname.current = pathname;
  }, [pathname]);

  // 清理所有定时器的函数
  const clearAllTimers = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };

  /**
   * Show the skeleton.
   */
  function show(wait: number = 700) {
    // console.log("show() 开始显示骨架屏");

    // 清除所有现有定时器
    clearAllTimers();

    // 标记为加载中
    isLoadingRef.current = true;

    if (wait === 0) {
      setVisible(true);
      return;
    }

    // 等待700毫秒后显示骨架屏
    showTimerRef.current = setTimeout(() => {
      if (isLoadingRef.current) {
        // 检查是否还在加载中
        // console.log("700ms后显示骨架屏");
        setVisible(true);
      }
      showTimerRef.current = null;
    }, wait);
  }

  function showImmediately() {
    show(0);
  }

  /**
   * Hide the skeleton with animation.
   */
  const hide = useCallback(() => {
    // console.log("=== hide() 被调用 ===");

    // 停止加载状态，开始隐藏状态
    isLoadingRef.current = false;

    // 清除显示定时器（如果还在等待中）
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    // 隐藏
    setVisible(false);
  }, []);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  });

  useEffect(() => {
    const callback = (pageShowEvent: PageTransitionEvent) => {
      if (pageShowEvent.persisted) {
        hide();
      }
    };
    window?.addEventListener("pageshow", callback);
    return () => {
      window?.removeEventListener("pageshow", callback);
    };
  }, [hide]);

  return {
    visible,
    show,
    showImmediately,
    hide,
  };
}

/**
 * Provides the skeleton state to the child components.
 *
 * @param children - The child components to render.
 * @returns The rendered SkeletonContext.Provider component.
 */
export function SkeletonProvider({ children }: { children: ReactNode }) {
  const skeleton = useSkeletonInternal();
  return (
    <SkeletonContext.Provider value={skeleton}>
      {children}
    </SkeletonContext.Provider>
  );
}

/**
 * Skeleton item component using daisyUI classes.
 */
export function SkeletonItem({
  className = "",
  width,
  height,
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div
      className={`skeleton ${className}`}
      style={Object.keys(style).length > 0 ? style : undefined}
    />
  );
}

/**
 * Markdown document skeleton components
 */
export function MarkdownSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 标题骨架 */}
      <div className="skeleton h-8 w-3/4" />

      {/* 段落骨架 */}
      <div className="flex flex-col gap-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
      </div>

      {/* 子标题骨架 */}
      <div className="skeleton h-6 w-1/2 mt-4" />

      {/* 更多段落骨架 */}
      <div className="flex flex-col gap-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-4/5" />
      </div>

      {/* 代码块骨架 */}
      <div className="skeleton h-24 w-full mt-4" />

      {/* 列表骨架 */}
      <div className="flex flex-col gap-2 mt-4">
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-5/6" />
      </div>
    </div>
  );
}

/**
 * Article skeleton for blog posts or detailed content
 */
export function ArticleSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 文章标题 */}
      <div className="skeleton h-10 w-4/5" />

      {/* 元信息 */}
      <div className="flex items-center gap-4">
        <div className="skeleton h-10 w-10 rounded-full shrink-0" />
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-3 w-16" />
        </div>
      </div>

      {/* 特色图片 */}
      <div className="skeleton h-48 w-full" />

      {/* 文章内容 */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>

        <div className="skeleton h-6 w-1/2" />

        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-4/5" />
        </div>

        <div className="skeleton h-32 w-full"/>

        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-full"/>
          <div className="skeleton h-4 w-full"/>
          <div className="skeleton h-4 w-2/3"/>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple content skeleton for shorter content
 */
export function ContentSkeleton() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="skeleton h-6 w-2/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  );
}

/**
 * Skeleton wrapper component that shows/hides skeleton content.
 *
 * @param children - The actual content to show when not loading.
 * @param skeleton - The skeleton content to show when loading.
 * @param className - Additional CSS classes.
 * @returns The rendered skeleton wrapper component.
 */
export function SkeletonWrapper({
  children,
  skeleton,
  className = "",
}: {
  children: ReactNode;
  skeleton?: ReactNode;
  className?: string;
}) {
  const skeletonState = useSkeletonContext();

  // Default skeleton if none provided - use MarkdownSkeleton for markdown documents
  const defaultSkeleton = <MarkdownSkeleton />;

  return (
    <div className={`relative ${className}`}>
      {/* 内容层 - 始终渲染，作为布局基础 */}
      <div className={`${skeletonState.visible ? "invisible" : "visible"}`}>
        {children}
      </div>

      {/* 骨架屏层 - 绝对定位 */}
      <div
        className={`absolute inset-0 overflow-hidden ${
          skeletonState.visible ? "block" : "hidden"
        }`}
      >
        {skeleton || defaultSkeleton}
      </div>
    </div>
  );
}

type ShowSkeleton = () => void;
type HideSkeleton = () => void;

/**
 * A custom hook that returns functions to show and hide the skeleton.
 *
 * @returns An object with show and hide functions for the skeleton wrapper.
 */
export function useSkeleton(): {
  show: ShowSkeleton;
  hide: HideSkeleton;
  visible: boolean;
  showImmediately: ShowSkeleton;
} {
  const skeleton = useSkeletonContext();

  const showSkeleton: ShowSkeleton = () => {
    flushSync(() => {
      skeleton.show();
    });
  };

  const hideSkeleton: HideSkeleton = () => {
    skeleton.hide();
  };

  const showSkeletonImmediately: ShowSkeleton = () => {
    flushSync(() => {
      skeleton.showImmediately();
    });
  };

  return {
    show: showSkeleton,
    hide: hideSkeleton,
    showImmediately: showSkeletonImmediately,
    visible: skeleton.visible,
  };
}
