import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage.tsx';
import AdminPage from './AdminPage';
import ModifyPost from './ModifyPost.tsx';
import { getApiBase } from './config.ts';

function AdminAuthGate({ children }) {
  const location = useLocation();
  const isAdminRoute = useMemo(
    () => location.pathname.startsWith('/admin'),
    [location.pathname]
  );
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch(`${getApiBase()}/admin/session`, {
        credentials: 'include',
      });
      setIsAuthenticated(response.ok);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdminRoute) {
      setIsCheckingSession(false);
      return;
    }
    setIsCheckingSession(true);
    checkSession();
  }, [checkSession, isAdminRoute]);

  if (!isAdminRoute) {
    return children;
  }

  const handleLogout = async () => {
    try {
      await fetch(`${getApiBase()}/admin/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setIsAuthenticated(false);
      setSubmitted(false);
      setPassword('');
    }
  };

  if (isCheckingSession) {
    return (
      <div className="auth-gate">
        <div className="auth-card">
          <h2>Checking session…</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const handleSubmit = async (event) => {
      event.preventDefault();
      setSubmitted(true);
      try {
        const response = await fetch(`${getApiBase()}/admin/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ password }),
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);
        setPassword('');
      } catch {
        setIsAuthenticated(false);
      }
    };

    return (
      <div className="auth-gate">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Admin Access</h2>
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {submitted && !isAuthenticated && (
            <p className="error">Incorrect password. Try again.</p>
          )}
          <button type="submit">Enter</button>
        </form>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLogout}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#444',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1001,
        }}
      >
        Logout
      </button>
      {children}
    </>
  );
}

function App() {
  return (
    <AdminAuthGate>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/modify" element={<ModifyPost />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AdminAuthGate>
  );
}

export default App;
