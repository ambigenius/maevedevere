import React from 'react';
import type { AnyPost } from '../types/content.ts';
import ContentBlock from './content/ContentBlock.tsx';
import './masonry.css';

type MasonryFeedProps = {
  posts: AnyPost[];
  onOpen: (post: AnyPost) => void;
};

const MasonryFeed: React.FC<MasonryFeedProps> = ({ posts, onOpen }) => {
  if (!posts?.length) {
    return null;
  }

  return (
    <div className="masonry">
      {posts.map((post) => (
        <div key={post.id} className="block">
          <ContentBlock post={post} onOpen={() => onOpen(post)} />
        </div>
      ))}
    </div>
  );
};

export default MasonryFeed;
