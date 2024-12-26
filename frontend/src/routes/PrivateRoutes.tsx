import { useAuth } from '@hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoutes: React.FC = () => {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoutes;
