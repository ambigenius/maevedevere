import React, { useState } from 'react';
import type { AnyPost } from '../types/content.ts';
import ContentBlock from './content/ContentBlock.tsx';
import styles from './PostStack.module.css';

type PostStackProps = {
  posts: AnyPost[];
};

const PostStack: React.FC<PostStackProps> = ({ posts }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (!posts.length) {
    return null;
  }

  const togglePost = (postId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  return (
    <div className={styles.stack}>
      {posts.map((post) => {
        const expanded = expandedIds.has(post.id);

        return (
          <div key={post.id} className={styles.item}>
            <button
              type="button"
              className={`${styles.header} ${expanded ? styles.headerActive : ''}`}
              onClick={() => togglePost(post.id)}
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
