import React from 'react';
import type { AnyPost } from '../types/content.ts';
import PostCard from './PostCard.tsx';
import styles from './PostGrid.module.css';

type PostGridProps = {
  posts: AnyPost[];
  onOpen: (post: AnyPost) => void;
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
        <PostCard key={post.id} post={post} onOpen={onOpen} />
      ))}
    </div>
  );
};

export default PostGrid;

