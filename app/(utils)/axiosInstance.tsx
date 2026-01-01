import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';

const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("accessToken");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

const handleLogout = async () => {
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('userRole');
  
  // Platform specific alerts
  if (Platform.OS === 'web') {
    alert('Session Expired: You have logged in on another device.');
    window.location.href = '/'; 
  } else {
    Alert.alert('Session Expired', 'You have logged in on another device.');
    router.replace('/'); 
  }
};

const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance: AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 30000, 
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      const token: string | null = await getToken();
      
      if (token) {
        const cleanToken = token.replace(/^"|"$/g, '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response && error.response.status === 401) {
        console.log("Session Expired or Unauthorized - Logging out...");
        await handleLogout();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const rootApi: AxiosInstance = createAxiosInstance("http://192.168.0.139:8080");
export const CourseApi: AxiosInstance = createAxiosInstance("http://192.168.0.139:8088");
export const QuizApi: AxiosInstance = createAxiosInstance("http://192.168.0.139:8082");