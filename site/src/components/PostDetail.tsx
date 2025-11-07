import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import type { AnyPost } from '../types/content.ts';
import Image from '../Image.js';
import '../App.css';
import styles from './PostDetail.module.css';

type PostDetailProps = {
  post: AnyPost;
  onClose: () => void;
};

// Helper to gather image links for carousel usage
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

  add((post as any).image);
  add(post.metadata?.image);
  add(post.metadata?.images);
  add(post.metadata?.imageLinks);
  add(post.metadata?.poster);

  return Array.from(new Set(links.filter(Boolean)));
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

// Helper to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  return null;
}

// Helper to check if URL is YouTube
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

// Helper to get Bandcamp embed URL
function getBandcampEmbedUrl(url: string): string | null {
  if (url.includes('EmbeddedPlayer')) return url;

  try {
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

// Helper to check if URL is Bandcamp
function isBandcampUrl(url: string): boolean {
  return url.includes('bandcamp.com');
}

// Helper to check if URL is SoundCloud
function isSoundCloudUrl(url: string): boolean {
  return url.includes('soundcloud.com');
}

// Helper to get SoundCloud embed URL
function getSoundCloudEmbedUrl(url: string): string | null {
  if (!isSoundCloudUrl(url)) return null;
  
  // SoundCloud embed format: https://w.soundcloud.com/player/?url=[encoded_url]
  try {
    const encodedUrl = encodeURIComponent(url);
    return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;
  } catch {
    return null;
  }
}

function renderSoundDetail(post: AnyPost) {
  const embedHtml = (post.metadata as any)?.audioEmbed || (post.metadata as any)?.audioHtml;
  if (embedHtml) {
    return (
      <div className={styles.audioContainer}>
        <div className={styles.audioEmbed} dangerouslySetInnerHTML={{ __html: embedHtml }} />
      </div>
    );
  }

  const url = ((post as any).audioUrl as string | undefined) || (post.metadata as any)?.audioUrl;
  if (!url) {
    return null;
  }

  if (isBandcampUrl(url)) {
    const embedUrl = getBandcampEmbedUrl(url) || url;
    return (
      <div className={styles.audioContainer}>
        <iframe
          className={styles.audioEmbed}
          src={embedUrl}
          title={post.title}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          style={{ border: 0, width: '100%', height: '160px' }}
        ></iframe>
      </div>
    );
  }

  if (isSoundCloudUrl(url)) {
    const scUrl = getSoundCloudEmbedUrl(url) || url;
    return (
      <div className={styles.audioContainer}>
        <iframe
          className={styles.audioEmbed}
          src={scUrl}
          title={post.title}
          frameBorder="0"
          allow="autoplay"
          style={{ width: '100%', height: '166px' }}
        ></iframe>
      </div>
    );
  }

  return (
    <div className={styles.audioContainer}>
      <audio controls className={styles.audioPlayer} src={url}>
        Your browser does not support the audio element.
      </audio>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.audioLink}
      >
        🎵 Open in new tab
      </a>
    </div>
  );
}

function getModalClass(type: AnyPost['type']): string {
  if (type === 'Motion') return styles.modalWide;
  if (type === 'Lines' || type === 'Sound') return styles.modalWide;
  return styles.modalNarrow;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onClose }) => {
  const imageLinks = getImageLinks(post);
  const defaultImageWidth = post.type === 'Motion'
    ? '900px'
    : post.type === 'Sound'
    ? '420px'
    : post.type === 'Lines'
    ? ((post as any).imageWidth as string | undefined) || '720px'
    : '720px';
  const normalizedDescription = normalizeText(post.description);
  const normalizedText = normalizeText(post.text);
  const normalizedAbout = normalizeText(post.text);
  const motionEmbed = post.type === 'Motion' ? getMotionEmbed(post) : null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.container} ${getModalClass(post.type)}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          ✕
        </button>
        
        <header className={styles.header}>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.meta}>
            <span className={styles.type}>{post.type}</span>
          </div>
          {normalizedDescription && (
            <p className={styles.description}>{normalizedDescription}</p>
          )}
        </header>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.content}>
          {/* Motion: Video + Text */}
          {post.type === 'Motion' && motionEmbed && (
            <div className={styles.videoContainer}>
              <iframe
                className={styles.videoEmbed}
                src={motionEmbed}
                title={post.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {/* Lines/Sound: Images + Text */}
          {(post.type === 'Lines' || post.type === 'Sound') && imageLinks.length > 0 && (
            <div className={styles.imageContainer}>
              <Image 
                imageLinks={imageLinks}
                imageWidth={defaultImageWidth}
              />
            </div>
          )}

          {/* Sound: Audio URL */}
          {post.type === 'Sound' && renderSoundDetail(post)}

          {/* Text content (Markdown for Words/Lines/Sound, plain text for About) */}
          {post.text && (
            <div className={styles.textContainer}>
              {post.type === 'About' ? (
                <div className={styles.plainText}>{normalizedAbout}</div>
              ) : (
                <ReactMarkdown 
                  className={styles.markdown}
                  remarkPlugins={[remarkBreaks]}
                  components={{
                    p: ({ node, ...props }) => <p style={{ whiteSpace: 'normal' }} {...props} />,
                  }}
                >
                  {normalizedText}
                </ReactMarkdown>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function normalizeText(value?: string | null): string {
  if (!value) return '';
  return value.replace(/\\n/g, '\n');
}

export default PostDetail;

