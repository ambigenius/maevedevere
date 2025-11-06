import React, { useState, useEffect } from 'react';
import type { Section, AnyPost } from './types/content.ts';
import usePosts from './hooks/usePosts.ts';
import { useAbout } from './hooks/usePosts.ts';
import ExpandableSection from './components/ExpandableSection.tsx';
import PostGrid from './components/PostGrid.tsx';
import PostDetail from './components/PostDetail.tsx';
import TopBar from './components/TopBar.tsx';
import Hero from './components/Hero.tsx';
import ReactMarkdown from 'react-markdown';
import './App.css';
import styles from './HomePage.module.css';
import Skeleton from './components/Skeleton.tsx';

function HomePage() {
  const [expandedSection, setExpandedSection] = useState<Section | null>(null);
  const [openedPost, setOpenedPost] = useState<AnyPost | null>(null);

  // Fetch posts for each section when expanded
  const allPosts = usePosts('All');
  const wordsPosts = usePosts('Words');
  const linesPosts = usePosts('Lines');
  const motionPosts = usePosts('Motion');
  const soundPosts = usePosts('Sound');
  const aboutData = useAbout();

  // Handle section toggle
  const handleSectionToggle = (section: Section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
      setOpenedPost(null); // Clear opened post when switching sections
    }
  };

  // Handle post open
  const handlePostOpen = (post: AnyPost) => {
    setOpenedPost(post);
  };

  // Handle post close
  const handlePostClose = () => {
    setOpenedPost(null);
  };

  // ESC key handler to close PostDetail
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openedPost) {
        handlePostClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [openedPost]);

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

  const renderSectionContent = (section: Section) => {
    const sectionData = getSectionData(section);
    if (!sectionData) return null;

    if (sectionData.loading) {
      return (
        <div className={styles.skeletonGrid}>
          <Skeleton count={6} />
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
      <>
        <PostGrid posts={sectionData.posts} onOpen={handlePostOpen} />
        {openedPost && (
          <PostDetail post={openedPost} onClose={handlePostClose} />
        )}
      </>
    );
  };

  const sections: Section[] = ['About', 'All', 'Words', 'Lines', 'Motion', 'Sound'];

  return (
    <div className={styles.layout}>
      <TopBar
        sections={sections}
        active={expandedSection}
        onSelect={(section) => handleSectionToggle(section)}
      />

      <main className={styles.main}>
        <div className="container">
          {!expandedSection && (
            <Hero
              onAbout={() => handleSectionToggle('About')}
              onExplore={() => handleSectionToggle('All')}
            />
          )}

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
            {renderSectionContent(expandedSection)}
          </ExpandableSection>
        )}
        </div>
      </main>
    </div>
  );
}

export default HomePage;

