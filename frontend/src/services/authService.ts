import { axiosPrivate } from '@api/axios';

const API_URL = 'http://localhost:8080';

// Call login API
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axiosPrivate.post(
      `${API_URL}/auth/login`,
      { email, password },
      {
        withCredentials: true,
      }
    );

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const logoutUser = async () => {
  try {
    await axiosPrivate.post(`${API_URL}/delete-cookie`);
  } catch (error) {
    return Promise.reject(error);
  }
};
