import type { ShortCodeCompProps } from "./types";
import styles from './css/DoctorImage.module.css';
import { getLocalImagePathFromMdContext } from "./utils";

export default function DoctorImage({ attrs, mdContext }: ShortCodeCompProps) {
  // 在Next.js中，我们无法直接匹配Hugo的Resources功能
  // 这里提供一个基础实现
  const src = attrs?.[0] || "";

  const imagePath = getLocalImagePathFromMdContext(src, mdContext);
  
  return (
    <img 
      src={imagePath} 
      alt="医生照片"
      className={styles.doctorImage}
      loading="lazy"
      decoding="async"
    />
  );
} 