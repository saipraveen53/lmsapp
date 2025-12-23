import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// --- INTERFACES ---
interface VideoItem {
  guid: string;
  videoLibraryId: number;
  title: string;
  dateUploaded: string;
  views: number;
  length: number;
  status: number;
  thumbnailFileName: string;
}

const VideoListByLibrary = () => {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- FILTER LOGIC ---
  const displayedVideos = currentVideo 
    ? videos.filter(v => v.guid !== currentVideo) 
    : videos;

  // --- HELPERS ---
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchVideos = async () => {
      if (!id) return;

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
        
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setVideos(data.items || []); 
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [id]);

  const handleVideoPress = (guid: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentVideo(guid);
  };

  const renderPlayer = () => {
    if (!currentVideo) return null;

    const embedUrl = `https://iframe.mediadelivery.net/embed/${id}/${currentVideo}?autoplay=true`;

    return (
      <View style={styles.playerWrapper}>
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
              key={currentVideo}
              source={{ uri: embedUrl }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
              style={{ flex: 1, backgroundColor: '#000' }}
            />
          )}
        </View>
        <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setCurrentVideo(null);
            }}
        >
            <Text style={styles.closeText}>Close Player ✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10, color: '#6366f1' }}>Loading Videos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* 1. PLAYER SECTION */}
      {renderPlayer()}

      {/* 2. HEADER */}
      {!currentVideo && (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Course Videos</Text>
        </View>
      )}

      {/* 3. VIDEO LIST (Compact Mode) */}
      <Animated.FlatList
        data={displayedVideos} 
        keyExtractor={(item) => item.guid}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [ -1, 0, (100 * index), (100 * (index + 2)) ]; // Adjusted for smaller items
          const opacity = scrollY.interpolate({
             inputRange,
             outputRange: [1, 1, 1, 0.8]
          });

          return (
            <Animated.View style={{ opacity }}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => handleVideoPress(item.guid)}
                  style={styles.card}
                >
                  {/* --- COMPACT THUMBNAIL (Left Side) --- */}
                  <View style={styles.thumbnailContainer}>
                     <Image 
                        source={{ uri: "https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg" }} 
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                     />
                     
                     <View style={styles.playIconOverlay}>
                        <Ionicons name="play-circle" size={28} color="rgba(255,255,255,0.9)" />
                     </View>

                     <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{formatDuration(item.length)}</Text>
                     </View>
                  </View>

                  {/* --- CONTENT DETAILS (Right Side) --- */}
                  <View style={styles.cardContent}>
                    <View style={styles.textContainer}>
                        <Text style={styles.videoTitle} numberOfLines={2}>
                          {item.title.replace('.mp4', '').replace(/_/g, ' ')}
                        </Text>
                        
                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>
                                {item.views} views • {formatDate(item.dateUploaded)}
                            </Text>
                        </View>
                    </View>

                    {/* Options (Optional) */}
                    {/* <TouchableOpacity style={styles.optionsButton}>
                        <Ionicons name="ellipsis-vertical" size={16} color="#94a3b8" />
                    </TouchableOpacity> */}
                  </View>
                  
                  {/* Status Indicator */}
                  {item.status !== 4 && (
                      <View style={styles.processingOverlay}>
                          <Text style={styles.processingText}>Processing...</Text>
                      </View>
                  )}

                </TouchableOpacity>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="film-outline" size={60} color="#cbd5e1" />
                <Text style={styles.emptyText}>No videos available.</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
};

// --- STYLES (UPDATED FOR COMPACT LAYOUT) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  // Player
  playerWrapper: {
    backgroundColor: '#000',
    elevation: 4,
    zIndex: 50,
  },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  closeButton: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  closeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // List
  listContent: {
    paddingVertical: 10,
  },
  
  // --- COMPACT CARD STYLES ---
  card: {
    flexDirection: 'row', // Horizontal Layout
    backgroundColor: '#fff',
    marginBottom: 12, 
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  
  // Smaller Thumbnail on Left
  thumbnailContainer: {
    width: 130, // Fixed small width
    height: 74, // Approx 16:9
    borderRadius: 8,
    position: 'relative',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  // Content Details on Right
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  textContainer: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 14, // Smaller font
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 18,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11, // Smaller meta text
    color: '#64748b', 
  },
  optionsButton: {
    padding: 4,
  },

  // Processing Status
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  processingText: {
    color: '#2563eb',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 14,
  },
});

export default VideoListByLibrary;