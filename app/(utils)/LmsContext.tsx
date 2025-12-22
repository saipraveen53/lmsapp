import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { jwtDecode } from "jwt-decode";
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from './api';

interface User {
  accessToken: string;
  email?: string;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface LmsContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  register: (userData: any) => Promise<AuthResponse>;
  logout: () => void;
}

const Context = createContext<LmsContextType | undefined>(undefined);

export const useLms = () => {
  const context = useContext(Context);
  if (!context) throw new Error('useLms must be used within LmsContext');
  return context;
};

const LmsContext = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const role = await AsyncStorage.getItem('userRole');
        
        if (token && role) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser({ accessToken: token, role: role });
          const inAuthGroup = segments[0] === '(auth)' || segments.length === 0;
          if (inAuthGroup) redirectBasedOnRole(role);
        }
      } catch (e) {
        console.log("Failed to load token", e);
      }
    };
    loadUser();
  }, []);

  const redirectBasedOnRole = (role: string) => {
    const normalizedRole = role ? role.toUpperCase() : '';
    if (normalizedRole.includes('ADMIN')) {
      router.replace('/(admin)/Dashboard');
    } else {
      router.replace('/(student)/Home');
    }
  };

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password: pass });
      const { accessToken } = res.data;
      
      const decoded: any = jwtDecode(accessToken);
      let userRole = 'STUDENT';
      
      if (decoded.roles && Array.isArray(decoded.roles) && decoded.roles.length > 0) {
        userRole = decoded.roles[0]; 
      } else if (decoded.authorities && Array.isArray(decoded.authorities)) {
        userRole = decoded.authorities[0];
      }

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('userRole', userRole);

      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser({ accessToken, email, role: userRole });
      
      redirectBasedOnRole(userRole);
      return { success: true };

    } catch (error: any) {
      console.error("Login Error:", error);
      let msg = error.response?.data?.message || 'Invalid Credentials or Server Error';
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const payload = {
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        panNumber: userData.panNumber,
        collegeName: userData.collegeName,
        collegeRollNumber: userData.collegeRollNumber,
        passoutYear: parseInt(userData.passoutYear),
      };

      await api.post('/api/auth/register', payload);
      return { success: true, message: 'Registration Successful! Please Login.' };
      
    } catch (error: any) {
      console.log("Register Error:", error.response?.data);
      const errorData = error.response?.data;
      let msg = 'Registration Failed';
      
      if (typeof errorData === 'string') msg = errorData;
      else if (errorData?.message) msg = errorData.message;
      else if (typeof errorData === 'object') msg = Object.values(errorData).join('\n');

      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    try { await api.post('/api/auth/logout'); } catch (e) {}
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('userRole');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    router.replace('/');
  };

  return (
    <Context.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </Context.Provider>
  );
};

export default LmsContext;