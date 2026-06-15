import axios, { AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1/acrg',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('acrg_auth');
    if (authData) {
      try {
        const { token } = JSON.parse(authData);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // failed to parse
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('acrg_auth');
      window.location.href = '/login';
    }

    const rawError = (error.response?.data as any)?.error;
    const message =
      rawError?.message ||
      (typeof rawError === 'string' ? rawError : undefined) ||
      error.message ||
      'An unexpected error occurred';

    const errorPayload = {
      code: error.response?.status || 500,
      message,
      details: rawError?.details || (error.response?.data as any)?.details || null,
    };

    return Promise.reject(errorPayload);
  }
);
