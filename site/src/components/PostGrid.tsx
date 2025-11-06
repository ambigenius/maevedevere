import React from 'react';
import type { AnyPost } from '../types/content.ts';
import styles from './PostGrid.module.css';

type PostGridProps = {
  posts: AnyPost[];
  onOpen: (post: AnyPost) => void;
};

type CardProps = {
  post: AnyPost;
  onClick: () => void;
};

const PreviewCard: React.FC<CardProps> = ({ post, onClick }) => {
  const strapline = post.description || post.metadata?.strapline || '';

  return (
    <button type="button" className={`card ${styles.card}`} onClick={onClick}>
      <div className={styles.cardHeader}>
        <h3 className={`${styles.title} title`}>{post.title}</h3>
        {strapline && <p className={`${styles.strapline} subtle`}>{strapline}</p>}
      </div>
      {post.text && (
        <p className={styles.excerpt}>{post.text}</p>
      )}
      <div className={styles.cardFooter}>
        <span className={`${styles.type} badge`}>{post.type}</span>
      </div>
    </button>
  );
};

const PostGrid: React.FC<PostGridProps> = ({ posts, onOpen }) => {
  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No posts available.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {posts.map((post) => (
        <PreviewCard key={post.id} post={post} onClick={() => onOpen(post)} />
      ))}
    </div>
  );
};

export default PostGrid;

