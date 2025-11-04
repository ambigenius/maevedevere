import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import AdminPage from './AdminPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
