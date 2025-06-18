'use client';

import { headerHeightAtom } from '@/components/ObservedHeader';
import { useAtom } from 'jotai';
import { type AnchorHTMLAttributes, type JSX, createElement } from 'react';
import { Link, type LinkProps } from './progress';

type HeadingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & {
  level: 1 | 2 | 3 | 4 | 5 | 6;
};

export function ControlledHeading({ level, children, ...props }: HeadingProps) {
  const [headerHeight] = useAtom(headerHeightAtom);

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return createElement(
    Tag,
    {
      ...props,
      style: {
        scrollMarginTop: `${headerHeight}px`,
      },
    },
    children,
  );
}

function ControlledLinkInner({ children, ...props }: LinkProps) {
  const [headerHeight] = useAtom(headerHeightAtom);

  return (
    <Link {...props} style={{ scrollMarginTop: `${headerHeight}px` }}>
      {children}
    </Link>
  );
}

export function ControlledLink({ id, children, ...props }: LinkProps) {
  if (id) {
    return (
      <ControlledLinkInner id={id} {...props}>
        {children}
      </ControlledLinkInner>
    );
  } else {
    return <Link {...props}>{children}</Link>;
  }
}

function ControlledAnchorInner({
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const [headerHeight] = useAtom(headerHeightAtom);

  return (
    <a {...props} style={{ scrollMarginTop: `${headerHeight}px` }}>
      {children}
    </a>
  );
}

export function ControlledAnchor({
  id,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (id) {
    return (
      <ControlledAnchorInner id={id} {...props}>
        {children}
      </ControlledAnchorInner>
    );
  } else {
    return <a {...props}>{children}</a>;
  }
}
