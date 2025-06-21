'use client';

import { atom, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

export interface ObservedHeaderProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

export function ObservedHeader({ children, ...props }: ObservedHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);
  const [, setHeaderHeight] = useAtom(headerHeightAtom);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const style = window.getComputedStyle(headerRef.current);
        if (style.position === 'sticky') {
          let hasSet = false;
          if (firstLoad.current) {
            firstLoad.current = false;
            if (
              window.location.hash.startsWith('#') &&
              window.location.hash.length > 1
            ) {
              const targetElement = document.getElementById(
                window.location.hash.slice(1),
              );
              if (targetElement) {
                requestAnimationFrame(() => {
                  flushSync(() => {
                    if (headerRef.current) {
                      setHeaderHeight(headerRef.current.offsetHeight);
                    }
                  });
                  targetElement.scrollIntoView({ behavior: 'instant' }); // rescroll to the target element
                });
                hasSet = true;
              }
            }
          }
          if (!hasSet) {
            setHeaderHeight(headerRef.current.offsetHeight);
          }
        } else {
          setHeaderHeight(0);
        }
      } else {
        setHeaderHeight(0);
      }
    };

    updateHeight();

    // 监听窗口大小变化，可能会影响 header 高度
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      setHeaderHeight(0);
    };
  }, [setHeaderHeight]);

  return (
    <header ref={headerRef} {...props}>
      {children}
    </header>
  );
}

export const headerHeightAtom = atom<number>(0);
