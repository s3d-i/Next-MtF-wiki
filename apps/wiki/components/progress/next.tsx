"use client";
import React, { startTransition, useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useProgress } from "./context";
import { useSkeleton } from "./skeleton";
import { formatUrl } from "./format-url";

interface LinkProps extends React.ComponentProps<typeof NextLink> {
  showSkeletonImmediately?: boolean;
}
/**
 * A custom Link component that wraps Next.js's next/link component.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  function Link(
    { href, children, replace, scroll, showSkeletonImmediately, ...rest },
    ref
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
          const url = typeof href === "string" ? href : formatUrl(href as any);

          e.preventDefault();

          start();

          if (showSkeletonImmediately) {
            showSkeletonImmediatelyFn();
          } else {
            showSkeleton();
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
  }
);
