'use client';
import { Link } from '@/components/progress';
import { useEffect, useRef } from 'react';

export default function RedirectClient({
  href,
  altText,
}: {
  href: string;
  altText: string;
}) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const isRedirecting = useRef(false);
  useEffect(() => {
    if (linkRef.current && !isRedirecting.current) {
      requestAnimationFrame(() => {
        if (linkRef.current) {
          linkRef.current.click();
        }
      });
      isRedirecting.current = true;
    }
  });

  return (
    <Link
      ref={linkRef}
      href={href}
      showSkeletonImmediately={true}
      className="link"
    >
      {altText}
    </Link>
  );
}
