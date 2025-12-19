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
          <Stack.Screen name="(videos)" options={{headerShown:false}} />
<<<<<<< HEAD
          <Stack.Screen name="(student)" options={{headerShown:false}} />
=======
>>>>>>> 71d40ca63823863c796e69775aea121ff91e47c0
          <Stack.Screen name="(admin)" options={{headerShown:false}} />
        </Stack>
    </LmsContext>
  );
}