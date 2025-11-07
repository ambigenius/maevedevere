import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { AnyPost } from '../../types/content.ts';
import './content.css';

type ContentBlockProps = {
  post: AnyPost;
  expanded?: boolean;
  onOpen?: () => void;
};

const ContentBlock: React.FC<ContentBlockProps> = ({ post, expanded = false, onOpen }) => {
  const kind = post.type?.toLowerCase();

  if (kind === 'words' || kind === 'about') {
    const bodyContent = post.text
      ? expanded
        ? post.text
        : truncateMarkdown(post.text, 110)
      : '';

    const bodyClass = expanded ? 'cb-body' : 'cb-excerpt';

    return (
      <article className="cb" role="article">
        <h3 className="cb-title">{post.title}</h3>
        {post.description && (
          <p className="cb-dek">
            <em>{post.description}</em>
          </p>
        )}
        {bodyContent && (
          <div className={bodyClass}>
            <ReactMarkdown>{bodyContent}</ReactMarkdown>
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
            onClick={onOpen ? () => onOpen() : undefined}
            style={{ cursor: onOpen ? 'pointer' : 'default' }}
          />
        )}
        {kind === 'motion' && <span className="cb-play">▶</span>}
        <figcaption className="cb-cap">
          <span
            className="cb-title-link"
            onClick={onOpen ? () => onOpen() : undefined}
            role={onOpen ? 'button' : undefined}
            tabIndex={onOpen ? 0 : -1}
          >
            {post.title}
          </span>
          {post.description && <span className="cb-cap-sep"> — </span>}
          {post.description && <em>{post.description}</em>}
        </figcaption>
        {expanded && post.text && (
          <div className="cb-body">
            <ReactMarkdown>{post.text}</ReactMarkdown>
          </div>
        )}
      </figure>
    );
  }

  return null;
};

export default ContentBlock;

function pickImage(post: AnyPost): string | null {
  const imageSource =
    // @ts-ignore - best-effort lookup
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
