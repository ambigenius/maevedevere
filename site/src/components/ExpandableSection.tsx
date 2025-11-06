import React from 'react';
import styles from './ExpandableSection.module.css';

type ExpandableSectionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  rightAdornment?: React.ReactNode; // e.g., a count or spinner
  children?: React.ReactNode;
};

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  isOpen,
  onToggle,
  rightAdornment,
  children,
}) => {
  const renderRightAdornment = () => {
    if (rightAdornment === undefined || rightAdornment === null) {
      return null;
    }

    if (typeof rightAdornment === 'number' || typeof rightAdornment === 'string') {
      return <span className={`badge ${styles.count}`}>{rightAdornment}</span>;
    }

    return <span className={styles.rightAdornment}>{rightAdornment}</span>;
  };

  return (
    <div className={styles.container}>
      <button
        className={styles.header}
        onClick={onToggle}
        type="button"
        aria-expanded={isOpen}
      >
        <span
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
          aria-hidden="true"
        >
          ▸
        </span>
        <span className={styles.title}>{title}</span>
        {renderRightAdornment()}
      </button>
      <div className={`${styles.content} ${isOpen ? styles.contentOpen : ''}`}>
        {isOpen && children && (
          <div className={styles.children}>{children}</div>
        )}
      </div>
    </div>
  );
};

export default ExpandableSection;

