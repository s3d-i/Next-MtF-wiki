'use client';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useProgress } from './context';
import { formatUrl } from './format-url';
import { useSkeleton } from './skeleton';

export interface LinkProps extends React.ComponentProps<typeof NextLink> {
  showSkeletonImmediately?: boolean;
}
/**
 * A custom Link component that wraps Next.js's next/link component.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(
    { href, children, replace, scroll, showSkeletonImmediately, ...rest },
    ref,
  ) {
    const router = useRouter();
    const { start } = useProgress();
    const { show: showSkeleton, showImmediately: showSkeletonImmediatelyFn } =
      useSkeleton();

    return (
      <NextLink
        ref={ref}
        href={href}
        onNavigate={(e) => {
          const url = typeof href === 'string' ? href : formatUrl(href as any);

          e.preventDefault();

          start(url);

          if (showSkeletonImmediately) {
            showSkeletonImmediatelyFn(url);
          } else {
            showSkeleton(url);
          }

          if (replace) {
            router.replace(url, { scroll });
          } else {
            router.push(url, { scroll });
          }
        }}
        {...rest}
      >
        {children}
      </NextLink>
    );
  },
);
