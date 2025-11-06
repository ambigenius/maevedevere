import React from 'react';
import styles from './Hero.module.css';

type HeroProps = {
  onAbout: () => void;
  onExplore: () => void;
};

const Hero: React.FC<HeroProps> = ({ onAbout, onExplore }) => {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <p className={styles.overline}>Writer • Designer • Storyteller</p>
        <h1 className={styles.title}>Maeve Devere</h1>
        <p className={styles.blurb}>
          Essays, poems, lines, motion, and sound exploring light, place, and memory.
        </p>
        <div className={styles.actions}>
          <button type="button" className={`btn pill ${styles.primary}`} onClick={onAbout}>
            About
          </button>
          <button type="button" className={`btn pill ${styles.secondary}`} onClick={onExplore}>
            Explore All
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;


