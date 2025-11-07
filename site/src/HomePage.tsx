import React, { useState } from 'react';
import type { Section } from './types/content.ts';
import usePosts from './hooks/usePosts.ts';
import { useAbout } from './hooks/usePosts.ts';
import ExpandableSection from './components/ExpandableSection.tsx';
import PostStack from './components/PostStack.tsx';
import ReactMarkdown from 'react-markdown';
import './App.css';
import styles from './HomePage.module.css';

function HomePage() {
  const [expandedSection, setExpandedSection] = useState<Section | null>(null);

  // Fetch posts for each section when expanded
  const allPosts = usePosts('All');
  const wordsPosts = usePosts('Words');
  const linesPosts = usePosts('Lines');
  const motionPosts = usePosts('Motion');
  const soundPosts = usePosts('Sound');
  const aboutData = useAbout();

  // Handle section toggle
  const handleSectionToggle = (section: Section) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // ESC key handler to close PostDetail
  // useEffect(() => { // This effect is no longer needed
  //   const handleEscKey = (event: KeyboardEvent) => {
  //     if (event.key === 'Escape' && openedPost) {
  //       handlePostClose();
  //     }
  //   };

  //   window.addEventListener('keydown', handleEscKey);
  //   return () => {
  //     window.removeEventListener('keydown', handleEscKey);
  //   };
  // }, [openedPost]);

  // Get data for the current section
  const getSectionData = (section: Section) => {
    switch (section) {
      case 'All':
        return allPosts;
      case 'Words':
        return wordsPosts;
      case 'Lines':
        return linesPosts;
      case 'Motion':
        return motionPosts;
      case 'Sound':
        return soundPosts;
      default:
        return null;
    }
  };

  // Get right adornment for section (loading or count)
  const getRightAdornment = (section: Section) => {
    if (section === 'About') {
      if (aboutData.loading) return <span className={styles.loading}>Loading...</span>;
      if (aboutData.error) return <span className={styles.error}>Error</span>;
      return null;
    }

    const sectionData = getSectionData(section);
    if (!sectionData) return null;

    if (sectionData.loading) {
      return <span className={styles.loading}>Loading...</span>;
    }
    if (sectionData.error) {
      return <span className={styles.error}>Error</span>;
    }
    return <span className={styles.count}>({sectionData.posts.length})</span>;
  };

  const sections: Section[] = ['About', 'All', 'Words', 'Lines', 'Motion', 'Sound'];

  return (
    <div className="App">
      {/* Navbar */}
      <nav className={styles.navbar}>
        {sections.map((section) => (
          <button
            key={section}
            className={`${styles.navButton} ${
              expandedSection === section ? styles.navButtonActive : ''
            }`}
            onClick={() => handleSectionToggle(section)}
          >
            {section}
          </button>
        ))}
      </nav>

      <main className={styles.main}>
        {/* About Section */}
        {expandedSection === 'About' && (
          <ExpandableSection
            title="About"
            isOpen={true}
            onToggle={() => handleSectionToggle('About')}
            rightAdornment={getRightAdornment('About')}
          >
            {aboutData.loading && (
              <div className={styles.loadingContainer}>Loading about...</div>
            )}
            {aboutData.error && (
              <div className={styles.errorContainer}>
                Error loading about: {aboutData.error}
              </div>
            )}
            {aboutData.about && (
              <div className={styles.aboutContent}>
                <ReactMarkdown className={styles.markdown}>
                  {aboutData.about.text}
                </ReactMarkdown>
              </div>
            )}
          </ExpandableSection>
        )}

        {/* Posts Sections */}
        {expandedSection && expandedSection !== 'About' && (
          <ExpandableSection
            title={expandedSection}
            isOpen={true}
            onToggle={() => handleSectionToggle(expandedSection)}
            rightAdornment={getRightAdornment(expandedSection)}
          >
            {(() => {
              const sectionData = getSectionData(expandedSection);
              if (!sectionData) return null;

              if (sectionData.loading) {
                return (
                  <div className={styles.loadingContainer}>
                    Loading posts...
                  </div>
                );
              }

              if (sectionData.error) {
                return (
                  <div className={styles.errorContainer}>
                    Error loading posts: {sectionData.error}
                  </div>
                );
              }

              return (
                <PostStack posts={sectionData.posts} />
              );
            })()}
          </ExpandableSection>
        )}

        {/* Empty state when no section is expanded */}
        {!expandedSection && (
          <div className={styles.emptyState}>
            <p>Select a section from the navigation to view content.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;

