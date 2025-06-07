import type { ShortCodeCompProps } from "./types";
import styles from './css/Watermark.module.css';
import { getLocalImagePath } from '@/app/[language]/docs/path-utils';

export default function Watermark({ attrs, mdContext }: ShortCodeCompProps) {
  const src = attrs?.[0] || "";
  const alt = attrs?.[1] || "";
  const { currentLanguage, currentSlug } = mdContext || {};
  const imagePath = getLocalImagePath(currentLanguage!, currentSlug!, src, mdContext?.isCurrentSlugIndex || false) || src;

  return (
    <div className={styles.watermark}>
      <img src={imagePath} alt={alt} />
    </div>
  );
} 