'use client';

import { headerHeightAtom } from '@/components/ObservedHeader';
import { useAtom } from 'jotai';
import { type JSX, createElement } from 'react';

type HeadingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
> & {
  level: 1 | 2 | 3 | 4 | 5 | 6;
};

export default function Heading({ level, children, ...props }: HeadingProps) {
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
