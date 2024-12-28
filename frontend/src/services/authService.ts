import axios, { axiosPrivate } from '@api/axios';

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axiosPrivate.post(
      '/auth/login',
      { email, password },
    );

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const logoutUser = async () => {
  try {
    await axiosPrivate.post('/delete-cookie');
  } catch (error) {
    return Promise.reject(error);
  }
};

export const registerUser = async (firstname: string, lastname: string, email: string, password: string) => {
  try {
    const response = await axiosPrivate.post(
      '/auth/register',
      { firstname, lastname, email, password },
    );

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};
