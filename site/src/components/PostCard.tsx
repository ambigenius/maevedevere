import React from 'react';
import type { AnyPost } from '../types/content.ts';
import { formatDate } from '../utils/date.ts';
import styles from './PostCard.module.css';

type PostCardProps = {
  post: AnyPost;
  onOpen: (post: AnyPost) => void;
};

// Helper to create excerpt from text
function createExcerpt(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  
  // Try to break at a sentence or word boundary
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  const breakPoint = lastPeriod > maxLength * 0.7 
    ? lastPeriod + 1 
    : lastSpace > maxLength * 0.7 
    ? lastSpace 
    : maxLength;
  
  return text.substring(0, breakPoint) + '...';
}

const PostCard: React.FC<PostCardProps> = ({ post, onOpen }) => {
  const excerpt = createExcerpt(post.text || '');
  
  return (
    <div className={styles.card} onClick={() => onOpen(post)}>
      <div className={styles.header}>
        <h3 className={styles.title}>{post.title}</h3>
        <span className={styles.date}>
          {formatDate(post.date instanceof Date ? post.date : new Date(post.date))}
        </span>
      </div>
      {post.description && (
        <p className={styles.description}>{post.description}</p>
      )}
      <p className={styles.excerpt}>{excerpt}</p>
      <div className={styles.footer}>
        <span className={styles.type}>{post.type}</span>
      </div>
    </div>
  );
};

export default PostCard;

