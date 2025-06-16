import { LocalImage } from '../LocalImage';
import { type GalleryImage, getGalleryImages } from './galleryUtils';
import type { ShortCodeCompProps } from './types';

interface GalleryProps extends ShortCodeCompProps {
  pattern?: string;
}

export default function Gallery({ attrs, mdContext }: GalleryProps) {
  const pattern = attrs?.[0] || '';
  const { currentLanguage, realCurrentSlug } = mdContext || {};

  // 在SSG时获取匹配的图片
  const images = getGalleryImages(currentLanguage!, realCurrentSlug!, pattern);

  if (images.length === 0) {
    return (
      <section className="flex overflow-x-auto px-4 gap-4">
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-600">
          <p>Gallery: {pattern}</p>
          <p>未找到匹配的图片</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex overflow-x-auto px-4 gap-4">
      {images.map((image: GalleryImage) => (
        <LocalImage
          key={image.name}
          src={image.path}
          alt={image.alt || `Gallery image ${image.name}`}
          language={currentLanguage || undefined}
          className="rounded-2xl"
        />
      ))}
    </section>
  );
}
