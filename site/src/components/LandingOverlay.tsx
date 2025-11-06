import React from 'react';
import styles from './LandingOverlay.module.css';

type Props = {
  sections: string[];
  onPick: (s: string) => void;
  visible: boolean;
};

export default function LandingOverlay({ sections, onPick, visible }: Props) {
  if (!visible) return null;

  return (
    <div className={styles.overlay} aria-hidden={!visible}>
      <div className={styles.words}>
        {sections.map((s) => (
          <button key={s} className={styles.word} onClick={() => onPick(s)}>
            <span className={styles.initial}>{s[0]}</span>
            <span className={styles.rest}>{s.slice(1)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


