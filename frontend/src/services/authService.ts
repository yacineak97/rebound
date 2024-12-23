/* eslint-disable no-useless-concat */
// src/services/authService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080'; // Replace with your API URL

// Call login API
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      { email: username, password },
      {
        withCredentials: true, // Allow the API to send cookies back (access token, refresh token)
      }
    );
    console.log('ssssssss   ', response.data);

    return response.data; // The server will automatically set the HttpOnly cookies
  } catch (error) {
    console.log('ssssssss   ', error);
    throw new Error('Login failed. Please check your credentials.');
  }
};

// Call logout API
export const logoutUser = async () => {
  try {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    // The server should handle clearing the HttpOnly cookies on logout
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Refresh the access token using the refresh token stored in cookies
export const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/refresh-token`,
      {},
      {
        withCredentials: true, // Allow sending the refresh token from cookies
      }
    );
    return response.data; // The server will return a new access token
  } catch (error) {
    throw new Error('Failed to refresh token.');
  }
};

// Get the access token from the cookie (not directly accessible from JS)
export const getAccessTokenFromCookie = () => {
  const match = document.cookie.match(
    new RegExp('(^| )' + 'accessToken' + '=([^;]+)')
  );
  return match ? match[2] : null;
};

// Get the refresh token from the cookie (not directly accessible from JS)
export const getRefreshTokenFromCookie = () => {
  const match = document.cookie.match(
    new RegExp('(^| )' + 'refreshToken' + '=([^;]+)')
  );
  return match ? match[2] : null;
};
