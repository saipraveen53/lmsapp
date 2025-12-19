import { Link } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const Loginn = () => {
  return (
    // 'flex-1' fills the screen, 'justify-center' and 'items-center' center the content
    <View className="flex-1 justify-center items-center bg-white">
      
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        Loginn
      </Text>

      {/* Styled Link using asChild to apply styles to a nested Pressable or Text */}
      <Link href="/(videos)/Video" asChild>
        <Text className="text-blue-500 text-lg font-medium underline">
          Go to SignUP page
        </Text>
      </Link>
      
    </View>
  );
};

export default Loginn;