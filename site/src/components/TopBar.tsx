import React from 'react';
import styles from './TopBar.module.css';

type Section = 'About' | 'All' | 'Words' | 'Lines' | 'Motion' | 'Sound';

type TopBarProps = {
  sections: Section[];
  active?: Section | null;
  onSelect: (section: Section) => void;
  onToggleTheme?: () => void;
};

const TopBar: React.FC<TopBarProps> = ({ sections, active = null, onSelect, onToggleTheme }) => {
  return (
    <header className={styles.topBar}>
      <div className={styles.brand}>Maeve Devere</div>
      <nav className={styles.nav} aria-label="Sections">
        {sections.map((section) => (
          <button
            key={section}
            type="button"
            className={`btn pill ${styles.navButton} ${
              active === section ? styles.active : ''
            }`}
            onClick={() => onSelect(section)}
          >
            {section}
          </button>
        ))}
      </nav>
      <div className={styles.actions}>
        {onToggleTheme && (
          <button type="button" className={`btn pill ${styles.themeToggle}`} onClick={onToggleTheme}>
            Theme
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;


