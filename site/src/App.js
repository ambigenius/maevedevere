import React, { useMemo, useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage.tsx';
import AdminPage from './AdminPage';
import ModifyPost from './ModifyPost.tsx';

function AdminAuthGate({ children }) {
  const location = useLocation();
  const isAdminRoute = useMemo(
    () => location.pathname.startsWith('/admin'),
    [location.pathname]
  );
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isAdminRoute) {
    return children;
  }

  if (!submitted || password !== 'nevayroad4eva') {
    const handleSubmit = (event) => {
      event.preventDefault();
      setSubmitted(true);
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
          {submitted && password !== 'nevayroad4eva' && (
            <p className="error">Incorrect password. Try again.</p>
          )}
          <button type="submit">Enter</button>
        </form>
      </div>
    );
  }

  return children;
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
