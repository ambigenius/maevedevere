import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { AnyPost } from '../../types/content';
import './content.css';

type ContentBlockProps = {
  post: AnyPost;
  onOpen: () => void;
};

const ContentBlock: React.FC<ContentBlockProps> = ({ post, onOpen }) => {
  const kind = post.type?.toLowerCase();

  if (kind === 'words' || kind === 'about') {
    return (
      <article className="cb" onClick={onOpen} role="button" tabIndex={0}>
        <h3 className="cb-title">{post.title}</h3>
        {post.description && (
          <p className="cb-dek">
            <em>{post.description}</em>
          </p>
        )}
        {post.text && (
          <div className="cb-excerpt">
            <ReactMarkdown>{truncateMarkdown(post.text, 110)}</ReactMarkdown>
          </div>
        )}
      </article>
    );
  }

  if (kind === 'lines' || kind === 'sound' || kind === 'motion') {
    const img = pickImage(post);

    return (
      <figure className="cb cb-mediaWrap">
        {post.metadata?.stamp && (
          <img className="cb-stamp" src={post.metadata.stamp} alt="" />
        )}
        {img && (
          <img
            className="cb-media"
            src={img}
            alt={post.title}
            loading="lazy"
            onClick={onOpen}
          />
        )}
        {kind === 'motion' && <span className="cb-play">▶</span>}
        <figcaption className="cb-cap">
          <span className="cb-title-link" onClick={onOpen} role="button" tabIndex={0}>
            {post.title}
          </span>
          {post.description && <span className="cb-cap-sep"> — </span>}
          {post.description && <em>{post.description}</em>}
        </figcaption>
      </figure>
    );
  }

  return null;
};

export default ContentBlock;

function pickImage(post: AnyPost): string | null {
  // Lines/Sound often carry image or metadata.imageLinks
  const imageSource =
    // @ts-ignore - we attempt a best-effort lookup across variants
    post.image || post.metadata?.image || post.metadata?.imageLinks?.[0];

  if (typeof imageSource === 'string') return imageSource;
  if (Array.isArray(imageSource) && imageSource.length > 0) return imageSource[0];
  return null;
}

function truncateMarkdown(markdown: string, maxWords = 110) {
  const words = markdown.split(/\s+/);
  if (words.length <= maxWords) {
    return markdown;
  }
  const clipped = words.slice(0, maxWords).join(' ');
  return `${clipped}…`;
}
