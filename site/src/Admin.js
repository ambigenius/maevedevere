import React from 'react';
import './App.css';







export async function listByType(type) {
    const res = await fetch(
      `https://api.github.com/repos/ambigenius/mdvbackend/contents/${type}`
    );
    if (!res.ok) throw new Error('GitHub list failed');
    return res.json(); // array of items with .download_url
  }
  export async function fetchPost(downloadUrl) {
    const res = await fetch(downloadUrl);
    if (!res.ok) throw new Error('GitHub raw fetch failed');
    return res.json();
  }