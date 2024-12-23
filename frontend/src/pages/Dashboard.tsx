// src/pages/Home.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { accessToken, refreshToken, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      <h1>Welcome to the Dashboard Page!</h1>
      {accessToken && <p>Access Token: {accessToken}</p>}
      {refreshToken && <p>Refresh Token: {refreshToken}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
