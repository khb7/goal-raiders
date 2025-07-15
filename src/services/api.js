import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  (config) => {
    // idToken을 직접 api.js에서 가져올 수 없으므로,
    // 각 요청 시 config.headers.Authorization에 idToken을 직접 설정하도록 합니다.
    // 예: api.get('/goals', { headers: { Authorization: `Bearer ${idToken}` } });
    // 또는, 컴포넌트에서 api 호출 시 idToken을 인자로 넘겨주는 기존 방식을 유지합니다.
    // 여기서는 기존 방식을 유지하되, idToken이 config에 포함되어 있다면 헤더에 추가합니다.
    if (config.idToken) {
      config.headers.Authorization = `Bearer ${config.idToken}`;
      delete config.idToken; // Remove custom property
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      console.error('API Error Status:', error.response.status);
      console.error('API Error Headers:', error.response.headers);
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error Request:', error.request);
      throw new Error('API Error: No response received from server.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error Message:', error.message);
      throw new Error(`API Error: ${error.message}`);
    }
  }
);

export default api;