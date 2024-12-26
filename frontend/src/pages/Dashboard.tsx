import { useAuth } from '@hooks/useAuth';
import { logoutUser } from '@services/authService';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logoutUser();
      setAccessToken(null);
      navigate('/login');
    } catch (error) {
      setAccessToken(null);
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Welcome to the Dashboard Page!</h1>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
