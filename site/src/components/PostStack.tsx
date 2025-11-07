import React, { useState } from 'react';
import type { AnyPost } from '../types/content.ts';
import ContentBlock from './content/ContentBlock.tsx';
import styles from './PostStack.module.css';

type PostStackProps = {
  posts: AnyPost[];
};

const PostStack: React.FC<PostStackProps> = ({ posts }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!posts.length) {
    return null;
  }

  return (
    <div className={styles.stack}>
      {posts.map((post) => {
        const expanded = expandedId === post.id;

        return (
          <div key={post.id} className={styles.item}>
            <button
              type="button"
              className={`${styles.header} ${expanded ? styles.headerActive : ''}`}
              onClick={() => setExpandedId(expanded ? null : post.id)}
              aria-expanded={expanded}
            >
              <span className={styles.chevron} aria-hidden="true">
                {expanded ? '▾' : '▸'}
              </span>
              <span className={styles.headerTitle}>{post.title}</span>
              <span className={styles.headerType}>{post.type}</span>
            </button>
            {expanded && (
              <div className={styles.body}>
                <ContentBlock post={post} expanded />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PostStack;
