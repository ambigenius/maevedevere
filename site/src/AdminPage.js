import React from 'react';
import { Link } from 'react-router-dom';
import NewPost from './NewPost.tsx';
import './App.css';

function AdminPage() {
  return (
    <div>
      <Link 
        to="/"
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
          zIndex: 1000,
          textDecoration: 'none',
          display: 'inline-block'
        }}
      >
        ← Back to Home
      </Link>
      <NewPost />
    </div>
  );
}

export default AdminPage;

