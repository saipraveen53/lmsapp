import { Stack } from "expo-router";
import LmsContext from "./(utils)/LmsContext";
import './globals.css';

export default function RootLayout() {
  return  (

    <LmsContext>
        <Stack>
      <Stack.Screen name="(auth)" options={{headerShown:false}} />
    </Stack>
    </LmsContext>
    
  );
}
