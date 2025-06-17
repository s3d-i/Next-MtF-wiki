'use client';

import { atom, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';

export interface ObservedHeaderProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

export function ObservedHeader({ children, ...props }: ObservedHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [, setHeaderHeight] = useAtom(headerHeightAtom);

  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const style = window.getComputedStyle(headerRef.current);
        if (style.position === 'sticky') {
          setHeaderHeight(headerRef.current.offsetHeight);
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
