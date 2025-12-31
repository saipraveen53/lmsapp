import axios from 'axios';

const BASE_URL = 'http://192.168.0.139:8080';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    
    if (!config.headers['Authorization']) {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await api.post('/api/auth/refresh-token');
        const { accessToken } = res.data;

        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('accessToken', accessToken);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('userRole');
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;