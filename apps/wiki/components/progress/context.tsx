"use client";
import React from 'react'
import {
    useMotionTemplate,
    useSpring,
    m,
    LazyMotion,
    domAnimation,
} from "motion/react";
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useRef,
    startTransition,
    useState,
} from "react";

/**
 * Internal context for the progress bar.
 */
const ProgressContext = createContext<ReturnType<typeof useProgressInternal> | null>(
    null
);

/**
 * Reads the progress bar context.
 */
function useProgressBarContext() {
    const progress = useContext(ProgressContext);

    if (progress === null) {
        throw new Error("Make sure to use `ProgressBarProvider` before using the progress bar.");
    }

    return progress;
}

function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * This function calculates a difference (`diff`) based on the input number (`current`).
 * 
 * - If `current` is exactly 0, `diff` is set to 15.
 * - If `current` is less than 50 (but not 0), `diff` is set to a random number between 1 and 10.
 * - If `current` is 50 or more, `diff` is set to a random number between 1 and 5.
 */
function getDiff(
    /** The current number used to calculate the difference. */
    current: number): number {
    let diff;
    if (current === 0) {
        diff = 15;
    } else if (current < 50) {
        diff = random(1, 10);
    } else {
        diff = random(1, 5);
    }

    return diff
}

/**
 * Custom hook for managing progress state and animation.
 * @returns An object containing the current state, spring animation, and functions to start and complete the progress.
 */
export function useProgressInternal() {
    const [baseState, setBaseState] = useState({ loading: false, completing: false, visible: false })

    const spring = useSpring(0, {
        damping: 25,
        mass: 0.5,
        stiffness: 300,
        restDelta: 0.1,
    });

    useInterval(
        () => {
            // If we start progress but the bar is currently complete, reset it first.
            if (spring.get() === 100) {
                spring.jump(0);
            }

            const current = spring.get();
            spring.set(Math.min(current + getDiff(current), 99));
        },
        baseState.loading && !baseState.completing ? 750 : null
    );

    // Handle delayed visibility - only show if loading takes longer than 200ms
    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        if (baseState.loading && !baseState.completing) {
            timer = setTimeout(() => {
                setBaseState(prev => ({ ...prev, visible: true }));
            }, 700); // delay before showing
        } else if (!baseState.loading) {
            setBaseState(prev => ({ ...prev, visible: false }));
        }
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [baseState.loading, baseState.completing]);

    useEffect(() => {
        if (!baseState.loading && !baseState.completing) {
            spring.jump(0);
        }
    }, [spring, baseState.loading, baseState.completing]);

    // Handle completion animation
    useEffect(() => {
        if (baseState.completing) {
            // Quickly animate to 100%
            spring.set(100);
            
            // After a short delay, hide the progress bar
            const timer = setTimeout(() => {
                setBaseState({ loading: false, completing: false, visible: false });
            }, 300); // 300ms delay to show the completed state
            
            return () => clearTimeout(timer);
        }
    }, [baseState.completing, spring]);

    /**
     * Start the progress.
     */
    function start() {
        // console.log("=== start() 被调用 ===");
        // console.log("调用前状态:", baseState);
        setBaseState({ loading: true, completing: false, visible: false });
        // console.log("start() 设置新状态: { loading: true, completing: false, visible: false }");
    }

    /**
     * Complete the progress by animating to 100% then hiding.
     */
    function complete() {
        // console.log("=== complete() 被调用 ===");
        // console.log("当前状态:", baseState);
        
        // 移除条件检查，直接设置completing为true
        // 因为React状态更新是异步的，baseState.loading可能还没更新
        startTransition(() => {
            setBaseState(prev => {
                // console.log("complete() 当前状态:", prev);
                const newState = { ...prev, completing: true };
                // console.log("complete() 设置新状态:", newState);
                return newState;
            });
        });
    }

    return { 
        loading: baseState.loading, 
        completing: baseState.completing,
        visible: baseState.visible,
        spring, 
        start, 
        complete 
    };
}

/**
 * Custom hook that sets up an interval to call the provided callback function.
 *
 * @param callback - The function to be called at each interval.
 * @param delay - The delay (in milliseconds) between each interval. Pass `null` to stop the interval.
 */
function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            savedCallback.current();
        }

        if (delay !== null) {
            tick();

            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

/**
 * Provides the progress value to the child components.
 *
 * @param children - The child components to render.
 * @returns The rendered ProgressBarContext.Provider component.
 */
export function ProgressBarProvider({ children }: { children: ReactNode }) {
    const progress = useProgressInternal()
    return <ProgressContext.Provider value={progress}>{children}</ProgressContext.Provider>;
}

/**
 * Renders a progress bar component.
 *
 * @param className - The CSS class name for the progress bar.
 * @returns The rendered progress bar component.
 */
export function ProgressBar({
    className,
}: {
    className?: string;
}) {
    const progress = useProgressBarContext();
    const width = useMotionTemplate`${progress.spring}%`;

    return (
        <LazyMotion features={domAnimation}>
            {progress.loading && progress.visible && (
                <m.div
                    style={{ width }}
                    exit={{ opacity: 0 }}
                    className={className}
                />
            )}
        </LazyMotion>
    );
}

type StartProgress = () => void
type CompleteProgress = () => void

/**
 * A custom hook that returns functions to start and complete the progress.
 *
 * @returns An object with start and complete functions for the progress bar.
 */
export function useProgress(): { start: StartProgress; complete: CompleteProgress; loading: boolean; completing: boolean; visible: boolean } {
    const progress = useProgressBarContext();

    const startProgress: StartProgress = () => {
        progress.start();
    }

    const completeProgress: CompleteProgress = () => {
        progress.complete();
    }

    return { start: startProgress, complete: completeProgress, loading: progress.loading, completing: progress.completing, visible: progress.visible }
}