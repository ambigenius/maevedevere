import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage.tsx';
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
