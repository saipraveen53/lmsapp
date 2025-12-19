import { Stack } from "expo-router";
import 'react-native-reanimated';
import LmsContext from "./(utils)/LmsContext";
import './globals.css';

export default function RootLayout() {
  return  (
    <LmsContext>
        <Stack>
          <Stack.Screen name="index" options={{headerShown:false}}  />
          <Stack.Screen name="(auth)" options={{headerShown:false}} />
          <Stack.Screen name="(dashboard)" options={{headerShown:false}} />
        </Stack>
    </LmsContext>
  );
}