import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("accessToken");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance: AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 30000,  // Increased to 30 seconds to prevent "Canceled" errors
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      const token: string | null = await getToken();
      
      if (token) {
        // Remove quotes if present to avoid 401/403 errors
        const cleanToken = token.replace(/^"|"$/g, '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
  );

  return instance;
};

// Existing Services
export const rootApi: AxiosInstance = createAxiosInstance("http://192.168.0.130:8080");
export const CourseApi: AxiosInstance = createAxiosInstance("http://192.168.0.249:8088");

// NEW: Quiz Microservice (Port 8081)
export const QuizApi: AxiosInstance = createAxiosInstance("http://192.168.0.130:8082");