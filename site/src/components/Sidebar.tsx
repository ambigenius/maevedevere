import React, { useCallback, useMemo, useState } from 'react';
import styles from './Sidebar.module.css';

type Section = 'About' | 'All' | 'Words' | 'Lines' | 'Motion' | 'Sound';

type SidebarProps = {
  active?: Section | null;
  onSelect: (section: Section) => void;
};

const orderedSections: Section[] = ['About', 'All', 'Words', 'Lines', 'Motion', 'Sound'];

export default function Sidebar({ active = null, onSelect }: SidebarProps) {
  const [overSidebar, setOverSidebar] = useState(false);
  const [overOverlay, setOverOverlay] = useState(false);
  const [sidebarFocused, setSidebarFocused] = useState(false);

  const visible = overSidebar || overOverlay || sidebarFocused;

  const initials = useMemo(() => orderedSections.map(s => s[0]), []);

  const handleFocusIn = useCallback(() => {
    setSidebarFocused(true);
  }, []);

  const handleFocusOut = useCallback<React.FocusEventHandler<HTMLDivElement>>((e) => {
    // If focus moves outside the sidebar, hide focus state
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setSidebarFocused(false);
    }
  }, []);

  return (
    <>
      <aside
        className={styles.sidebar}
        onMouseEnter={() => setOverSidebar(true)}
        onMouseLeave={() => setOverSidebar(false)}
        onFocusCapture={handleFocusIn}
        onBlurCapture={handleFocusOut}
      >
        <div className={styles.iconCol}>
          {orderedSections.map((section, idx) => (
            <button
              key={section}
              type="button"
              className={active === section ? `${styles.initial} ${styles.active}` : styles.initial}
              aria-label={section}
              onClick={() => onSelect(section)}
            >
              {initials[idx]}
            </button>
          ))}
        </div>
      </aside>

      <div
        className={visible ? `${styles.overlay} ${styles.overlayVisible}` : styles.overlay}
        onMouseEnter={() => setOverOverlay(true)}
        onMouseLeave={() => setOverOverlay(false)}
        aria-hidden={!visible}
      >
        <div className={styles.wordList}>
          {orderedSections.map((section) => (
            <button
              key={section}
              type="button"
              className={styles.word}
              onClick={() => onSelect(section)}
            >
              {section}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}


