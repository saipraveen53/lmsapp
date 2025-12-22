import { Stack } from 'expo-router'
import React from 'react'

const Studentlayout = () => {
  return (
    <Stack>
        <Stack.Screen name='Home' options={{headerShown:false}} />
        <Stack.Screen name='MyProfile' options={{headerShown:false}} />
    </Stack>
  )
}

export default Studentlayout