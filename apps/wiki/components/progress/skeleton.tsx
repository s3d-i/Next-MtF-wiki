"use client";
import React from 'react'
import {
    m,
    LazyMotion,
    domAnimation,
} from "motion/react";
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
    startTransition,
} from "react";

/**
 * Internal context for the skeleton wrapper.
 */
const SkeletonContext = createContext<ReturnType<typeof useSkeletonInternal> | null>(
    null
);

/**
 * Reads the skeleton context.
 */
function useSkeletonContext() {
    const skeleton = useContext(SkeletonContext);

    if (skeleton === null) {
        throw new Error("Make sure to use `SkeletonProvider` before using the skeleton wrapper.");
    }

    return skeleton;
}

/**
 * Custom hook for managing skeleton state.
 * @returns An object containing the current state and functions to show and hide the skeleton.
 */
export function useSkeletonInternal() {
    const [baseState, setBaseState] = useState({ 
        loading: false, 
        hiding: false,
        visible: false
    });

    // Handle delayed visibility - only show if loading takes longer than 200ms
    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        if (baseState.loading && !baseState.hiding) {
            timer = setTimeout(() => {
                setBaseState(prev => ({ ...prev, visible: true }));
            }, 700); // delay before showing
        } else if (!baseState.loading) {
            setBaseState(prev => ({ ...prev, visible: false }));
        }
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [baseState.loading, baseState.hiding]);

    // Handle hiding animation - similar to progress context
    useEffect(() => {
        if (baseState.hiding) {
            // After animation completes, fully hide the skeleton
            const timer = setTimeout(() => {
                setBaseState({ loading: false, hiding: false, visible: false });
            }, 100); // Match animation duration
            
            return () => clearTimeout(timer);
        }
    }, [baseState.hiding]);

    /**
     * Show the skeleton.
     */
    function show() {
        setBaseState({ loading: true, hiding: false, visible: false });
    }

    /**
     * Hide the skeleton with animation.
     */
    function hide() {
        startTransition(() => {
            setBaseState(prev => ({
                ...prev,
                hiding: true
            }));
        });
    }

    return { 
        loading: baseState.loading,
        hiding: baseState.hiding,
        visible: baseState.visible,
        show, 
        hide 
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
    return <SkeletonContext.Provider value={skeleton}>{children}</SkeletonContext.Provider>;
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
            <div className="skeleton h-8 w-3/4"></div>
            
            {/* 段落骨架 */}
            <div className="flex flex-col gap-2">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-2/3"></div>
            </div>

            {/* 子标题骨架 */}
            <div className="skeleton h-6 w-1/2 mt-4"></div>
            
            {/* 更多段落骨架 */}
            <div className="flex flex-col gap-2">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-5/6"></div>
                <div className="skeleton h-4 w-4/5"></div>
            </div>

            {/* 代码块骨架 */}
            <div className="skeleton h-24 w-full mt-4"></div>

            {/* 列表骨架 */}
            <div className="flex flex-col gap-2 mt-4">
                <div className="skeleton h-4 w-4/5"></div>
                <div className="skeleton h-4 w-3/4"></div>
                <div className="skeleton h-4 w-5/6"></div>
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
            <div className="skeleton h-10 w-4/5"></div>
            
            {/* 元信息 */}
            <div className="flex items-center gap-4">
                <div className="skeleton h-10 w-10 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-2">
                    <div className="skeleton h-4 w-20"></div>
                    <div className="skeleton h-3 w-16"></div>
                </div>
            </div>

            {/* 特色图片 */}
            <div className="skeleton h-48 w-full"></div>

            {/* 文章内容 */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-3/4"></div>
                </div>

                <div className="skeleton h-6 w-1/2"></div>

                <div className="flex flex-col gap-2">
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-5/6"></div>
                    <div className="skeleton h-4 w-4/5"></div>
                </div>

                <div className="skeleton h-32 w-full"></div>

                <div className="flex flex-col gap-2">
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-2/3"></div>
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
            <div className="skeleton h-6 w-2/3"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-1/2"></div>
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
        <LazyMotion features={domAnimation}>
            <div className={`relative ${className}`}>
                {/* 骨架屏层 - 绝对定位覆盖在内容上方 */}
                <m.div
                    className="absolute inset-0 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: (skeletonState.loading && skeletonState.visible && !skeletonState.hiding) ? 1 : 0,
                        display: (skeletonState.loading && skeletonState.visible) ? "block" : "none"
                    }}
                    transition={{ duration: 0.1 }}
                >
                    {skeleton || defaultSkeleton}
                </m.div>
                
                {/* 内容层 - 始终在 DOM 中 */}
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: (skeletonState.loading && skeletonState.visible) ? 0 : 1 
                    }}
                    transition={{ duration: 0.1 }}
                >
                    {children}
                </m.div>
            </div>
        </LazyMotion>
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
    loading: boolean; 
    hiding: boolean;
    visible: boolean;
} {
    const skeleton = useSkeletonContext();

    const showSkeleton: ShowSkeleton = () => {
        skeleton.show();
    };

    const hideSkeleton: HideSkeleton = () => {
        skeleton.hide();
    };

    return { 
        show: showSkeleton, 
        hide: hideSkeleton, 
        loading: skeleton.loading, 
        hiding: skeleton.hiding,
        visible: skeleton.visible
    };
} 