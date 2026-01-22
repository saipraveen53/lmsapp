import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, StatusBar } from "react-native";
import { WebView } from "react-native-webview";

// --- ANIMATION IMPORTS ---
import { AnimatePresence, MotiView } from "moti";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

// --- NATIVEBASE IMPORTS ---
import {
  Badge,
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Icon,
  IconButton,
  Pressable,
  Spinner,
  Text,
  VStack,
  ZStack,
} from "native-base";

// --- API ---
import { CourseApi, QuizApi } from "../(utils)/axiosInstance";

// --- TYPES ---
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
  length?: number;
}

const { width } = Dimensions.get("window");

// --- VISUAL THEMES FOR CARDS ---
const CARD_THEMES = [
  {
    colors: ["#4F46E5", "#818CF8"] as const, // Indigo
    icon: "play-circle",
    secondaryIcon: "code-slash",
    shape: "circle",
  },
  {
    colors: ["#DB2777", "#F472B6"] as const, // Pink
    icon: "layers",
    secondaryIcon: "images",
    shape: "square",
  },
  {
    colors: ["#059669", "#34D399"] as const, // Emerald
    icon: "flask",
    secondaryIcon: "leaf",
    shape: "blob",
  },
  {
    colors: ["#D97706", "#FBBF24"] as const, // Amber
    icon: "bulb",
    secondaryIcon: "flash",
    shape: "triangle",
  },
  {
    colors: ["#0891B2", "#22D3EE"] as const, // Cyan
    icon: "cube",
    secondaryIcon: "analytics",
    shape: "circle",
  },
];

const VideoListByLibrary = () => {
  const { id, courseId } = useLocalSearchParams();
  const router = useRouter();

  // --- STATE ---
  const [videos, setVideos] = useState<LectureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoGuid, setCurrentVideoGuid] = useState<string | null>(null);

  // --- QUIZ STATE ---
  const [grandQuiz, setGrandQuiz] = useState<any>(null);
  const [lectureQuizzes, setLectureQuizzes] = useState<{ [key: number]: any }>(
    {},
  );
  const [guidToLectureMap, setGuidToLectureMap] = useState<{
    [key: string]: number;
  }>({});

  // --- SCROLL ANIMATION VALUE ---
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchCourseAndQuizzes = async () => {
      if (!courseId) return;
      setLoading(true);

      try {
        // A. Fetch Course Data
        const courseRes = await CourseApi.get(`/api/courses/${courseId}`);
        if (courseRes.data && courseRes.data.success) {
          const courseData = courseRes.data.data;
          const lectures: LectureItem[] = courseData.lectures || [];
          setVideos(lectures);

          // Map GUID to ID
          const mapping: { [key: string]: number } = {};
          lectures.forEach((lec) => {
            if (lec.videoGuid) mapping[lec.videoGuid] = lec.id;
          });

          // Handle Sections if present
          if (courseData.sections) {
            courseData.sections.forEach((sec: any) => {
              sec.lectures?.forEach((lec: any) => {
                if (lec.videoGuid) mapping[lec.videoGuid] = lec.id;
              });
            });
          }
          setGuidToLectureMap(mapping);
        }

        // B. Fetch Quizzes
        const quizRes = await QuizApi.get(`/api/quizzes/course/${courseId}`);
        if (quizRes.data) {
          const quizzes = quizRes.data;
          const qMap: { [key: number]: any } = {};
          quizzes.forEach((q: any) => {
            if (q.quizType === "LECTURE" && q.lectureId) {
              qMap[q.lectureId] = q;
            }
          });
          setLectureQuizzes(qMap);
        }

        // C. Fetch Grand Quiz
        try {
          const grandRes = await QuizApi.get(
            `/api/quizzes/course/${courseId}/grand`,
          );
          if (grandRes.data) setGrandQuiz(grandRes.data);
        } catch (e) {
          console.log("No Grand Quiz found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndQuizzes();
  }, [courseId]);

  // --- HANDLERS ---
  const handleVideoPress = (guid: string) => {
    setCurrentVideoGuid(guid);
  };

  const closePlayer = () => {
    setCurrentVideoGuid(null);
    if (Platform.OS === "android") {
      StatusBar.setHidden(false);
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    }
  };

  const handleTakeQuiz = (quizData: any) => {
    router.push({
      pathname: "/(student)/ExamScreen",
      params: {
        quizId: quizData.quizId,
        quizType: quizData.quizType,
        quizData: JSON.stringify(quizData),
      },
    });
  };

  const handleFullScreenOpen = async () => {
    if (Platform.OS === "android") {
      StatusBar.setHidden(true);
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      );
    }
  };

  const handleFullScreenClose = async () => {
    if (Platform.OS === "android") {
      StatusBar.setHidden(false);
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // --- RENDER PLAYER WITH OVERLAY BUTTONS ---
  const PlayerSection = () => {
    return (
      <AnimatePresence>
        {currentVideoGuid && (
          <MotiView
            from={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "timing", duration: 400 }}
            style={{ width: "100%", zIndex: 100, backgroundColor: "#000" }}
          >
            {(() => {
              const currentLecture = videos.find(
                (v) => v.videoGuid === currentVideoGuid,
              );
              const libId = currentLecture?.videoLibraryId || id;
              const embedUrl = `https://iframe.mediadelivery.net/embed/${libId}/${currentVideoGuid}?autoplay=true`;
              const currentLectureId = guidToLectureMap[currentVideoGuid!];
              const currentQuiz = currentLectureId
                ? lectureQuizzes[currentLectureId]
                : null;

              return (
                <Box w="100%" h={240} bg="black" position="relative">
                  {/* Video WebView */}
                  {Platform.OS === "web" ? (
                    <iframe
                      src={embedUrl}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <WebView
                      source={{ uri: embedUrl }}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      allowsFullscreenVideo={true}
                      style={{ flex: 1, backgroundColor: "#000" }}
                      onFullScreenOpen={handleFullScreenOpen}
                      onFullScreenClose={handleFullScreenClose}
                    />
                  )}

                  {/* OVERLAY CONTROLS */}

                  {/* Close Button (Top Right) */}
                  <IconButton
                    icon={
                      <Icon
                        as={Ionicons}
                        name="close"
                        size="sm"
                        color="white"
                      />
                    }
                    onPress={closePlayer}
                    position="absolute"
                    top={2}
                    right={2}
                    rounded="full"
                    bg="black:alpha.50"
                    _pressed={{ bg: "black:alpha.70" }}
                    zIndex={10}
                    shadow={2}
                    size="sm"
                  />

                  {/* Take Quiz Button (Top Left) - Only if Quiz Exists */}
                  {currentQuiz && (
                    <MotiView
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: 1000, type: "spring" }}
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        zIndex: 10,
                      }}
                    >
                      <Button
                        onPress={() => handleTakeQuiz(currentQuiz)}
                        leftIcon={
                          <Icon
                            as={Ionicons}
                            name="school"
                            size="xs"
                            color="white"
                          />
                        }
                        bg="indigo.600"
                        _pressed={{ bg: "indigo.700" }}
                        size="xs"
                        rounded="full"
                        shadow={3}
                        opacity={0.9}
                        _text={{ fontWeight: "bold" }}
                      >
                        Take Quiz
                      </Button>
                    </MotiView>
                  )}
                </Box>
              );
            })()}
          </MotiView>
        )}
      </AnimatePresence>
    );
  };

  // --- DECORATIVE ABSTRACT SHAPES COMPONENT ---
  const AbstractShape = ({ theme }: { theme: any }) => {
    return (
      <Box position="absolute" right={-20} top={-20} opacity={0.15}>
        <ZStack alignItems="center" justifyContent="center">
          {/* Big Circle/Shape */}
          <Box
            w={40}
            h={40}
            rounded={theme.shape === "circle" ? "full" : "xl"}
            bg="white"
            style={{ transform: [{ rotate: "15deg" }] }}
          />
          {/* Secondary Icon */}
          <Icon
            as={Ionicons}
            name={theme.secondaryIcon}
            size="9xl"
            color="white"
            position="absolute"
            opacity={0.4}
          />
        </ZStack>
      </Box>
    );
  };

  // --- RENDER LIST ITEM (SMOOTH ANIMATION - NO BOUNCE) ---
  const renderItem = ({
    item,
    index,
  }: {
    item: LectureItem;
    index: number;
  }) => {
    const lecId = guidToLectureMap[item.videoGuid];
    const hasQuiz = lecId && lectureQuizzes[lecId];
    const isPlaying = currentVideoGuid === item.videoGuid;

    // Select Theme based on Index
    const theme = CARD_THEMES[index % CARD_THEMES.length];

    if (isPlaying) return null;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 30 }} // Start slightly below
        animate={{ opacity: 1, translateY: 0 }} // Smooth slide up
        transition={{
          delay: index * 100,
          type: "timing", // Using timing instead of spring for no bounce
          duration: 500, // Smooth duration
        }}
        style={{ marginBottom: 16, marginHorizontal: 16 }}
      >
        <Pressable onPress={() => handleVideoPress(item.videoGuid)}>
          {({ isPressed }) => (
            <Box
              bg="white"
              rounded="2xl"
              shadow={isPressed ? 1 : 4}
              overflow="hidden"
              borderColor="coolGray.100"
              borderWidth={1}
              style={{
                transform: [{ scale: isPressed ? 0.98 : 1 }],
              }}
            >
              <HStack h={32}>
                {/* Left Side: Visual/Diagram Area */}
                <Box w="30%">
                  <LinearGradient
                    colors={theme.colors as any}
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <AbstractShape theme={theme} />
                    <Icon
                      as={Ionicons}
                      name={theme.icon}
                      color="white"
                      size="4xl"
                      zIndex={2}
                      shadow={2}
                    />
                    <Text
                      color="white"
                      fontWeight="bold"
                      fontSize="4xl"
                      position="absolute"
                      bottom={-10}
                      right={-5}
                      opacity={0.2}
                    >
                      {index + 1}
                    </Text>
                  </LinearGradient>
                </Box>

                {/* Right Side: Content */}
                <VStack flex={1} p={4} justifyContent="space-between">
                  <VStack space={1}>
                    <HStack
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Heading
                        size="sm"
                        color="coolGray.800"
                        numberOfLines={2}
                        flex={1}
                        fontFamily="heading"
                      >
                        {item.title
                          ? item.title.replace(".mp4", "").replace(/_/g, " ")
                          : "Untitled Lecture"}
                      </Heading>
                      {item.length && (
                        <Badge
                          bg="coolGray.100"
                          rounded="md"
                          _text={{
                            color: "coolGray.500",
                            fontWeight: "bold",
                            fontSize: "xs",
                          }}
                        >
                          {formatDuration(item.length)}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>

                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    mt={2}
                  >
                    <HStack space={2}>
                      {/* Dynamic Tags */}
                      <HStack space={1} alignItems="center">
                        <Icon
                          as={Ionicons}
                          name="time-outline"
                          size="xs"
                          color="coolGray.400"
                        />
                        <Text fontSize="xs" color="coolGray.400">
                          Lecture
                        </Text>
                      </HStack>
                    </HStack>

                    {hasQuiz ? (
                      <Badge
                        colorScheme="success"
                        variant="solid"
                        rounded="full"
                        startIcon={
                          <Icon as={Ionicons} name="checkbox" size="xs" />
                        }
                      >
                        Quiz Ready
                      </Badge>
                    ) : (
                      <Icon
                        as={Ionicons}
                        name="play-circle"
                        color={theme.colors[0]}
                        size="md"
                        opacity={0.5}
                      />
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </Box>
          )}
        </Pressable>
      </MotiView>
    );
  };

  // --- GRAND TEST CARD (BOSS LEVEL) ---
  const GrandTestCard = () => {
    if (!grandQuiz) return <Box h={20} />;

    return (
      <MotiView
        from={{ opacity: 0, translateY: 50 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 600, type: "timing", duration: 700 }}
      >
        <Box px={4} pb={12} pt={4}>
          <Pressable onPress={() => handleTakeQuiz(grandQuiz)}>
            {({ isPressed }) => (
              <Box style={{ transform: [{ scale: isPressed ? 0.98 : 1 }] }}>
                <LinearGradient
                  colors={["#FFD700", "#F59E0B"]} // Gold Gradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 20,
                    padding: 2, // Border effect
                  }}
                >
                  <Box bg="white" rounded="xl" overflow="hidden">
                    <HStack>
                      {/* Left Gold Bar */}
                      <LinearGradient
                        colors={["#F59E0B", "#D97706"]}
                        style={{
                          width: 80,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Icon
                          as={Ionicons}
                          name="trophy"
                          color="white"
                          size="3xl"
                        />
                      </LinearGradient>

                      <VStack p={4} flex={1} space={1}>
                        <Heading size="md" color="warmGray.800">
                          Grand Challenge
                        </Heading>
                        <Text fontSize="xs" color="coolGray.500">
                          Prove your mastery of this course.
                        </Text>
                        <HStack mt={2} alignItems="center" space={2}>
                          <Text
                            color="amber.600"
                            fontWeight="bold"
                            fontSize="sm"
                          >
                            Start Assessment
                          </Text>
                          <Icon
                            as={Ionicons}
                            name="arrow-forward"
                            size="sm"
                            color="amber.600"
                          />
                        </HStack>
                      </VStack>
                    </HStack>
                  </Box>
                </LinearGradient>
              </Box>
            )}
          </Pressable>
        </Box>
      </MotiView>
    );
  };

  if (loading) {
    return (
      <Center flex={1} bg="white">
        <MotiView
          from={{ opacity: 0.5, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ loop: true, type: "timing", duration: 1000 }}
        >
          <Spinner size="lg" color="indigo.600" />
        </MotiView>
        <Text
          mt={4}
          color="coolGray.400"
          fontWeight="medium"
          letterSpacing="lg"
        >
          LOADING CONTENT...
        </Text>
      </Center>
    );
  }

  const displayedVideos = currentVideoGuid
    ? videos.filter((v) => v.videoGuid !== currentVideoGuid)
    : videos;

  return (
    <Box flex={1} bg="coolGray.50" safeAreaTop>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* HEADER (Only shows when video is NOT playing) */}
      {!currentVideoGuid && (
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
        >
          <HStack alignItems="center" px={4} py={4} bg="coolGray.50" space={3}>
            <IconButton
              icon={
                <Icon
                  as={Ionicons}
                  name="chevron-back"
                  size="md"
                  color="black"
                />
              }
              onPress={() => router.back()}
              rounded="full"
              variant="ghost"
              bg="white"
              shadow={1}
            />
            <VStack>
              <Heading size="md" color="coolGray.800">
                Course Content
              </Heading>
              <Text fontSize="xs" color="coolGray.500">
                {videos.length} Lectures Available
              </Text>
            </VStack>
          </HStack>
        </MotiView>
      )}

      {/* PLAYER SECTION */}
      <PlayerSection />

      {/* VIDEO LIST */}
      <Animated.FlatList
        data={displayedVideos}
        keyExtractor={(item) => item.videoGuid}
        renderItem={renderItem}
        ListFooterComponent={GrandTestCard}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <Center mt={20}>
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 300, type: "timing" }}
            >
              <Icon
                as={Ionicons}
                name="library-outline"
                size="6xl"
                color="coolGray.200"
              />
              <Text color="coolGray.400" mt={4} fontWeight="bold">
                No lectures found.
              </Text>
            </MotiView>
          </Center>
        }
      />
    </Box>
  );
};

export default VideoListByLibrary;
