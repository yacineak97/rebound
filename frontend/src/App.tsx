import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import Home from '@pages/Home';
import Login from '@pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route index element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
