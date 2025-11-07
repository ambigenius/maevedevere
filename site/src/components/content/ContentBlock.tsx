import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import type { AnyPost } from '../../types/content.ts';
import Image from '../../Image.js';
import './content.css';

type ContentBlockProps = {
  post: AnyPost;
  expanded?: boolean;
  onOpen?: () => void;
};

const ContentBlock: React.FC<ContentBlockProps> = ({ post, expanded = false, onOpen }) => {
  const kind = post.type?.toLowerCase();
  const normalizedDescription = normalizeText(post.description);

  if (kind === 'words' || kind === 'about') {
    const rawText = normalizeText(post.text);
    const bodyContent = rawText
      ? expanded
        ? rawText
        : truncateMarkdown(rawText, 110)
      : '';
    const bodyClass = expanded ? 'cb-body' : 'cb-excerpt';
    const clickableProps = onOpen
      ? {
          onClick: (event: React.MouseEvent<HTMLDivElement>) => {
            event.stopPropagation();
            onOpen();
          },
          role: 'button' as const,
          tabIndex: 0,
        }
      : {};

    return (
      <article className={`cb ${onOpen ? 'cb-clickable' : ''}`} {...clickableProps}>
        <h3 className="cb-title">{post.title}</h3>
        {normalizedDescription && (
          <p className="cb-dek">
            <em>{normalizedDescription}</em>
          </p>
        )}
        {bodyContent && (
          <div className={bodyClass}>
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>{bodyContent}</ReactMarkdown>
          </div>
        )}
      </article>
    );
  }

  if (kind === 'lines' || kind === 'sound' || kind === 'motion') {
    const imageLinks = getImageLinks(post);
    const showMedia = imageLinks.length > 0;
    const videoUrl = kind === 'motion' ? getMotionEmbed(post) : null;

    return (
      <figure className={`cb cb-mediaWrap cb-${kind}`}>
        {post.metadata?.stamp && (
          <img className="cb-stamp" src={post.metadata.stamp} alt="" />
        )}
        {kind === 'motion' && videoUrl ? (
          <div className="cb-video">
            <iframe
              src={videoUrl}
              title={post.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          showMedia && (
            <Image
              imageLinks={imageLinks}
              imageWidth={
                kind === 'motion'
                  ? '900px'
                  : kind === 'sound'
                  ? '420px'
                  : '720px'
              }
            />
          )
        )}
        {kind === 'motion' && !videoUrl && <span className="cb-play">▶</span>}
        <figcaption className="cb-cap">
          <span
            className="cb-title-link"
            onClick={onOpen ? () => onOpen() : undefined}
            role={onOpen ? 'button' : undefined}
            tabIndex={onOpen ? 0 : -1}
          >
            {post.title}
          </span>
          {normalizedDescription && <span className="cb-cap-sep"> — </span>}
          {normalizedDescription && <em>{normalizedDescription}</em>}
        </figcaption>
        {expanded && kind === 'sound' && renderSoundPlayer(post)}
        {expanded && post.text && (
          <div className="cb-body">
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
              {normalizeText(post.text)}
            </ReactMarkdown>
          </div>
        )}
      </figure>
    );
  }

  return null;
};

export default ContentBlock;

function normalizeText(value?: string | null): string {
  if (!value) return '';
  return value.replace(/\\n/g, '\n');
}

function getImageLinks(post: AnyPost): string[] {
  const links: string[] = [];
  const add = (value: unknown) => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => add(entry));
      return;
    }
    if (typeof value === 'string') {
      links.push(value);
    }
  };

  // Most common locations
  add((post as any).image); // legacy field
  add(post.metadata?.image);
  add(post.metadata?.images);
  add(post.metadata?.imageLinks);
  add(post.metadata?.poster);

  return Array.from(new Set(links.filter(Boolean)));
}

function truncateMarkdown(markdown: string, maxWords = 110) {
  const words = markdown.split(/\s+/);
  if (words.length <= maxWords) {
    return markdown;
  }
  const clipped = words.slice(0, maxWords).join(' ');
  return `${clipped}…`;
}

function getMotionEmbed(post: AnyPost): string | null {
  const url = post.metadata?.videoUrl || (post as any).videoUrl;
  if (!url || typeof url !== 'string') return null;

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }
  }

  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`;
    }
  }

  return url;
}

function renderSoundPlayer(post: AnyPost) {
  const embed = post.metadata?.audioEmbed || (post.metadata?.audioHtml as string | undefined);
  if (embed) {
    return <div className="cb-audioEmbed" dangerouslySetInnerHTML={{ __html: embed }} />;
  }

  const url = (post.metadata?.audioUrl || (post as any).audioUrl) as string | undefined;
  if (!url) return null;

  if (url.includes('bandcamp.com')) {
    const embedUrl = getBandcampEmbed(url);
    if (embedUrl) {
      return (
        <div className="cb-audioEmbed">
          <iframe
            src={embedUrl}
            title={`${post.title} audio`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            seamless
          ></iframe>
        </div>
      );
    }
  }

  if (url.includes('soundcloud.com')) {
    const scUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
    return (
      <div className="cb-audioEmbed">
        <iframe
          src={scUrl}
          title={`${post.title} audio`}
          frameBorder="0"
          allow="autoplay"
        ></iframe>
      </div>
    );
  }

  return (
    <div className="cb-audio">
      <audio controls preload="none" src={url} />
    </div>
  );
}

function getBandcampEmbed(url: string): string | null {
  try {
    if (url.includes('EmbeddedPlayer')) return url;

    const parsed = new URL(url);
    if (parsed.hostname.endsWith('bandcamp.com')) {
      const path = parsed.pathname;
      if (path.includes('/album/') || path.includes('/track/')) {
        return `https://bandcamp.com/EmbeddedPlayer${path}?size=large&bgcol=ffffff&linkcol=0687f5&tracklist=false&transparent=true`;
      }
    }
    return url;
  } catch {
    return null;
  }
}
