import { Image, ScrollView, Text, View } from "react-native";

export default function App() {
  const stories = [
    { id: 1, name: "Alice", img: "../assets/images/android-icon-background.png" },
    { id: 2, name: "Bob", img: "https://placekitten.com/101/101" },
    { id: 3, name: "Charlie", img: "https://placekitten.com/102/102" },
    { id: 4, name: "David", img: "https://placekitten.com/103/103" },
    { id: 5, name: "Eva", img: "https://placekitten.com/104/104" },
  ];

  const posts = [
    { id: 1, user: "Alice", img: "https://placekitten.com/400/300", likes: 120 },
    { id: 2, user: "Bob", img: "https://placekitten.com/401/301", likes: 85 },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-300">
        <Text className="text-2xl font-bold">Instagram</Text>
        <Text className="text-xl">📷</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Stories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-4 space-x-4">
          {stories.map((story) => (
            <View key={story.id} className="items-center">
              <Image
                source={{ uri: story.img }}
                className="w-16 h-16 rounded-full border-2 border-pink-500"
              />
              <Text className="text-xs mt-1">{story.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Posts */}
        {posts.map((post) => (
          <View key={post.id} className="mb-6 border-b border-gray-200">
            {/* Post header */}
            <View className="flex-row items-center p-4">
              <Image
                source={ require("../assets/images/android-icon-foreground.png")   }
                className="w-10 h-10 rounded-full"
              />
              <Text className="ml-3 font-semibold">{post.user}</Text>
            </View>

            {/* Post image */}
            <Image
               source={ require("../assets/images/android-icon-foreground.png")   }
              className="w-full h-64 bg-gray-200"
            />

            {/* Actions */}
            <View className="flex-row items-center p-4 space-x-4">
              <Text className="text-xl">❤️</Text>
              <Text className="text-xl">💬</Text>
              <Text className="text-xl">📤</Text>
            </View>

            {/* Likes */}
            <Text className="px-4 font-semibold">{post.likes} likes</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}