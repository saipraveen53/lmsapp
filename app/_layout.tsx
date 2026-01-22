import { Stack } from "expo-router";
import { NativeBaseProvider } from "native-base";
import { BackHandler } from "react-native"; // Added this import
import "react-native-reanimated";
import LmsContext from "./(utils)/LmsContext";
import "./globals.css";

// --- FIX FOR NATIVEBASE CRASH ---
// NativeBase uses an old function 'removeEventListener' which was removed in React Native 0.70+.
// We simply add a dummy function here to stop the app from crashing.
if (!BackHandler.removeEventListener) {
  BackHandler.removeEventListener = () => {};
}
// --------------------------------

export default function RootLayout() {
  return (
    <NativeBaseProvider>
      <LmsContext>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
          <Stack.Screen name="(videos)" options={{ headerShown: false }} />
          <Stack.Screen name="(student)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        </Stack>
      </LmsContext>
    </NativeBaseProvider>
  );
}
