import React, { useEffect, useMemo, useState } from 'react';
import './NewPost.css';

import type { AnyPost } from './types/content.ts';

const API_BASE = 'http://localhost:3001/api';

type PostType = 'Words' | 'Lines' | 'Motion' | 'Sound' | 'About';

type FileListItem = {
  path: string;
  name: string;
  download_url: string;
};

type LoadedPost = {
  content: AnyPost;
  sha: string | null;
  path: string;
};

const POST_TYPES: PostType[] = ['Words', 'Lines', 'Motion', 'Sound', 'About'];

function formatDateTime(value?: string) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  } catch {
    return value;
  }
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function nowIso() {
  return new Date().toISOString();
}

function toIsoDate(value: string): string {
  if (!value) return nowIso();
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00Z`);
  return date.toISOString();
}

function coerceIso(value: unknown): string {
  if (!value) return nowIso();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return nowIso();
    return trimmed.includes('T') ? trimmed : `${trimmed}T00:00:00Z`;
  }
  try {
    const asDate = new Date(value as any);
    if (!Number.isNaN(asDate.getTime())) {
      return asDate.toISOString();
    }
  } catch (_) {
    // ignore
  }
  return nowIso();
}

const ModifyPost: React.FC = () => {
  const [files, setFiles] = useState<FileListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedPath, setSelectedPath] = useState('');
  const [loadedPost, setLoadedPost] = useState<LoadedPost | null>(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [text, setText] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [imageWidth, setImageWidth] = useState('600px');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioEmbed, setAudioEmbed] = useState('');
  const [metadataText, setMetadataText] = useState('{}');
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const [createdAt, setCreatedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/maevedevere');
  const [substackUrl, setSubstackUrl] = useState('https://substack.com/@maevedevere');

  const postType: PostType | null = useMemo(() => {
    if (!loadedPost) return null;
    return loadedPost.content.type as PostType;
  }, [loadedPost]);

  useEffect(() => {
    let cancelled = false;

    async function fetchList() {
      setLoadingList(true);
      setListError(null);
      try {
        const response = await fetch(`${API_BASE}/list?folder=All`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Failed to load posts list (${response.status})`);
        }
        const data: FileListItem[] = await response.json();

        const aboutItem: FileListItem = {
          path: 'About/about.json',
          name: 'About/about.json',
          download_url: '',
        };

        const merged = [aboutItem, ...data.filter((item) => item.path !== aboutItem.path)];

        if (cancelled) return;
        setFiles(merged);
      } catch (err) {
        if (!cancelled) {
          setListError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }

    fetchList();

    return () => {
      cancelled = true;
    };
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setIsActive(true);
    setText('');
    setImageInput('');
    setImageWidth('600px');
    setVideoUrl('');
    setAudioUrl('');
    setAudioEmbed('');
    setMetadataText('{}');
    setMetadataError(null);
    setCreatedAt('');
    setUpdatedAt('');
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const parseIsoString = (value: unknown): string => {
    if (!value) return nowIso();
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return nowIso();
      return trimmed.includes('T') ? trimmed : `${trimmed}T00:00:00Z`;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    try {
      const converted = new Date(value as any);
      if (!Number.isNaN(converted.getTime())) {
        return converted.toISOString();
      }
    } catch {
      // ignore
    }
    return nowIso();
  };

  const loadPost = async (path: string) => {
    if (!path) {
      setSelectedPath('');
      setLoadedPost(null);
      resetForm();
      return;
    }

    setSelectedPath(path);
    setLoadingPost(true);
    setPostError(null);
    setSubmitSuccess(null);

    try {
      const resp = await fetch(`${API_BASE}/file?path=${encodeURIComponent(path)}&meta=true`);
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to load post (${resp.status})`);
      }
      const data = await resp.json();
      const hasWrappedContent = data && typeof data === 'object' && 'content' in data;
      const postData = hasWrappedContent ? (data.content as AnyPost) : (data as AnyPost);

      if (!postData || typeof postData !== 'object' || !('type' in postData)) {
        throw new Error('Received invalid post data');
      }

      const postSha: string | null = hasWrappedContent && typeof data.sha === 'string' ? data.sha : null;
      const postPath: string = hasWrappedContent && typeof data.path === 'string' ? data.path : path;

      setLoadedPost({ content: postData, sha: postSha, path: postPath });

      setTitle(postData.title || '');
      setDescription(postData.description || '');
      if (typeof postData.date === 'string') {
        setDate(postData.date.split('T')[0]);
      } else if (postData.date instanceof Date) {
        setDate(postData.date.toISOString().split('T')[0]);
      } else {
        setDate('');
      }
      setIsActive(postData.isActive !== false);
      setText(postData.text || '');

      const imageValue = (postData as any).image;
      if (Array.isArray(imageValue)) {
        setImageInput(imageValue.join(', '));
      } else if (typeof imageValue === 'string') {
        setImageInput(imageValue);
      } else {
        setImageInput('');
      }

      setImageWidth((postData as any).imageWidth || '600px');
      setVideoUrl((postData as any).videoUrl || '');
      setAudioUrl((postData as any).audioUrl || (postData.metadata as any)?.audioUrl || '');
      setAudioEmbed((postData.metadata as any)?.audioEmbed || (postData.metadata as any)?.audioHtml || '');
      setInstagramUrl((postData.metadata as any)?.instagram || 'https://instagram.com/maevedevere');
      setSubstackUrl((postData.metadata as any)?.substack || 'https://substack.com/@maevedevere');

      try {
        const metadataClone = { ...(postData.metadata || {}) } as Record<string, any>;
        delete metadataClone.instagram;
        delete metadataClone.substack;
        setMetadataText(JSON.stringify(metadataClone, null, 2));
        setMetadataError(null);
      } catch {
        setMetadataText('{}');
        setMetadataError('Unable to stringify metadata; starting with empty object.');
      }

      setCreatedAt(parseIsoString(postData.createdAt || postData.updatedAt || postData.date));
      setUpdatedAt(parseIsoString(postData.updatedAt || postData.createdAt || postData.date));
    } catch (err) {
      setLoadedPost(null);
      resetForm();
      setPostError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingPost(false);
    }
  };

  const parseMetadata = (): Record<string, any> | null => {
    if (!metadataText.trim()) return {};
    try {
      const parsed = JSON.parse(metadataText);
      setMetadataError(null);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      setMetadataError('Invalid JSON in metadata');
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!loadedPost || !postType) {
      setSubmitError('Select a post to modify');
      return;
    }

    const parsedMetadata = parseMetadata();
    if (!parsedMetadata) {
      setSubmitError('Please fix metadata JSON errors');
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const baseMetadata: Record<string, any> = { ...parsedMetadata };

      if (audioEmbed.trim()) {
        baseMetadata.audioEmbed = audioEmbed.trim();
      } else {
        delete baseMetadata.audioEmbed;
      }

      if (!audioUrl.trim()) {
        delete baseMetadata.audioUrl;
      }

      if (postType === 'About') {
        baseMetadata.instagram = instagramUrl.trim() || 'https://instagram.com/maevedevere';
        baseMetadata.substack = substackUrl.trim() || 'https://substack.com/@maevedevere';
      }

      const basePost = {
        ...loadedPost.content,
        title,
        description,
        date: parseIsoString(date),
        isActive,
        text,
        metadata: baseMetadata,
        createdAt: createdAt || now,
        updatedAt: now,
      } as AnyPost;

      (basePost as any).slug = slugify(title) || (basePost as any).slug || '';

      let newPath = loadedPost.path;
      const originalPath = loadedPost.path;
      const originalSha = loadedPost.sha || undefined;

      const ensureImageArray = (input: string) =>
        input.trim()
          ? input.split(',').map((item) => item.trim()).filter(Boolean)
          : null;

      switch (postType) {
        case 'Lines': {
          const image = ensureImageArray(imageInput);
          (basePost as any).image = image;
          (basePost as any).imageWidth = imageWidth;
          break;
        }
        case 'Motion':
          (basePost as any).videoUrl = videoUrl.trim() || null;
          break;
        case 'Sound': {
          const image = ensureImageArray(imageInput);
          (basePost as any).image = image;
          (basePost as any).imageWidth = imageWidth;
          (basePost as any).audioUrl = audioUrl.trim() || null;
          break;
        }
        default:
          break;
      }

      if (postType !== 'About') {
        const segments = originalPath.split('/');
        const folder = segments.slice(0, -1).join('/') || segments[0] || postType;
        const filename = segments[segments.length - 1] || '';
        const dotIndex = filename.lastIndexOf('.');
        const extension = dotIndex !== -1 ? filename.slice(dotIndex) : '.json';
        const datePrefix = filename.includes('_') ? filename.split('_')[0] : (date || now).split('T')[0];
        const newSlug = slugify(title) || 'post';
        newPath = `${folder}/${datePrefix}_${newSlug}${extension}`;
      } else {
        newPath = 'About/about.json';
      }

      const isRename = postType !== 'About' && newPath !== originalPath;

      if (isRename && !originalSha) {
        throw new Error('Cannot rename file: missing original SHA. Reload and try again.');
      }

      const commitBody: Record<string, any> = {
        path: newPath,
        contentJson: basePost,
        message: `Update ${postType} post: ${title}`,
      };

      if (isRename) {
        commitBody.originalPath = originalPath;
        commitBody.originalSha = originalSha;
      } else {
        commitBody.sha = originalSha;
      }

      const resp = await fetch(`${API_BASE}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commitBody),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Commit failed (${resp.status})`);
      }

      const result = await resp.json().catch(() => ({}));

      const newSha = result?.content?.sha || loadedPost.sha || null;

      setSubmitSuccess('Post updated successfully.');
      setSubmitError(null);
      setUpdatedAt(now);
      setLoadedPost({ content: basePost, sha: newSha, path: newPath });
      setSelectedPath(newPath);

      if (isRename) {
        setFiles((prev) => {
          const updated = prev.map((item) =>
            item.path === originalPath
              ? { ...item, path: newPath, name: newPath.split('/').pop() || item.name }
              : item
          );
          const hasNewPath = updated.some((item) => item.path === newPath);
          if (!hasNewPath) {
            updated.push({ path: newPath, name: newPath.split('/').pop() || newPath, download_url: '' });
          }
          return updated;
        });
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save changes');
      setSubmitSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    if (!loadedPost) {
      setSubmitError('Select a post to delete');
      return;
    }

    if (!loadedPost.sha) {
      setSubmitError('Cannot delete: missing file SHA. Reload the post and try again.');
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(null);
    setShowDeleteConfirm(true);
  };

  const performDelete = async () => {
    if (!loadedPost) return;

    setIsSubmitting(true);

    try {
      const deleteBody = {
        path: loadedPost.path,
        message: `Delete post: ${loadedPost.content.title || loadedPost.path}`,
        sha: loadedPost.sha,
      };

      const resp = await fetch(`${API_BASE}/commit`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteBody),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Delete failed (${resp.status})`);
      }

      await resp.json().catch(() => ({}));

      setSubmitSuccess('Post deleted successfully.');
      setSelectedPath('');
      setLoadedPost(null);
      resetForm();
      setFiles((prev) => prev.filter((item) => item.path !== loadedPost.path));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to delete post');
      setSubmitSuccess(null);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="new-post-container">
      <h2>Modify Existing Post</h2>

      {loadingList ? (
        <p>Loading posts…</p>
      ) : listError ? (
        <div className="error-message">{listError}</div>
      ) : (
        <div className="form-row">
          <label htmlFor="post-select">Select post to edit</label>
          <select
            id="post-select"
            value={selectedPath}
            onChange={(e) => loadPost(e.target.value)}
          >
            <option value="">-- Choose a post --</option>
            {files.map((file) => (
              <option key={file.path} value={file.path}>
                {file.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loadingPost && <p>Loading post data…</p>}
      {postError && <div className="error-message">{postError}</div>}

      {loadedPost && postType && !loadingPost && (
        <form className="new-post-form" onSubmit={handleSubmit}>
          <div className="info-banner">
            <p><strong>Type:</strong> {postType}</p>
            <p><strong>Created:</strong> {formatDateTime(createdAt)}</p>
            <p><strong>Last updated:</strong> {formatDateTime(updatedAt)}</p>
          </div>

          <div className="form-row">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-row checkbox-row">
            <label htmlFor="is-active">Active</label>
            <input
              id="is-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </div>

          <div className="form-row">
            <label htmlFor="text">Text / Body</label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={14}
            />
          </div>

          {postType === 'Lines' && (
            <>
              <div className="form-row">
                <label htmlFor="images">Image URLs (comma separated)</label>
                <input
                  id="images"
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="image-width">Preferred Image Width</label>
                <input
                  id="image-width"
                  type="text"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                />
              </div>
            </>
          )}

          {postType === 'Sound' && (
            <>
              <div className="form-row">
                <label htmlFor="sound-images">Image URLs (comma separated)</label>
                <input
                  id="sound-images"
                  type="text"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="sound-image-width">Preferred Image Width</label>
                <input
                  id="sound-image-width"
                  type="text"
                  value={imageWidth}
                  onChange={(e) => setImageWidth(e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="sound-audio-url">Audio URL</label>
                <input
                  id="sound-audio-url"
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="form-row">
                <label htmlFor="sound-audio-embed">Audio Embed HTML</label>
                <textarea
                  id="sound-audio-embed"
                  value={audioEmbed}
                  onChange={(e) => setAudioEmbed(e.target.value)}
                  rows={5}
                  placeholder="Paste Bandcamp or SoundCloud iframe"
                />
              </div>
            </>
          )}

          {postType === 'Motion' && (
            <div className="form-row">
              <label htmlFor="motion-video-url">Video URL</label>
              <input
                id="motion-video-url"
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          {postType === 'About' && (
            <>
              <div className="form-row">
                <label htmlFor="about-instagram">Instagram URL</label>
                <input
                  id="about-instagram"
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="form-row">
                <label htmlFor="about-substack">Substack URL</label>
                <input
                  id="about-substack"
                  type="url"
                  value={substackUrl}
                  onChange={(e) => setSubstackUrl(e.target.value)}
                  placeholder="https://substack.com/@..."
                />
              </div>
            </>
          )}

          <div className="form-row">
            <label htmlFor="metadata">Metadata (JSON)</label>
            <textarea
              id="metadata"
              value={metadataText}
              onChange={(e) => setMetadataText(e.target.value)}
              rows={8}
            />
            {metadataError && <p className="error-message">{metadataError}</p>}
          </div>

          <div className="form-actions">
            <div className="button-row">
              <button type="submit" disabled={isSubmitting || !selectedPath}>
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={handleDeleteClick}
                disabled={isSubmitting || !selectedPath || !loadedPost?.sha || postType === 'About'}
              >
                Delete Post
              </button>
            </div>
            {submitError && <p className="error-message">{submitError}</p>}
            {submitSuccess && <p className="success-message">{submitSuccess}</p>}
          </div>
        </form>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3>Delete this post?</h3>
            <p>
              You are about to permanently remove “{loadedPost?.content.title ?? 'this post'}”.
              This action is irreversible. Are you sure you want to continue?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="delete-button"
                onClick={performDelete}
                disabled={isSubmitting}
              >
                Yes, delete this post
              </button>
              <button
                type="button"
                className="btn"
                onClick={cancelDelete}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifyPost;
