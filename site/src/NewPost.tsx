import React, { useState, useMemo, useEffect } from 'react';
import './NewPost.css';
import { API_BASE } from './config.ts';

type PostType = 'Words' | 'Lines' | 'Motion' | 'Sound' | 'About';

interface BasePost {
  type: PostType;
  id: string;
  slug: string;
  title: string;
  date: string; // ISO string
  description: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  metadata: Record<string, any>;
}

interface WordsPost extends BasePost {
  type: 'Words';
  text: string;
}

interface LinesPost extends BasePost {
  type: 'Lines';
  text: string;
  image: string | string[] | null;
  imageWidth: string;
}

interface MotionPost extends BasePost {
  type: 'Motion';
  text: string;
  videoUrl: string | null;
}

interface SoundPost extends BasePost {
  type: 'Sound';
  text: string;
  image: string | string[] | null;
  imageWidth: string;
  audioUrl: string | null;
  metadata: Record<string, any> & { audioEmbed?: string };
}

interface AboutPost extends BasePost {
  type: 'About';
  text: string;
}

type PostData = WordsPost | LinesPost | MotionPost | SoundPost | AboutPost;

interface CommitRequest {
  path: string;
  contentJson: PostData;
  message: string;
  sha?: string;
}

interface CommitResponse {
  content?: {
    html_url?: string;
    path?: string;
  };
  message?: string;
}

// Helper: slugify title
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper: convert date input to ISO string (midnight UTC)
function toIsoDate(dateInput: string | Date): string {
  if (dateInput instanceof Date) {
    return dateInput.toISOString();
  }
  // Assume YYYY-MM-DD format
  const date = new Date(dateInput + 'T00:00:00Z');
  return date.toISOString();
}

// Helper: format date for display in filename (YYYY-MM-DD)
function formatDateForFilename(date: string): string {
  return date.split('T')[0];
}

const NewPost = () => {
  const [type, setType] = useState('Words');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [metadataText, setMetadataText] = useState('{}');
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Type-specific fields
  const [text, setText] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [imageWidth, setImageWidth] = useState('600px');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioEmbed, setAudioEmbed] = useState('');

  useEffect(() => {
    if (type !== 'Sound') {
      setAudioEmbed('');
    }
  }, [type]);

  // UI state
  const [testMode, setTestMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  // Parse metadata JSON with error handling
  const metadata = useMemo(() => {
    if (!metadataText.trim()) return {};
    try {
      const parsed = JSON.parse(metadataText);
      setMetadataError(null);
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch (e) {
      setMetadataError('Invalid JSON format');
      return {};
    }
  }, [metadataText]);

  // Compute derived fields
  const slug = useMemo(() => slugify(title), [title]);
  const postId = useMemo(() => `${type.toLowerCase()}_${Date.now()}`, [type]);

  // Build the post object
  const postData = useMemo((): PostData | null => {
    const now = new Date().toISOString();
    const mergedMetadata: Record<string, any> = { ...metadata };
    if (type === 'Sound') {
      if (audioEmbed.trim()) {
        mergedMetadata.audioEmbed = audioEmbed.trim();
      } else {
        delete mergedMetadata.audioEmbed;
      }
    }

    const base: Partial<BasePost> = {
      type: type as PostType,
      id: postId,
      slug,
      title,
      date: toIsoDate(date),
      description,
      createdAt: now,
      updatedAt: now,
      isActive,
      metadata: mergedMetadata,
    };

    switch (type) {
      case 'Words':
        return { ...base, type: 'Words', text } as WordsPost;
      case 'Lines':
        const linesImage = imageInput.trim()
          ? (imageInput.includes(',')
              ? imageInput.split(',').map(s => s.trim()).filter(Boolean)
              : imageInput.trim())
          : null;
        return {
          ...base,
          type: 'Lines',
          text,
          image: linesImage,
          imageWidth,
        } as LinesPost;
      case 'Motion':
        return { ...base, type: 'Motion', text, videoUrl: videoUrl.trim() || null } as MotionPost;
      case 'Sound':
        const soundImage = imageInput.trim()
          ? (imageInput.includes(',')
              ? imageInput.split(',').map(s => s.trim()).filter(Boolean)
              : imageInput.trim())
          : null;
        return {
          ...base,
          type: 'Sound',
          text,
          image: soundImage,
          imageWidth,
          audioUrl: audioUrl.trim() || null,
        } as SoundPost;
      case 'About':
        return { ...base, type: 'About', text } as AboutPost;
      default:
        return null;
    }
  }, [type, postId, slug, title, date, description, isActive, metadata, text, imageInput, imageWidth, videoUrl, audioUrl, audioEmbed]);

  // Compute file path
  const filePath = useMemo(() => {
    if (!title || !date) return '';
    const dateStr = formatDateForFilename(toIsoDate(date));
    
    if (type === 'About') {
      return 'About/about.json';
    }
    return `${type}/${dateStr}_${slug}.json`;
  }, [type, title, date, slug]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (!title.trim()) errors.push('Title is required');
    if (!date) errors.push('Date is required');
    if (!text.trim()) errors.push(`${type === 'About' ? 'Text' : 'Text content'} is required`);
    
    if (type === 'Motion' && !videoUrl.trim()) {
      // Video URL is optional based on requirements, but if provided should be string
      // We'll allow it to be empty
    }
    
    if (metadataError) errors.push(metadataError);

    return errors;
  }, [title, date, text, type, videoUrl, metadataError]);

  const isValid = validationErrors.length === 0;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid || !postData) {
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    setSuccessUrl(null);
    setIsSubmitting(true);

    const commitRequest: CommitRequest = {
      path: filePath,
      contentJson: postData,
      message: `Create ${type} ${title} via admin UI`,
    };

    if (testMode) {
      console.log('Test Mode - Payload:', commitRequest);
      setIsSubmitting(false);
      setSubmitSuccess('Test mode: Check console for payload');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commitRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CommitResponse = await response.json();
      const htmlUrl = data.content?.html_url || 
        `https://github.com/ambigenius/mdvbackend/${filePath}`;
      
      setSubmitSuccess('Success! File created.');
      setSuccessUrl(htmlUrl);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset type-specific fields when type changes
  React.useEffect(() => {
    setText('');
    setImageInput('');
    setImageWidth('600px');
    setVideoUrl('');
    setAudioUrl('');
    setAudioEmbed('');
  }, [type]);

  return (
    <div className="new-post-container">
      <h1>Create New Post</h1>
      
      <div className="info-panel">
        <p>
          <strong>Note:</strong> Writes require the backend API with a GitHub token configured.
          Ensure <code>/api/commit</code> is properly set up.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="new-post-form">
        <div className="form-group">
          <label htmlFor="test-mode">
            <input
              type="checkbox"
              id="test-mode"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
            />
            Test Mode (skip API call, log to console)
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="type">Type *</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as PostType)}
            required
          >
            <option value="Words">Words</option>
            <option value="Lines">Lines</option>
            <option value="Motion">Motion</option>
            <option value="Sound">Sound</option>
            <option value="About">About</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter post title"
          />
          {title && (
            <small className="helper-text">
              Slug: <code>{slug}</code> | ID: <code>{postId}</code>
            </small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="is-active">
            <input
              type="checkbox"
              id="is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
        </div>

        {/* Type-specific fields */}
        <div className="form-group">
          <label htmlFor="text">
            {type === 'About' ? 'Text *' : 'Text (Markdown) *'}
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            required
            placeholder="Enter markdown content"
          />
        </div>

        {(type === 'Lines' || type === 'Sound') && (
          <>
            <div className="form-group">
              <label htmlFor="image">
                Image URL(s) {type === 'Lines' ? '(comma-separated for multiple)' : '(comma-separated for multiple)'}
              </label>
              <input
                type="text"
                id="image"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="https://example.com/image.jpg or url1, url2, url3"
              />
              <small className="helper-text">
                Enter one URL or multiple comma-separated URLs
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="image-width">Image Width</label>
              <input
                type="text"
                id="image-width"
                value={imageWidth}
                onChange={(e) => setImageWidth(e.target.value)}
                placeholder="600px"
              />
            </div>
          </>
        )}

        {type === 'Sound' && (
          <>
            <div className="form-row">
              <label htmlFor="audio-url">Audio URL</label>
              <input
                id="audio-url"
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="form-row">
              <label htmlFor="audio-embed">Audio Embed HTML (optional)</label>
              <textarea
                id="audio-embed"
                value={audioEmbed}
                onChange={(e) => setAudioEmbed(e.target.value)}
                placeholder="Paste Bandcamp or SoundCloud iframe code"
                rows={5}
              />
            </div>
          </>
        )}

        {type === 'Motion' && (
          <div className="form-group">
            <label htmlFor="video-url">Video URL</label>
            <input
              type="url"
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="metadata">Metadata (JSON)</label>
          <textarea
            id="metadata"
            value={metadataText}
            onChange={(e) => setMetadataText(e.target.value)}
            rows={5}
            placeholder='{"key": "value"}'
          />
          {metadataError && (
            <div className="error-message">{metadataError}</div>
          )}
          {!metadataError && metadataText.trim() && (
            <small className="helper-text">Valid JSON</small>
          )}
        </div>

        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <strong>Validation Errors:</strong>
            <ul>
              {validationErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {submitError && (
          <div className="error-message">{submitError}</div>
        )}

        {submitSuccess && (
          <div className="success-message">
            <p>
              {submitSuccess}{' '}
              {successUrl && (
                <a href={successUrl} target="_blank" rel="noopener noreferrer">
                  View file on GitHub
                </a>
              )}
            </p>
          </div>
        )}

        <div className="form-group">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </form>

      {/* JSON Preview */}
      <div className="preview-section">
        <h2>JSON Preview</h2>
        <div className="preview-info">
          <strong>Path:</strong> <code>{filePath || '(pending)'}</code>
        </div>
        <pre className="json-preview">
          {postData ? JSON.stringify(postData, null, 2) : 'Fill in the form to see preview'}
        </pre>
      </div>
    </div>
  );
};

export default NewPost;

