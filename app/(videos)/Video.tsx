import { useRouter } from "expo-router"; //
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

// Interface based on your specific Bunny.net API response
interface VideoLibrary {
  Id: number;
  Name: string;
  VideoCount: number;
  DateCreated: string;
  StorageUsage: number;
}

const Video = () => {
  const [libraries, setLibraries] = useState<VideoLibrary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize the router for navigation

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const response = await fetch("https://api.bunny.net/videolibrary", {
          method: "GET",
          headers: {
            AccessKey: "01ae0b9f-5965-449e-9877-74e8eb44b717", // Your primary API key
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setLibraries(data);
      } catch (error) {
        console.error("Error fetching libraries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraries();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ff7755" />
        <Text className="mt-2 text-gray-500 font-medium">Loading Libraries...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-3xl font-black text-gray-900 mb-2">Collections</Text>
        <Text className="text-gray-500 mb-8">Manage your video libraries</Text>

        <View className="gap-y-4">
          {libraries.map((lib) => (
            <TouchableOpacity 
              key={lib.Id} 
              activeOpacity={0.7}
              // Navigates to app/(videos)/[id].tsx passing the library ID
              onPress={() => router.push(`/(videos)/${lib.Id}`)} 
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex-row items-center justify-between"
            >
              <View className="flex-1">
                {/* Library Name */}
                <Text className="text-xl font-bold text-gray-800 mb-1">
                  {lib.Name}
                </Text>
                
                {/* Stats Row */}
                <View className="flex-row items-center">
                  <View className="bg-orange-100 px-2 py-0.5 rounded-md mr-3">
                    <Text className="text-orange-600 text-xs font-bold">
                      {lib.VideoCount} Videos
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-xs italic">
                    ID: {lib.Id}
                  </Text>
                </View>
              </View>

              {/* Decorative Arrow */}
              <View className="bg-gray-50 h-10 w-10 rounded-full justify-center items-center">
                <Text className="text-gray-400 font-bold">→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State */}
        {libraries.length === 0 && (
          <View className="mt-20 items-center">
            <Text className="text-gray-400">No libraries found.</Text>
          </View>
        )}
      </View>
      
      <View className="h-10" />
    </ScrollView>
  );
};

export default Video;