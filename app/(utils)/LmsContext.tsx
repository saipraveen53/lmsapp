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
  errorType?: 'CONFLICT' | 'GENERAL'; 
}

interface LmsContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string, forceLogin?: boolean) => Promise<AuthResponse>;
  register: (userData: any) => Promise<AuthResponse>;
  logout: () => Promise<void>; // Updated return type to Promise<void>
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

  // --- 1. LOAD USER ON APP START ---
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const role = await AsyncStorage.getItem('userRole');
        
        if (token && role) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser({ accessToken: token, role: role });
          
          const decoded: any = jwtDecode(token);
          if (decoded.isFirstLogin === true) {
             router.replace('/(auth)/ChangePassword');
             return;
          }

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

  // --- 2. LOGIN FUNCTION WITH FORCE FLAG ---
  const login = async (email: string, pass: string, forceLogin = false): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // Send force flag to backend
      const res = await api.post('/api/auth/login', { 
        email, 
        password: pass,
        force: forceLogin 
      });
      
      const { accessToken, isFirstLogin } = res.data; 
      
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
      
      if (isFirstLogin === true) {
         router.replace('/(auth)/ChangePassword');
      } else {
         redirectBasedOnRole(userRole);
      }
      
      return { success: true };

    } catch (error: any) {
      console.error("Login Error:", error);
      
      // Check specifically for CONFLICT (409)
      if (error.response?.status === 409 || error.response?.data?.code === 'ALREADY_LOGGED_IN') {
          return { 
            success: false, 
            errorType: 'CONFLICT', 
            message: 'User already logged in on another device.' 
          };
      }

      let msg = error.response?.data?.message || 'Invalid Credentials or Server Error';
      return { success: false, errorType: 'GENERAL', message: msg };
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

  // --- MAJOR FIX: LOGOUT LOGIC ---
  const logout = async () => {
    try {
      // 1. Call Backend Logout API FIRST (Token is still valid in headers)
      console.log("Logging out from backend...");
      await api.post('/api/auth/logout'); 
    } catch (e) {
      console.log("Logout API call failed or network error", e);
    } finally {
      // 2. Clear Local Data ALWAYS (even if API fails)
      console.log("Clearing local session...");
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userRole');
      
      // 3. Clear State & Headers
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      
      // 4. Redirect to Login
      router.replace('/');
    }
  };

  return (
    <Context.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </Context.Provider>
  );
};

export default LmsContext;