import { Stack } from 'expo-router'
import React from 'react'

const Authlayout = () => {
  return (
    <Stack>
        <Stack.Screen name='/app/(auth)/Signup.tsx' />
    </Stack>
  )
}

export default Authlayout