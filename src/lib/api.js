import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.idToken) {
      config.headers.Authorization = `Bearer ${config.idToken}`;
      delete config.idToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      console.error('API Error Response:', error.response.data);
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      console.error('API Error Request:', error.request);
      throw new Error('API Error: No response received from server.');
    } else {
      console.error('API Error Message:', error.message);
      throw new Error(`API Error: ${error.message}`);
    }
  }
);

export default api;
