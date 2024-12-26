import {
  createContext,
  useState,
  ReactNode,
  useEffect,
  useLayoutEffect,
} from 'react';
import axios, { axiosPrivate } from '@api/axios';

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchToken = async () => {
      try {
        const response = await axiosPrivate.post('/auth/refreshToken', {
          signal: controller.signal,
        });
        setLoading(false);
        setAccessToken(response.data.accessToken);
      } catch (err) {
        console.log(err);
        setLoading(false);
        setAccessToken(null);
      }
    };

    fetchToken();

    return () => {
      controller.abort();
    };
  }, []);

  useLayoutEffect(() => {
    const authInterceptor = axiosPrivate.interceptors.request.use((config) => {
      config.headers.Authorization =
        !config._retry && accessToken
          ? `Bearer ${accessToken}`
          : config.headers.Authorization;
      return config;
    });

    return () => {
      axiosPrivate.interceptors.request.eject(authInterceptor);
    };
  }, [accessToken]);

  useLayoutEffect(() => {
    const refreshInterceptor = axiosPrivate.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          error.response?.statusText === 'Unauthorized' &&
          !originalRequest._retry
        ) {
          try {
            const response = await axios.post(
              '/auth/refreshToken',
              {},
              {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
              }
            );

            setAccessToken(response.data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            originalRequest._retry = true;

            return axiosPrivate(originalRequest);
          } catch (err) {
            console.log(err);
            setAccessToken(null);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.response.eject(refreshInterceptor);
    };
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken, loading, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
