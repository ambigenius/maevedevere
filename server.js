// server.js
const express = require('express');
const path = require('path');
// Load environment variables from vars.env at project root
require('dotenv').config({ path: path.join(__dirname, 'vars.env') });
const cors = require('cors');
const { fetch } = require('undici'); 
const app = express();

const PORT = process.env.PORT || 3001;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || 'http://localhost:3000';
const OWNER = process.env.GITHUB_OWNER || 'ambigenius';
const REPO = process.env.GITHUB_REPO || 'mdvbackend';

// Log all incoming requests - add this FIRST to catch everything
app.use((req, res, next) => {
  console.log('\n=== INCOMING REQUEST ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('URL:', req.url);
  console.log('Original URL:', req.originalUrl);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query:', req.query);
  console.log('========================\n');
  next();
});

// parse JSON bodies
app.use(express.json());

// Configure CORS to allow connections from configured origin
app.use(cors({
  origin: ALLOW_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add headers to help with CSP and cross-origin requests
app.use((req, res, next) => {
  // Set headers that help with Content Security Policy
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper function to get GitHub API headers
function getGitHubHeaders() {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN not configured');
  }
  return {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

// Helper function to handle GitHub API errors
async function handleGitHubError(resp, context) {
  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({ message: resp.statusText }));
    console.error(`ERROR: GitHub API error in ${context}`);
    console.error(`Status: ${resp.status}`);
    console.error(`Response:`, JSON.stringify(errorData, null, 2));
    
    if (resp.status >= 400 && resp.status < 500) {
      return { status: resp.status, data: errorData };
    } else {
      return { status: 502, data: { error: 'GitHub API error', message: errorData.message || 'Bad gateway' } };
    }
  }
  return null;
}

// Test route to verify server is receiving requests
app.get('/api/test', (req, res) => {
  console.log('=== GET /api/test route called ===');
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// GET /api/list?folder=Words|Lines|Motion|Sound|All
app.get('/api/list', async (req, res) => {
  console.log('\n=== GET /api/list route handler EXECUTING ===');
  console.log('Query params:', req.query);
  
  try {
    const { folder } = req.query;
    
    if (!folder) {
      console.error('ERROR: Missing required query parameter: folder');
      return res.status(400).json({ error: 'Missing required query parameter: folder' });
    }

    const validFolders = ['Words', 'Lines', 'Motion', 'Sound', 'All'];
    if (!validFolders.includes(folder)) {
      console.error(`ERROR: Invalid folder value: ${folder}`);
      return res.status(400).json({ 
        error: 'Invalid folder value', 
        validValues: validFolders 
      });
    }

    if (!GITHUB_TOKEN) {
      console.error('ERROR: GITHUB_TOKEN not configured');
      return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
    }

    const foldersToFetch = folder === 'All' 
      ? ['Words', 'Lines', 'Motion', 'Sound'] 
      : [folder];

    console.log(`Fetching folders: ${foldersToFetch.join(', ')}`);

    const allFiles = [];
    const headers = getGitHubHeaders();

    for (const folderName of foldersToFetch) {
      const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(folderName)}`;
      console.log(`Fetching: ${apiUrl}`);

      try {
        const resp = await fetch(apiUrl, { headers });
        const error = await handleGitHubError(resp, `list/${folderName}`);
        
        if (error) {
          console.error(`Failed to fetch ${folderName}:`, error.status);
          // Continue with other folders even if one fails
          continue;
        }

        const data = await resp.json();
        console.log(`Received ${Array.isArray(data) ? data.length : 0} items from ${folderName}`);

        // Filter for .json files only
        const jsonFiles = (Array.isArray(data) ? data : [])
          .filter(item => item.type === 'file' && item.name.endsWith('.json'))
          .map(item => ({
            path: item.path,
            name: item.name,
            download_url: item.download_url
          }));

        console.log(`Found ${jsonFiles.length} JSON files in ${folderName}`);
        allFiles.push(...jsonFiles);
      } catch (err) {
        console.error(`Error fetching ${folderName}:`, err.message);
        // Continue with other folders
      }
    }

    console.log(`Total files found: ${allFiles.length}`);
    res.json(allFiles);

  } catch (err) {
    console.error('=== ERROR in /api/list ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Unexpected server error',
      message: err.message
    });
  }
});

// GET /api/file?path=<url-encoded path>
app.get('/api/file', async (req, res) => {
  console.log('=== GET /api/file ===');
  console.log('Query params:', req.query);
  
  try {
    const { path: filePath } = req.query;
    
    if (!filePath) {
      console.error('ERROR: Missing required query parameter: path');
      return res.status(400).json({ error: 'Missing required query parameter: path' });
    }

    if (!GITHUB_TOKEN) {
      console.error('ERROR: GITHUB_TOKEN not configured');
      return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
    }

    const decodedPath = decodeURIComponent(filePath);
    console.log(`Fetching file: ${decodedPath}`);

    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(decodedPath)}`;
    console.log(`GitHub API URL: ${apiUrl}`);

    const headers = getGitHubHeaders();
    const resp = await fetch(apiUrl, { headers });
    
    const error = await handleGitHubError(resp, `file/${decodedPath}`);
    if (error) {
      return res.status(error.status).json(error.data);
    }

    const data = await resp.json();
    
    if (data.type !== 'file') {
      console.error(`ERROR: Path is not a file: ${decodedPath}`);
      return res.status(400).json({ error: 'Path is not a file', path: decodedPath });
    }

    if (!data.content) {
      console.error(`ERROR: File has no content: ${decodedPath}`);
      return res.status(400).json({ error: 'File has no content', path: decodedPath });
    }

    // Decode base64 content
    let decodedContent;
    try {
      const contentBuffer = Buffer.from(data.content, 'base64');
      decodedContent = contentBuffer.toString('utf8');
      console.log(`Decoded content length: ${decodedContent.length}`);
    } catch (err) {
      console.error(`ERROR: Failed to decode base64 content:`, err.message);
      return res.status(400).json({ error: 'Failed to decode file content', path: decodedPath });
    }

    // Parse JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(decodedContent);
      console.log(`Successfully parsed JSON for: ${decodedPath}`);
    } catch (err) {
      console.error(`ERROR: Failed to parse JSON:`, err.message);
      return res.status(400).json({ 
        error: 'Failed to parse JSON content', 
        path: decodedPath,
        message: err.message 
      });
    }

    res.json(parsedContent);

  } catch (err) {
    console.error('=== ERROR in /api/file ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Unexpected server error',
      message: err.message
    });
  }
});

// GET /api/about
app.get('/api/about', async (req, res) => {
  console.log('\n=== GET /api/about route handler EXECUTING ===');
  
  try {
    if (!GITHUB_TOKEN) {
      console.error('ERROR: GITHUB_TOKEN not configured');
      return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });
    }

    const aboutPath = 'About/about.json';
    console.log(`Fetching about file: ${aboutPath}`);

    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(aboutPath)}`;
    console.log(`GitHub API URL: ${apiUrl}`);

    const headers = getGitHubHeaders();
    const resp = await fetch(apiUrl, { headers });
    
    const error = await handleGitHubError(resp, `about`);
    if (error) {
      return res.status(error.status).json(error.data);
    }

    const data = await resp.json();
    
    if (data.type !== 'file') {
      console.error(`ERROR: About path is not a file: ${aboutPath}`);
      return res.status(400).json({ error: 'About path is not a file', path: aboutPath });
    }

    if (!data.content) {
      console.error(`ERROR: About file has no content: ${aboutPath}`);
      return res.status(400).json({ error: 'About file has no content', path: aboutPath });
    }

    // Decode base64 content
    let decodedContent;
    try {
      const contentBuffer = Buffer.from(data.content, 'base64');
      decodedContent = contentBuffer.toString('utf8');
      console.log(`Decoded about content length: ${decodedContent.length}`);
    } catch (err) {
      console.error(`ERROR: Failed to decode base64 content:`, err.message);
      return res.status(400).json({ error: 'Failed to decode about file content', path: aboutPath });
    }

    // Parse JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(decodedContent);
      console.log(`Successfully parsed about JSON`);
    } catch (err) {
      console.error(`ERROR: Failed to parse JSON:`, err.message);
      return res.status(400).json({ 
        error: 'Failed to parse about JSON content', 
        path: aboutPath,
        message: err.message 
      });
    }

    res.json(parsedContent);

  } catch (err) {
    console.error('=== ERROR in /api/about ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Unexpected server error',
      message: err.message
    });
  }
});

// Main commit route - verify path matches exactly: /api/commit
app.post('/api/commit', async (req, res) => {
  console.log('\n=== POST /api/commit route handler called ===');
  console.log('Request received at:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  console.log('Request URL:', req.url);
  console.log('Expected path: /api/commit');
  console.log('Path matches:', req.path === '/api/commit');
  
  try {
    console.log('--- Step 1: Checking token ---');
    const token = GITHUB_TOKEN;
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);
    
    if (!token) {
      console.error('ERROR: GITHUB_TOKEN missing on server');
      console.error('Please check vars.env file and ensure GITHUB_TOKEN is set');
      return res.status(500).json({ error: 'GITHUB_TOKEN missing on server' });
    }

    console.log('--- Step 2: Parsing request body ---');
    console.log('Full request body:', JSON.stringify(req.body, null, 2));
    const { path, contentJson, message, sha } = req.body;
    console.log('Extracted values:');
    console.log('  - path:', path);
    console.log('  - message:', message);
    console.log('  - sha:', sha);
    console.log('  - contentJson type:', typeof contentJson);
    console.log('  - contentJson keys:', contentJson ? Object.keys(contentJson) : 'null');

    console.log('--- Step 3: Validating required fields ---');
    if (!path || !contentJson || !message) {
      console.error('ERROR: Missing required fields');
      console.log('  - path exists:', !!path);
      console.log('  - contentJson exists:', !!contentJson);
      console.log('  - message exists:', !!message);
      return res.status(400).json({ error: 'path, contentJson, and message are required' });
    }
    console.log('✓ All required fields present');

    console.log('--- Step 4: Building GitHub API URL ---');
    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;
    console.log('GitHub API URL:', apiUrl);
    console.log('Owner:', OWNER);
    console.log('Repo:', REPO);
    console.log('Encoded path:', encodeURIComponent(path));

    console.log('--- Step 5: Encoding content to base64 ---');
    const contentString = JSON.stringify(contentJson, null, 2);
    console.log('Content string length:', contentString.length);
    const contentBase64 = Buffer.from(contentString, 'utf8').toString('base64');
    console.log('Base64 content length:', contentBase64.length);
    console.log('✓ Content encoded successfully');

    console.log('--- Step 6: Preparing GitHub API request ---');
    const requestBody = {
      message,
      content: contentBase64,
      sha: sha || undefined,
      committer: { name: 'Site Bot', email: 'bot@example.com' }
    };
    console.log('Request body (without content):', {
      ...requestBody,
      content: `[base64 string, length: ${requestBody.content.length}]`
    });
    console.log('Making GitHub API call...');

    console.log('--- Step 7: Calling GitHub API ---');
    console.log('Authorization header (first 20 chars):', `Bearer ${token.substring(0, 20)}...`);
    const resp = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify(requestBody)
    });
    console.log('GitHub API response status:', resp.status);
    console.log('GitHub API response statusText:', resp.statusText);

    console.log('--- Step 8: Parsing GitHub API response ---');
    const data = await resp.json();
    console.log('GitHub API response data:', JSON.stringify(data, null, 2));
    
    if (!resp.ok) {
      console.error('ERROR: GitHub API returned error status');
      console.error('Status:', resp.status);
      console.error('Response:', data);
      return res.status(resp.status).json(data);
    }

    console.log('--- Step 9: Success! Returning response ---');
    console.log('✓ Commit successful');
    res.json(data); // includes commit info and content html_url when present
  } catch (err) {
    console.error('=== ERROR in /api/commit route handler ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error name:', err.name);
    if (err.cause) {
      console.error('Error cause:', err.cause);
    }
    res.status(500).json({ 
      error: 'Unexpected server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Catch-all route for debugging - helps identify if route isn't found
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Route not found', 
    method: req.method, 
    path: req.path,
    availableRoutes: [
      'GET /api/test',
      'GET /api/list?folder=Words|Lines|Motion|Sound|All',
      'GET /api/file?path=<url-encoded-path>',
      'GET /api/about',
      'POST /api/commit'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  console.log(`CORS enabled for: ${ALLOW_ORIGIN}`);
  console.log(`Environment file: vars.env`);
  console.log(`GitHub Owner: ${OWNER}`);
  console.log(`GitHub Repo: ${REPO}`);
  console.log(`GitHub Token configured: ${GITHUB_TOKEN ? 'Yes' : 'No'}`);
});
