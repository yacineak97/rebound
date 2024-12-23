// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import {
  loginUser,
  logoutUser,
  // refreshAccessToken,
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
} from '../services/authService';

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Get tokens from cookies when the app loads
    const token = getAccessTokenFromCookie();
    const refresh = getRefreshTokenFromCookie();
    if (token && refresh) {
      setAccessToken(token);
      setRefreshToken(refresh);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await loginUser(username, password);
      const token = getAccessTokenFromCookie();
      const refresh = getRefreshTokenFromCookie();
      setAccessToken(token);
      setRefreshToken(refresh);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      setIsAuthenticated(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
  };

  const refresh = async () => {
    try {
      // const data = await refreshAccessToken();
      const newAccessToken = getAccessTokenFromCookie();
      setAccessToken(newAccessToken);
      setRefreshToken(getRefreshTokenFromCookie());
    } catch (error) {
      console.error('Failed to refresh token:', error);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        isAuthenticated,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
