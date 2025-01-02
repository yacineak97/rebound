import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import Login from '@pages/Login';
import Dashboard from '@pages/Dashboard';
import PrivateRoutes from '@routes/PrivateRoutes';
import NotFound from '@pages/NotFound';
// import Home from '@pages/Home';
import { useAuth } from '@hooks/useAuth';
import { useEffect } from 'react';
import Register from '@pages/Register';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';


function AppRoutes() {
  const { loading, setLoading, accessToken, setAccessToken } = useAuth();
  useEffect(() => {
    if (!loading) {
      setLoading(loading);
    }
  }, [loading, setLoading]);

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
    }
  }, [accessToken, setAccessToken]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={80} />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={accessToken ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={accessToken ? <Navigate to="/dashboard" /> : <Register />}
        />

        <Route element={<PrivateRoutes />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add any nested routes here */}
          {/* <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectDetail />} /> */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
