import type { ShortCodeCompProps } from "../types";
import styles from '../css/UserTag.module.css';

export default function Neg({ attrs }: ShortCodeCompProps) {
  const text = attrs?.[0] || "";
  
  return <span className={`${styles.userTag} ${styles.negative}`}>{text}</span>;
} 