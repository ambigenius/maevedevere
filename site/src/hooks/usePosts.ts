import { useState, useEffect, useCallback } from 'react';
import type { Section, AnyPost, About } from '../types/content';
import { parseIsoDateFields } from '../types/content';

const API_BASE = 'http://localhost:3001/api';

interface FileListItem {
  path: string;
  name: string;
  download_url: string;
}

interface UsePostsResult {
  posts: AnyPost[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface UseAboutResult {
  about: About | null;
  loading: boolean;
  error: string | null;
}

// Default export: usePosts hook
export default function usePosts(section: Section): UsePostsResult {
  const [posts, setPosts] = useState<AnyPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  const reload = useCallback(() => {
    setReloadTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Skip if section is 'About' - that's handled by useAbout
    if (section === 'About') {
      setLoading(false);
      setPosts([]);
      return;
    }

    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      setError(null);

      try {
        // Step 1: List files for the section
        const folderParam = section === 'All' ? 'All' : section;
        const listUrl = `${API_BASE}/list?folder=${encodeURIComponent(folderParam)}`;
        
        console.log(`Fetching file list for section: ${section}`);
        const listResponse = await fetch(listUrl);
        
        if (!listResponse.ok) {
          const errorData = await listResponse.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Failed to fetch file list: ${listResponse.status}`);
        }

        const fileList: FileListItem[] = await listResponse.json();
        console.log(`Found ${fileList.length} files for section: ${section}`);

        if (cancelled) return;

        // Step 2: Fetch each file in parallel
        const filePromises = fileList.map(async (file) => {
          const fileUrl = `${API_BASE}/file?path=${encodeURIComponent(file.path)}`;
          const fileResponse = await fetch(fileUrl);
          
          if (!fileResponse.ok) {
            const errorData = await fileResponse.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`Failed to fetch file ${file.path}: ${errorData.error || fileResponse.status}`);
          }

          const fileData = await fileResponse.json();
          return fileData;
        });

        const fetchedPosts = await Promise.all(filePromises);
        
        if (cancelled) return;

        // Step 3: Parse ISO date strings to Date objects
        const dateFields = ['date', 'createdAt', 'updatedAt'];
        const parsedPosts = fetchedPosts.map(post => 
          parseIsoDateFields(post, dateFields)
        ) as AnyPost[];

        // Step 4: Filter out inactive posts
        const activePosts = parsedPosts.filter(post => post.isActive === true);

        // Step 5: Sort descending by date
        const sortedPosts = activePosts.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(a.date);
          const dateB = b.date instanceof Date ? b.date : new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });

        console.log(`Loaded ${sortedPosts.length} active posts for section: ${section}`);
        setPosts(sortedPosts);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          console.error(`Error fetching posts for section ${section}:`, errorMessage);
          setError(errorMessage);
          setPosts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      cancelled = true;
    };
  }, [section, reloadTrigger]);

  return { posts, loading, error, reload };
}

// Named export: useAbout hook
export function useAbout(): UseAboutResult {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAbout() {
      setLoading(true);
      setError(null);

      try {
        const aboutUrl = `${API_BASE}/about`;
        console.log('Fetching about page');
        
        const response = await fetch(aboutUrl);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Failed to fetch about: ${response.status}`);
        }

        const aboutData = await response.json();
        
        if (cancelled) return;

        // Parse ISO date strings to Date objects
        const dateFields = ['date', 'createdAt', 'updatedAt'];
        const parsedAbout = parseIsoDateFields(aboutData, dateFields) as About;

        console.log('Loaded about page');
        setAbout(parsedAbout);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
          console.error('Error fetching about:', errorMessage);
          setError(errorMessage);
          setAbout(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAbout();

    return () => {
      cancelled = true;
    };
  }, []);

  return { about, loading, error };
}

