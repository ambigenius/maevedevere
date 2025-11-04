// server.js
const express = require('express');
const fetch = require('node-fetch'); // if Node < 18; else remove and use global fetch
const app = express();

const PORT = process.env.PORT || 3001;
const OWNER = 'ambigenius';
const REPO = 'mdvbackend';

// parse JSON bodies
app.use(express.json());

// CORS only needed if you DON'T use CRA proxy
// const cors = require('cors');
// app.use(cors({ origin: 'http://localhost:3000' }));

app.post('/api/commit', async (req, res) => {
  try {
    const token = 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;
    if (!token) {
      return res.status(500).json({ error: 'GITHUB_TOKEN missing on server' });
    }

    const { path, contentJson, message, sha } = req.body;
    if (!path || !contentJson || !message) {
      return res.status(400).json({ error: 'path, contentJson, and message are required' });
    }

    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;

    const contentBase64 = Buffer.from(
      JSON.stringify(contentJson, null, 2),
      'utf8'
    ).toString('base64');

    const resp = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message,
        content: contentBase64,
        sha: sha || undefined,
        committer: { name: 'Site Bot', email: 'bot@example.com' }
      })
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json(data);
    }

    res.json(data); // includes commit info and content html_url when present
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
