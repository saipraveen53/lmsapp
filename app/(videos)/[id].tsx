import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
// --- IMPORTS FOR QUIZ ---
import { CourseApi, QuizApi } from '../(utils)/axiosInstance';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- UPDATED INTERFACE BASED ON BACKEND RESPONSE ---
interface LectureItem {
  id: number;
  title: string;
  videoGuid: string;
  videoLibraryId: number;
  description: string;
  thumbnailUrl: string | null;
  isPreview: boolean;
  orderIndex: number;
  allowDownload: boolean;
  // Optional fields for UI compatibility if needed later
  length?: number; 
}

const VideoListByLibrary = () => {
  const { id, courseId } = useLocalSearchParams(); 
  const router = useRouter();
  
  // State now uses LectureItem
  const [videos, setVideos] = useState<LectureItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Store the GUID of the currently playing video
  const [currentVideoGuid, setCurrentVideoGuid] = useState<string | null>(null);
  
  // --- QUIZ & MAPPING STATE ---
  const [grandQuiz, setGrandQuiz] = useState<any>(null);
  const [lectureQuizzes, setLectureQuizzes] = useState<{ [key: number]: any }>({}); 
  const [guidToLectureMap, setGuidToLectureMap] = useState<{ [key: string]: number }>({}); 

  const scrollY = useRef(new Animated.Value(0)).current;

  // --- FILTER LOGIC ---
  const displayedVideos = currentVideoGuid 
    ? videos.filter(v => v.videoGuid !== currentVideoGuid) 
    : videos;

  // --- FETCH COURSE & VIDEOS (Backend Only) ---
  useEffect(() => {
    const fetchCourseAndQuizzes = async () => {
        if (!courseId) return;
        setLoading(true);

        try {
            // A. Fetch Course Data (Now serves as the Video Source)
            const courseRes = await CourseApi.get(`/api/courses/${courseId}`);
            
            if (courseRes.data && courseRes.data.success) {
                const courseData = courseRes.data.data;
                const lectures: LectureItem[] = courseData.lectures || [];
                
                // 1. Set Videos for the list
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setVideos(lectures);

                // 2. Create Map: VideoGUID -> LectureID
                const mapping: { [key: string]: number } = {};
                lectures.forEach((lec) => {
                    if (lec.videoGuid) {
                        mapping[lec.videoGuid] = lec.id;
                    }
                });
                
                // If the response structure supports nested sections, handle that too (fallback)
                if (courseData.sections) {
                     courseData.sections.forEach((sec: any) => {
                        sec.lectures?.forEach((lec: any) => {
                            if (lec.videoGuid) {
                                mapping[lec.videoGuid] = lec.id;
                            }
                        });
                    });
                }
                setGuidToLectureMap(mapping);
            }

            // B. Fetch All Quizzes for Course
            const quizRes = await QuizApi.get(`/api/quizzes/course/${courseId}`);
            if (quizRes.data) {
                const quizzes = quizRes.data; 
                const qMap: { [key: number]: any } = {};
                quizzes.forEach((q: any) => {
                    if (q.quizType === 'LECTURE' && q.lectureId) {
                        qMap[q.lectureId] = q;
                    }
                });
                setLectureQuizzes(qMap);
            }

            // C. Fetch Grand Quiz specifically
            try {
                const grandRes = await QuizApi.get(`/api/quizzes/course/${courseId}/grand`);
                if (grandRes.data) {
                    setGrandQuiz(grandRes.data);
                }
            } catch (e) {
                console.log("No Grand Quiz found");
            }

        } catch (error) {
            console.error("Error fetching course/quiz details:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchCourseAndQuizzes();
  }, [courseId]);


  // --- HANDLERS ---
  const handleVideoPress = (guid: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentVideoGuid(guid);
  };

  // --- NAVIGATE TO EXAM SCREEN ---
  const handleTakeQuiz = (quizData: any) => {
      router.push({ 
          pathname: "/(student)/ExamScreen", 
          params: { 
              quizId: quizData.quizId,
              quizType: quizData.quizType,
              quizData: JSON.stringify(quizData) 
          } 
      });
  };

  // --- FULL SCREEN HANDLERS FOR ANDROID ---
  const handleFullScreenOpen = async () => {
    if (Platform.OS === 'android') {
      StatusBar.setHidden(true);
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
  };

  const handleFullScreenClose = async () => {
    if (Platform.OS === 'android') {
      StatusBar.setHidden(false);
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  };

  // --- RENDER HELPERS ---
  // Note: Backend response doesn't provide duration per video in the sample. 
  // We keep the helper but safely handle missing length.
  const formatDuration = (seconds?: number) => {
    if (!seconds) return ""; 
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- PLAYER COMPONENT ---
  const renderPlayer = () => {
    if (!currentVideoGuid) return null;

    // Find the current lecture object to get the correct library ID
    const currentLecture = videos.find(v => v.videoGuid === currentVideoGuid);
    // Fallback to the ID from params if not found in object (safety check)
    const libId = currentLecture?.videoLibraryId || id; 

    // Construct BunnyCDN Embed URL
    const embedUrl = `https://iframe.mediadelivery.net/embed/${libId}/${currentVideoGuid}?autoplay=true`;
    
    const currentLectureId = guidToLectureMap[currentVideoGuid];
    const currentQuiz = currentLectureId ? lectureQuizzes[currentLectureId] : null;

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
              key={currentVideoGuid}
              source={{ uri: embedUrl }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsFullscreenVideo={true}
              style={{ flex: 1, backgroundColor: '#000' }}
              onFullScreenOpen={handleFullScreenOpen} 
              onFullScreenClose={handleFullScreenClose} 
            />
          )}
        </View>
        
        {/* --- LECTURE QUIZ BUTTON --- */}
        {currentQuiz && (
            <TouchableOpacity 
                style={styles.quizButton}
                onPress={() => handleTakeQuiz(currentQuiz)}
            >
                <LinearGradient colors={['#4f46e5', '#4338ca']} style={styles.gradientBtn} start={{x:0,y:0}} end={{x:1,y:0}}>
                    <Ionicons name="clipboard-outline" size={20} color="white" />
                    <Text style={styles.quizBtnText}>Take Lecture Quiz</Text>
                </LinearGradient>
            </TouchableOpacity>
        )}

        <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setCurrentVideoGuid(null);
                if (Platform.OS === 'android') {
                    StatusBar.setHidden(false);
                    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                }
            }}
        >
            <Text style={styles.closeText}>Close Player ✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // --- GRAND TEST FOOTER ---
  const renderFooter = () => {
      if (!grandQuiz) return <View style={{ height: 40 }} />;

      return (
          <View style={{ padding: 20, paddingBottom: 40 }}>
              <TouchableOpacity 
                style={styles.grandTestCard}
                onPress={() => handleTakeQuiz(grandQuiz)}
              >
                  <LinearGradient 
                    colors={['#10b981', '#059669']} 
                    style={styles.grandGradient}
                    start={{x:0, y:0}} end={{x:1, y:1}}
                  >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 50 }}>
                              <Ionicons name="trophy" size={24} color="white" />
                          </View>
                          <View style={{ marginLeft: 15 }}>
                              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Grand Test</Text>
                              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>Test your full course knowledge</Text>
                          </View>
                      </View>
                      <Ionicons name="arrow-forward" size={24} color="white" />
                  </LinearGradient>
              </TouchableOpacity>
          </View>
      );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10, color: '#6366f1' }}>Loading Content...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {renderPlayer()}

      {!currentVideoGuid && (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Course Content</Text>
        </View>
      )}

      <Animated.FlatList
        data={displayedVideos} 
        keyExtractor={(item) => item.videoGuid}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
        onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [ -1, 0, (100 * index), (100 * (index + 2)) ]; 
          const opacity = scrollY.interpolate({
             inputRange,
             outputRange: [1, 1, 1, 0.8]
          });

          // Map using videoGuid now
          const lecId = guidToLectureMap[item.videoGuid];
          const hasQuiz = lecId && lectureQuizzes[lecId];

          return (
            <Animated.View style={{ opacity }}>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => handleVideoPress(item.videoGuid)}
                  style={styles.card}
                >
                  <View style={styles.thumbnailContainer}>
                      <Image 
                        source={{ uri: item.thumbnailUrl || "https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg" }} 
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                      <View style={styles.playIconOverlay}>
                        <Ionicons name="play-circle" size={28} color="rgba(255,255,255,0.9)" />
                      </View>
                      {item.length ? (
                          <View style={styles.durationBadge}>
                            <Text style={styles.durationText}>{formatDuration(item.length)}</Text>
                          </View>
                      ) : null}
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.textContainer}>
                        <Text style={styles.videoTitle} numberOfLines={2}>
                          {item.title ? item.title.replace('.mp4', '').replace(/_/g, ' ') : 'Untitled Lecture'}
                        </Text>
                        
                        <View style={styles.metaRow}>
                           {/* Backend doesn't send views/date yet, so we just show generic 'Lecture' text or nothing */}
                            <Text style={styles.metaText}>Lecture {index + 1}</Text>
                        </View>
                        
                        {hasQuiz && (
                            <View style={styles.quizBadge}>
                                <Ionicons name="clipboard" size={10} color="#4f46e5" />
                                <Text style={styles.quizBadgeText}>Quiz Available</Text>
                            </View>
                        )}
                    </View>
                  </View>
                </TouchableOpacity>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="film-outline" size={60} color="#cbd5e1" />
                <Text style={styles.emptyText}>No lectures available.</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  playerWrapper: { backgroundColor: '#000', elevation: 4, zIndex: 50 },
  playerContainer: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  closeButton: { paddingVertical: 10, alignItems: 'center', backgroundColor: '#1e293b' },
  closeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  listContent: { paddingVertical: 10 },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginBottom: 12, paddingHorizontal: 16, alignItems: 'center' },
  thumbnailContainer: { width: 130, height: 74, borderRadius: 8, position: 'relative', backgroundColor: '#f1f5f9', overflow: 'hidden' },
  thumbnailImage: { width: '100%', height: '100%' },
  playIconOverlay: { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
  durationBadge: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0, 0, 0, 0.75)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3 },
  durationText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  cardContent: { flex: 1, marginLeft: 12, justifyContent: 'center', paddingVertical: 4 },
  textContainer: { flex: 1 },
  videoTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a', lineHeight: 18, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, color: '#64748b' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, color: '#94a3b8', fontSize: 14 },
  quizButton: {
      marginHorizontal: 10,
      marginBottom: 10,
      marginTop: -5,
      borderRadius: 8,
      overflow: 'hidden',
      elevation: 3
  },
  gradientBtn: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12
  },
  quizBtnText: {
      color: 'white',
      fontWeight: 'bold',
      marginLeft: 8
  },
  grandTestCard: {
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#10b981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8
  },
  grandGradient: {
      padding: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
  },
  quizBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#e0e7ff',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginTop: 4
  },
  quizBadgeText: {
      fontSize: 9,
      color: '#4338ca',
      fontWeight: 'bold',
      marginLeft: 3
  }
});

export default VideoListByLibrary;