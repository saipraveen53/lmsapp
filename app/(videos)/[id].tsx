import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StyleSheet, // 1. StyleSheet Import chesam
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';

interface VideoItem {
  guid: string;
  title: string;
  length: number;
  status: number;
}

const VideoListByLibrary = () => {
  const { id } = useLocalSearchParams();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `https://video.bunnycdn.com/library/${id}/videos`, 
          {
            method: "GET",
            headers: {
              AccessKey: "ede9a48d-c2a3-425b-ac0d96863d1b-f95c-4f46", 
              Accept: "application/json",
            },
          }
        );
        const data = await response.json();
        setVideos(data.items || []); 
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVideos();
  }, [id]);

  const renderPlayer = () => {
    if (!currentVideo) return null;

    const embedUrl = `https://iframe.mediadelivery.net/embed/${id}/${currentVideo}?autoplay=true`;

    return (
      <View style={styles.playerContainer}>
        {Platform.OS === 'web' ? (
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <WebView
            source={{ uri: embedUrl }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            style={{ flex: 1 }}
          />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff7755" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 1. TOP PLAYER SECTION */}
      {currentVideo ? (
        renderPlayer()
      ) : (
        <View style={styles.headerContainer}>
           <Text className="text-xl font-bold text-gray-800">Library: {id}</Text>
           <Text className="text-gray-500 text-xs">Tap a video to play</Text>
        </View>
      )}

      {/* 2. REMAINING VIDEO LIST */}
      <FlatList
        data={videos}
        keyExtractor={(item) => item.guid}
        // 2. Ikkada Style Sheet styles apply chesam
        style={styles.videoList} 
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isPlaying = currentVideo === item.guid;

          return (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => setCurrentVideo(item.guid)}
              className={`mb-4 p-4 border rounded-2xl shadow-sm flex-row items-center ${
                isPlaying ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
              }`}
            >
              <View className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${isPlaying ? 'bg-orange-500' : 'bg-gray-100'}`}>
                 <Text className={`font-bold ${isPlaying ? 'text-white' : 'text-gray-500'}`}>
                    {isPlaying ? '▶' : '•'}
                 </Text>
              </View>

              <View className="flex-1">
                <Text 
                  className={`text-lg font-bold mb-1 ${isPlaying ? 'text-orange-700' : 'text-gray-800'}`} 
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-gray-500 font-medium">
                    {formatDuration(item.length)}
                  </Text>
                  
                  {item.status !== 4 && (
                    <Text className="text-xs text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded">
                      PROCESSING
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

// 3. STYLES DEFINITION (Idhi meeru adigina changes)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb', // bg-gray-50 color
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9, // Video size ratio
    backgroundColor: '#000',
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
    elevation: 2,
  },
  videoList: {
    marginTop: 10, // !!! IDHI LIST NI KINDHAKI JARUPUTHUNDI !!!
  },
  listContent: {
    padding: 16,        // Side padding
    paddingBottom: 50,  // Bottom scroll space
  },
});

export default VideoListByLibrary;