'use client';

import { useState } from 'react';
import type { ShortCodeCompProps } from "./types";
import styles from './css/Expand.module.css';

export default function Expand({ attrs, children }: ShortCodeCompProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const title = attrs?.[0] || "展开";

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.expand}>
      <button 
        type="button" 
        className={styles.expandButton}
        aria-label="Expand Button"
        onClick={toggleExpand}
        aria-expanded={isExpanded}
      >
        <span className={`${styles.expandIcon} ${isExpanded ? styles.expandIconDown : styles.expandIconRight}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path 
              d="M9 6L15 12L9 18" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {title}
      </button>
      <div className={`${styles.expandContent} ${isExpanded ? styles.expandContentVisible : ''}`}>
        {children}
      </div>
    </div>
  );
} 