import { Link } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

const Loginn = () => {
  return (
    <View>
      <Text>Loginn</Text>
      <Link  href='/(auth)/Signup' >Go to SignUP page</Link>
    </View>
  )
}

export default Loginn