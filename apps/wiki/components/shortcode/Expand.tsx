'use client';

import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { ShortCodeCompProps } from './types';

export default function Expand({ attrs, children }: ShortCodeCompProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const title = attrs?.[0] || '展开';

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="my-4 border-2 border-gray-400 rounded-md overflow-hidden">
      <button
        type="button"
        className="w-full py-3 px-4 bg-base-100 border-none flex items-center cursor-pointer text-base font-medium text-left transition-colors duration-200 hover:bg-neutral hover:text-neutral-content"
        aria-label="Expand Button"
        onClick={toggleExpand}
        aria-expanded={isExpanded}
      >
        <span
          className={`mr-2 transition-transform duration-200 flex items-center ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
        >
          <ChevronRight />
        </span>
        {title}
      </button>
      <div className={`p-4 ${isExpanded ? 'block' : 'hidden'}`}>{children}</div>
    </div>
  );
}
