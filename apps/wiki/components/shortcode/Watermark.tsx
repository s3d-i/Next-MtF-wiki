import { getLocalImagePath } from '@/service/path-utils';
import { LocalImage } from '../LocalImage';
import type { ShortCodeCompProps } from './types';

export default function Watermark({ attrs, mdContext }: ShortCodeCompProps) {
  const src = attrs?.[0] || '';
  const alt = attrs?.[1] || '';
  const { currentLanguage, realCurrentSlug } = mdContext || {};
  const imagePath =
    getLocalImagePath(
      currentLanguage!,
      realCurrentSlug!,
      src,
      mdContext?.isCurrentSlugIndex || false,
    ) || src;

  return (
    <div className="relative overflow-hidden">
      <LocalImage src={imagePath} alt={alt} />
      <div className="absolute top-0 left-0 text-blue-600 text-center self-center opacity-30 pointer-events-none flex items-center justify-center w-full h-full">
        <span className="text-5xl -rotate-45">仅供参考，勿作他用。</span>
      </div>
    </div>
  );
}
