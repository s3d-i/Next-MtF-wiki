'use client';
import { useIsClient } from 'foxact/use-is-client';
import { useTheme } from 'next-themes';
import { type FC, cache, memo, use } from 'react';

interface SuggestionBoxProps {
  attachImageButtonText?: string | undefined;
  sendButtonText?: string | undefined;
  sendingButtonText?: string | undefined;
  sentSuccessButtonText?: string | undefined;
  sentFailedButtonText?: string | undefined;
  targetUrl?: string | undefined;
  textContentPlaceholder?: string | undefined;
  contactContentPlaceholder?: string | undefined;
  style?: Record<string, string>;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'suggestion-box': SuggestionBoxProps & HTMLAttributes<HTMLElement>;
    }
  }
}

const loadSuggestionBox = async () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  import('@project-trans/suggestion-box/aio');
};

const suggestionBoxPromise = cache(loadSuggestionBox)();

const SuggestionBox_: FC<SuggestionBoxProps> = (props) => {
  const isClient = useIsClient();
  if (isClient) use(suggestionBoxPromise);
  const { resolvedTheme } = useTheme();
  if (!isClient)
    return (
      <div className="skeleton h-45 text-center flex items-center justify-center">
        <noscript>
          <p>提问箱需要运行 JavaScript 以加载。</p>
          <p>Suggestion Box requires JavaScript to load.</p>
        </noscript>
      </div>
    );
  return (
    <suggestion-box
      {...props}
      className={resolvedTheme === 'dark' ? 'dark' : ''}
      style={{
        '--c-action-bg-light': 'var(--color-base-200)',
        '--c-textarea-bg-light': 'var(--color-base-100)',
        '--c-contact-bg-light': 'var(--color-base-100)',
      }}
      targetUrl="https://suggestion-box.project-trans.org/api/v1/suggestion"
    />
  );
};

const SuggestionBox = memo(SuggestionBox_, () => true);

export default SuggestionBox;
