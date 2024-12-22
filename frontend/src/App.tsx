import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '@pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route index element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
