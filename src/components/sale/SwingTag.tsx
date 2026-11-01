import type { ReactNode } from 'react';
import styles from './sale.module.css';

interface SwingTagProps {
  value: ReactNode;
  label?: string;
  note?: ReactNode;
  size?: 'card' | 'product' | 'hero' | 'chip';
  rotate?: number;
  className?: string;
}

// The caller positions it (absolute or relative) and decides when it shows.
export function SwingTag({ value, label, note, size = 'card', rotate = -5, className = '' }: SwingTagProps) {
  return (
    <div
      className={`${styles.tag} ${styles[size]} ${className}`}
      style={{ '--tag-rotate': `${rotate}deg` } as React.CSSProperties}
    >
      {size !== 'chip' && (
        <svg className={styles.string} viewBox="0 0 30 56" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M8 56 C26 40 2 22 24 2"
            fill="none"
            stroke="#545454"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      {label && <span className={styles.label}>{label}</span>}
      <span className={styles.value}>{value}</span>
      {note && <span className={styles.note}>{note}</span>}
    </div>
  );
}

export const saleLayout = { heroRoom: styles.heroRoom, productRoom: styles.productRoom };
