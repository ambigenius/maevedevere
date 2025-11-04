import React, { useState } from 'react';
import './App.css';
import NewPost from './NewPost.tsx';

function App() {
  const [showNewPost, setShowNewPost] = useState(false);

  if (showNewPost) {
    return (
      <div>
        <button 
          onClick={() => setShowNewPost(false)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          ← Back
        </button>
        <NewPost />
      </div>
    );
  }

  return (
    <div className="App">
      <button 
        onClick={() => setShowNewPost(true)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        New Post
      </button>
      <main>
        <div className="flex-container">
          <div className="row-buffer"></div>
          <div className="left-sections">
            <section>
              <h2 className="section-subtitle">Words</h2>
              {/* Placeholder for words content */}
            </section>
            <section>
              <h2 className="section-subtitle">Lines</h2>
              {/* Placeholder for lines content */}
            </section>
            <section>
              <h2 className="section-subtitle">Motion</h2>
              {/* Placeholder for motion content */}
            </section>
            <section>
              <h2 className="section-subtitle">Sound</h2>
              {/* Placeholder for sound content */}
            </section>
          </div>
          <div className="right-wrapper">
            <div style={{ display: "flex", alignItems: "center" }}>
              <span className="divider-bar">|</span>
            </div>
            <section>
              <h2 className="section-subtitle">All</h2>
              {/* Placeholder for All tag */}
            </section>
            <section>
              <h2 className="section-subtitle">About</h2>
              {/* Placeholder for about section */}
            </section>
          </div>
          <div className="row-buffer"></div>
        </div>
      </main>
    </div>
  );
}

export default App;
