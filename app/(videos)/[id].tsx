import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Image, // Added Image component
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
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- FILTER LOGIC (NEW) ---
  // ప్లే అవుతున్న వీడియోను లిస్ట్ నుండి తొలగించడానికి ఫిల్టర్ వాడుతున్నాం
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
      try {
        const response = await fetch(
          `https://video.bunnycdn.com/library/${id}/videos?page=1&itemsPerPage=100&orderBy=date`, 
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
    if (id) fetchVideos();
  }, [id]);

  const handleVideoPress = (guid: string) => {
    // లిస్ట్ అప్‌డేట్ అయ్యేటప్పుడు స్మూత్ యానిమేషన్ కోసం
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
            <Text style={styles.headerTitle}>Videos</Text>
             
        </View>
      )}

      {/* 3. VIDEO LIST (Filtered) */}
      <Animated.FlatList
        data={displayedVideos} // Use filtered list
        keyExtractor={(item) => item.guid}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          // Opacity Animation
          const inputRange = [ -1, 0, (250 * index), (250 * (index + 2)) ];
          const opacity = scrollY.interpolate({
             inputRange,
             outputRange: [1, 1, 1, 0.8]
          });

          return (
            <Animated.View style={{ opacity }}>
                <TouchableOpacity 
                  activeOpacity={0.9}
                  onPress={() => handleVideoPress(item.guid)}
                  style={styles.card}
                >
                  {/* --- STATIC THUMBNAIL (Same for all) --- */}
                  <View style={styles.thumbnailContainer}>
                     <Image 
                        source={{ uri: "https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg" }} // Fixed Image
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                     />
                     
                     {/* Play Icon Overlay */}
                     <View style={styles.playIconOverlay}>
                        <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
                     </View>

                     {/* Duration Badge */}
                     <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{formatDuration(item.length)}</Text>
                     </View>
                  </View>

                  {/* --- CONTENT DETAILS --- */}
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

                    <TouchableOpacity style={styles.optionsButton}>
                        <Ionicons name="ellipsis-vertical" size={16} color="#94a3b8" />
                    </TouchableOpacity>
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

// --- STYLES ---
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
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginRight: 8,
  },
  headerBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
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
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // List
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 20, 
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
  },
  
  // Thumbnail
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    marginBottom: 12,
    backgroundColor: '#f1f5f9', // fallback color
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)', // slight darken
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Content Details
  cardContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 22,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#64748b', 
  },
  optionsButton: {
    padding: 4,
  },

  // Processing Status
  processingOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  processingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default VideoListByLibrary;