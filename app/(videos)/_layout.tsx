import { Stack } from 'expo-router'
import React from 'react'

const Videoslayout = () => {
  return (
    <Stack >
        <Stack.Screen name='Video'  options={{headerShown:true}} />
        <Stack.Screen name='[id]'  options={{headerShown:true,headerTitle:"Videosss"}} />
    </Stack>
  )
}

export default Videoslayout