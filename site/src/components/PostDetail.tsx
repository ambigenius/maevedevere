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

// Helper to normalize image data for Image component
function getImageData(image: string | string[] | null | undefined): string | string[] | null {
  if (!image) return null;
  if (typeof image === 'string') return image;
  return image;
}

// Helper to determine modal width class
function getModalClass(type: AnyPost['type']): string {
  if (type === 'Lines' || type === 'Motion' || type === 'Sound') {
    return styles.modalWide;
  }
  return styles.modalNarrow;
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
  if (!url.includes('bandcamp.com')) return null;
  
  // Bandcamp embed format uses the track/album path
  // Standard format: https://bandcamp.com/EmbeddedPlayer/[path]?size=large&bgcol=ffffff&linkcol=0687f5&transparent=true
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // If it's already an embed URL, return as-is
    if (path.includes('/EmbeddedPlayer/')) {
      return url;
    }
    
    // Remove leading slash and construct embed URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // Bandcamp embed format: path with query params
    const embedUrl = `https://bandcamp.com/EmbeddedPlayer${cleanPath}?size=large&bgcol=ffffff&linkcol=0687f5&transparent=true`;
    return embedUrl;
  } catch {
    // If URL parsing fails, try appending /embed to the original URL
    if (url.includes('/track/') || url.includes('/album/')) {
      return `${url}/embed`;
    }
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

const PostDetail: React.FC<PostDetailProps> = ({ post, onClose }) => {
  const imageData = getImageData(
    post.type === 'Lines' || post.type === 'Sound' ? post.image : undefined
  );
  const imageWidth = 
    post.type === 'Lines' || post.type === 'Sound' ? post.imageWidth : undefined;
  const modalClass = getModalClass(post.type);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.container} ${modalClass}`}
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
          {post.description && (
            <p className={styles.description}>{post.description}</p>
          )}
        </header>

        <div className={styles.divider} aria-hidden="true" />

        <div className={styles.content}>
          {/* Motion: Video + Text */}
          {post.type === 'Motion' && post.videoUrl && (
            <div className={styles.videoContainer}>
              {isYouTubeUrl(post.videoUrl) ? (
                <iframe
                  className={styles.videoEmbed}
                  src={getYouTubeEmbedUrl(post.videoUrl) || post.videoUrl}
                  title={post.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  className={styles.video}
                  controls
                  src={post.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          {/* Lines/Sound: Images + Text */}
          {(post.type === 'Lines' || post.type === 'Sound') && imageData && (
            <div className={styles.imageContainer}>
              <Image 
                imageLinks={imageData}
                imageWidth={imageWidth || '600px'}
              />
            </div>
          )}

          {/* Sound: Audio URL */}
          {post.type === 'Sound' && post.audioUrl && (
            <div className={styles.audioContainer}>
              {isBandcampUrl(post.audioUrl) ? (
                <iframe
                  className={styles.audioEmbed}
                  src={getBandcampEmbedUrl(post.audioUrl) || post.audioUrl}
                  title={post.title}
                  frameBorder="0"
                  style={{ border: 0, width: '100%', height: '120px' }}
                ></iframe>
              ) : isSoundCloudUrl(post.audioUrl) ? (
                <iframe
                  className={styles.audioEmbed}
                  src={getSoundCloudEmbedUrl(post.audioUrl) || post.audioUrl}
                  title={post.title}
                  frameBorder="0"
                  allow="autoplay"
                  style={{ width: '100%', height: '166px' }}
                ></iframe>
              ) : (
                <>
                  <audio controls className={styles.audioPlayer} src={post.audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                  <a 
                    href={post.audioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.audioLink}
                  >
                    🎵 Open in new tab
                  </a>
                </>
              )}
            </div>
          )}

          {/* Text content (Markdown for Words/Lines/Sound, plain text for About) */}
          {post.text && (
            <div className={styles.textContainer}>
              {post.type === 'About' ? (
                <div className={styles.plainText}>{post.text}</div>
              ) : (
                <ReactMarkdown 
                  className={styles.markdown}
                  remarkPlugins={[remarkBreaks]}
                  components={{
                    p: ({ node, ...props }) => <p style={{ whiteSpace: 'normal' }} {...props} />,
                  }}
                >
                  {post.text}
                </ReactMarkdown>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

