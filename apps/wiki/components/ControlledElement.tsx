'use client';

import { headerHeightAtom } from '@/components/ObservedHeader';
import { useAtom } from 'jotai';
import { type JSX, createElement } from 'react';
import { Link, type LinkProps } from './progress';

export function ControlledElement({
  tagName,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  tagName: keyof JSX.IntrinsicElements;
}) {
  if (props.id) {
    return (
      <ControlledElementInner tagName={tagName} {...props}>
        {children}
      </ControlledElementInner>
    );
  } else {
    return createElement(tagName, props, children);
  }
}

function ControlledElementInner({
  tagName,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  tagName: keyof JSX.IntrinsicElements;
}) {
  const [headerHeight] = useAtom(headerHeightAtom);
  return createElement(
    tagName,
    { ...props, style: { scrollMarginTop: `${headerHeight}px` } },
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
