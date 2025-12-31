import { Stack } from 'expo-router';
import React from 'react';

const AuthLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Signup" options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" options={{ headerShown: false }} />
      
      {/* NEW SCREEN - Disable Gestures to prevent going back */}
      <Stack.Screen 
        name="ChangePassword" 
        options={{ 
          headerShown: false,
          gestureEnabled: false // Prevents swipe back on iOS
        }} 
      />
    </Stack>
  );
};

export default AuthLayout;