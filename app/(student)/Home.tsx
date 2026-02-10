import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { MotiText, MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";
// Reanimated Imports
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  LinearTransition,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CourseApi } from "../(utils)/axiosInstance";
// SVG Imports
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";

// NativeBase Imports
import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Modal,
  ScrollView as NBScrollView,
  Pressable,
  Spinner,
  StatusBar,
  Text,
  VStack,
} from "native-base";

const logoImg = require("../../assets/images/anasol-logo.png");

// --- CONSTANTS ---
const CARD_HEIGHT = 400;
const BANNER_OFFSET = 200;

// --- 1. PREMIUM DETAIL HEADER SVG ---
const CourseDetailHeaderSvg = () => {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <SvgGradient id="detailGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#1e1b4b" stopOpacity="1" />
          <Stop offset="1" stopColor="#312e81" stopOpacity="1" />
        </SvgGradient>
        <SvgGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1e293b" />
          <Stop offset="1" stopColor="#0f172a" />
        </SvgGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#detailGrad)" />
      <Path
        d="M0 50 H400 M0 150 H400 M0 250 H400"
        stroke="white"
        strokeWidth="0.5"
        strokeOpacity="0.1"
      />
      <Path
        d="M50 0 V300 M150 0 V300 M250 0 V300 M350 0 V300"
        stroke="white"
        strokeWidth="0.5"
        strokeOpacity="0.1"
      />
      <Circle cx="350" cy="50" r="80" fill="#4f46e5" fillOpacity="0.3" />
      <Circle cx="50" cy="250" r="60" fill="#ec4899" fillOpacity="0.2" />
      <G transform="translate(100, 80)">
        <Path d="M-20 120 L220 120 L200 130 L0 130 Z" fill="#94a3b8" />
        <Rect x="0" y="0" width="200" height="120" rx="8" fill="#e2e8f0" />
        <Rect
          x="10"
          y="10"
          width="180"
          height="100"
          rx="4"
          fill="url(#screenGrad)"
        />
        <Rect x="25" y="25" width="40" height="6" rx="3" fill="#ec4899" />
        <Rect x="25" y="40" width="100" height="4" rx="2" fill="#38bdf8" />
        <Rect
          x="25"
          y="50"
          width="80"
          height="4"
          rx="2"
          fill="#38bdf8"
          fillOpacity="0.6"
        />
        <Rect
          x="25"
          y="60"
          width="110"
          height="4"
          rx="2"
          fill="#38bdf8"
          fillOpacity="0.6"
        />
        <Circle cx="160" cy="80" r="15" fill="#f59e0b" fillOpacity="0.8" />
        <Path
          d="M155 80 L160 85 L165 75"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <G transform="translate(320, 180)">
        <Path d="M0 0 H30 L25 35 C25 45 15 45 5 35 L0 0" fill="#fbbf24" />
        <Path
          d="M30 5 Q40 5 40 15 Q40 25 28 25"
          stroke="#fbbf24"
          strokeWidth="3"
          fill="none"
        />
        <Path
          d="M10 -10 Q15 -15 10 -20"
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.5"
        />
        <Path
          d="M20 -12 Q25 -17 20 -22"
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.5"
        />
      </G>
    </Svg>
  );
};

// --- 2. DYNAMIC THUMBNAIL ---
const DynamicCourseThumbnail = ({ index }: { index: number }) => {
  const variant = index % 5;
  const getTheme = () => {
    switch (variant) {
      case 0:
        return { start: "#4338ca", end: "#6366f1", accent: "#fbbf24" };
      case 1:
        return { start: "#059669", end: "#34d399", accent: "#ffffff" };
      case 2:
        return { start: "#ea580c", end: "#fb923c", accent: "#1e293b" };
      case 3:
        return { start: "#be123c", end: "#fb7185", accent: "#f472b6" };
      case 4:
        return { start: "#7e22ce", end: "#a855f7", accent: "#22d3ee" };
      default:
        return { start: "#4338ca", end: "#6366f1", accent: "#fbbf24" };
    }
  };
  const theme = getTheme();

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <SvgGradient id={`grad-${index}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={theme.start} stopOpacity="1" />
          <Stop offset="1" stopColor={theme.end} stopOpacity="1" />
        </SvgGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#grad-${index})`} />
      <Circle cx="350" cy="50" r="120" fill="white" fillOpacity="0.05" />
      <Circle cx="50" cy="250" r="80" fill="white" fillOpacity="0.05" />

      {variant === 0 && (
        <G transform="translate(60, 60)">
          <Rect
            width="280"
            height="180"
            rx="12"
            fill="white"
            fillOpacity="0.15"
          />
          <Rect
            width="280"
            height="30"
            rx="12"
            fill="white"
            fillOpacity="0.2"
          />
          <Circle cx="20" cy="15" r="4" fill="#fb7185" />
          <Circle cx="35" cy="15" r="4" fill="#fbbf24" />
          <Rect
            x="25"
            y="50"
            width="100"
            height="8"
            rx="4"
            fill="white"
            fillOpacity="0.8"
          />
          <Rect
            x="25"
            y="70"
            width="180"
            height="8"
            rx="4"
            fill="white"
            fillOpacity="0.4"
          />
        </G>
      )}
      {variant === 1 && (
        <G transform="translate(80, 80)">
          <Rect
            width="240"
            height="160"
            rx="8"
            fill="white"
            fillOpacity="0.1"
          />
          <Rect
            x="30"
            y="80"
            width="30"
            height="60"
            rx="4"
            fill="white"
            fillOpacity="0.4"
          />
          <Rect
            x="80"
            y="40"
            width="30"
            height="100"
            rx="4"
            fill="white"
            fillOpacity="0.8"
          />
          <Rect
            x="180"
            y="20"
            width="30"
            height="120"
            rx="4"
            fill={theme.accent}
            fillOpacity="0.9"
          />
        </G>
      )}
      {variant === 2 && (
        <G transform="translate(130, 40)">
          <Rect
            width="140"
            height="240"
            rx="20"
            fill="white"
            fillOpacity="0.2"
            stroke="white"
            strokeWidth="2"
            strokeOpacity="0.5"
          />
          <Rect
            x="20"
            y="40"
            width="100"
            height="80"
            rx="8"
            fill="white"
            fillOpacity="0.15"
          />
          <Circle cx="40" cy="150" r="15" fill={theme.accent} />
        </G>
      )}
      {variant === 3 && (
        <G transform="translate(100, 70)">
          <Path
            d="M100 200 C40 180 20 120 20 80 L100 20 L180 80 C180 120 160 180 100 200 Z"
            fill="white"
            fillOpacity="0.15"
          />
          <Rect
            x="70"
            y="90"
            width="60"
            height="50"
            rx="6"
            fill={theme.accent}
          />
          <Circle cx="100" cy="115" r="5" fill="white" />
        </G>
      )}
      {variant === 4 && (
        <G transform="translate(100, 75)">
          <Circle
            cx="100"
            cy="75"
            r="70"
            stroke="white"
            strokeWidth="2"
            strokeOpacity="0.3"
            fill="none"
          />
          <Circle cx="100" cy="75" r="30" fill={theme.accent} />
          <Path d="M90 60 L115 75 L90 90 Z" fill="white" />
        </G>
      )}
    </Svg>
  );
};

const Home = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const isSmallScreen = width < 768;

  const [username, setUserName] = useState("Learner");
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Scroll & Layout
  const mainScrollViewRef = useRef<any>(null);
  const [coursesY, setCoursesY] = useState(0);
  const scrollY = useSharedValue(0);

  // Important State Calculation
  const hasAnyEnrollment = enrollments.length > 0;

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const sideBarWidth = 420;
  const isSidebarOpen = isWeb && selectedCourse !== null && !isSmallScreen;
  const contentWidth = isSidebarOpen ? width - sideBarWidth : width;

  const numColumns = isWeb
    ? isSidebarOpen
      ? contentWidth > 1100
        ? 3
        : contentWidth > 800
          ? 2
          : 1
      : contentWidth > 1350
        ? 4
        : contentWidth > 1000
          ? 3
          : contentWidth > 650
            ? 2
            : 1
    : 1;

  const gap = 20;
  const gridContainerWidth = contentWidth - (isWeb ? 100 : 40);
  const cardWidth = isWeb
    ? Math.floor((gridContainerWidth - gap * (numColumns - 1)) / numColumns) - 2
    : "100%";

  useEffect(() => {
    let fetchUsername = async () => {
      try {
        let token = await AsyncStorage.getItem("accessToken");
        if (token) {
          token = token.replace(/^"|"$/g, "");
          const decode: any = jwtDecode(token);
          setUserName(decode.sub || "Learner");
        }
      } catch (error) {
        console.log("User err", error);
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        let response = await CourseApi.get(`/api/courses`);
        let fetchedData = [];
        if (response.data && response.data.success && response.data.data) {
          fetchedData = response.data.data;
        }
        setCourses(fetchedData);
      } catch (error) {
        console.log("Course fetch err", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        let token = await AsyncStorage.getItem("accessToken");
        if (!token) return;
        token = token.replace(/^"|"$/g, "");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await CourseApi.get(
          `/api/courses/my-enrollments`,
          config,
        );
        const data = response.data.data || response.data;
        if (Array.isArray(data)) {
          setEnrollments(data);
        }
      } catch (error: any) {
        console.log("Enrollment fetch error", error);
      }
    };
    fetchEnrollments();
  }, []);

  const handleStartLearning = () => {
    if (mainScrollViewRef.current && coursesY > 0) {
      mainScrollViewRef.current.scrollTo({ y: coursesY, animated: true });
    }
  };

  const handleCoursePress = (course: any) => {
    if (isWeb && !isSmallScreen) {
      if (selectedCourse?.courseId === course.courseId) {
        setSelectedCourse(null);
      } else {
        setSelectedCourse(course);
      }
    } else {
      setSelectedCourse(course);
      setCourseModalVisible(true);
    }
  };

  const initiateEnroll = () => {
    if (!selectedCourse) return;
    if (!selectedCourse.isFree) {
      setPaymentModalVisible(true);
    } else {
      setConfirmModalVisible(true);
    }
  };

  const handlePaymentSuccess = async () => {
    setPaymentModalVisible(false);
    await processEnrollment();
  };

  const processEnrollment = async () => {
    setConfirmModalVisible(false);
    setIsEnrolling(true);
    try {
      let token = await AsyncStorage.getItem("accessToken");
      let config = {};
      if (token) {
        token = token.replace(/^"|"$/g, "");
        config = { headers: { Authorization: `Bearer ${token}` } };
      }
      const response = await CourseApi.post(
        `/api/courses/${selectedCourse.courseId}/enroll/${selectedCourse.libraryId}`,
        {},
        config,
      );
      if (response.status === 200 || response.data?.success) {
        await fetchEnrollments();
        alert(
          !selectedCourse.isFree
            ? "Payment & Enrollment Successful!"
            : "Enrollment Successful!",
        );
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to enroll.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleContinueLearning = () => {
    if (!isWeb) setCourseModalVisible(false);
    const enrollment = enrollments.find(
      (e) => e.courseId === selectedCourse?.courseId,
    );
    const libId = enrollment?.videoLibraryId || enrollment?.libraryId;
    if (libId) {
      router.push({
        pathname: "/(videos)/[id]",
        params: { id: libId, courseId: selectedCourse.courseId },
      });
    } else {
      alert("No video library linked to this enrollment.");
    }
  };

  const formatDuration = (mins: number) => {
    if (!mins) return "0h 0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  // --- CONTENT BODY ---
  const ContentBody = () => {
    return (
      <Box w="100%" px={isWeb && !isSmallScreen ? 10 : 5} pt={isWeb ? 8 : 6}>
        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, type: "timing", duration: 500 }}
        >
          <HStack justifyContent="space-between" alignItems="center" mb={6}>
            <Heading size="lg" color="coolGray.800">
              {isSidebarOpen ? "Selected Course" : "Popular Courses"}
            </Heading>
            {isWeb && !isSidebarOpen && (
              <HStack space={2}>
                <Center
                  p={2}
                  bg="coolGray.100"
                  rounded="full"
                  _hover={{ bg: "coolGray.200", cursor: "pointer" }}
                >
                  <Icon
                    as={Ionicons}
                    name="chevron-back"
                    size="sm"
                    color="coolGray.500"
                  />
                </Center>
                <Center
                  p={2}
                  bg="coolGray.800"
                  rounded="full"
                  _hover={{ bg: "coolGray.700", cursor: "pointer" }}
                >
                  <Icon
                    as={Ionicons}
                    name="chevron-forward"
                    size="sm"
                    color="white"
                  />
                </Center>
              </HStack>
            )}
          </HStack>
        </MotiText>

        {isLoading ? (
          <Center mt={20}>
            <Spinner size="lg" color="indigo.600" />
          </Center>
        ) : (
          <Box
            flexDirection={isWeb ? "row" : "column"}
            flexWrap={isWeb ? "wrap" : "nowrap"}
            style={isWeb ? { gap: gap } : {}}
          >
            {courses.map((course: any, index: number) => {
              const isEnrolled = enrollments.some(
                (e) => e.courseId === course.courseId,
              );
              const isSelected =
                isWeb && selectedCourse?.courseId === course.courseId;
              const isPaid = !course.isFree;
              const isLocked = !isPaid && !isEnrolled && hasAnyEnrollment;

              const animatedStyle = useAnimatedStyle(() => {
                if (!isWeb) return {};
                const itemStartPos = BANNER_OFFSET + index * CARD_HEIGHT;
                const opacity = interpolate(
                  scrollY.value,
                  [-1, 0, itemStartPos, itemStartPos + CARD_HEIGHT * 0.8],
                  [1, 1, 1, 0],
                  Extrapolation.CLAMP,
                );
                const scale = interpolate(
                  scrollY.value,
                  [-1, 0, itemStartPos, itemStartPos + CARD_HEIGHT],
                  [1, 1, 1, 0.9],
                  Extrapolation.CLAMP,
                );
                return { opacity, transform: [{ scale }] };
              });

              return (
                <MotiView
                  layout={LinearTransition.springify().damping(14)}
                  key={course.courseId}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    delay: index * 50,
                    type: "timing",
                    duration: 500,
                    easing: Easing.out(Easing.quad),
                  }}
                  style={
                    isWeb
                      ? {
                          width: cardWidth,
                          flexGrow: 0,
                          marginRight: 0,
                          marginBottom: gap,
                        }
                      : [{ width: "100%", marginBottom: 20 }]
                  }
                >
                  <Animated.View style={isWeb ? animatedStyle : {}}>
                    <Pressable
                      onPress={() => handleCoursePress(course)}
                      rounded="2xl"
                      bg="white"
                      shadow={3}
                      borderWidth={1}
                      borderColor={isSelected ? "indigo.500" : "coolGray.100"}
                      _hover={{
                        shadow: 9,
                        transform: [{ scale: 1.03 }, { translateY: -8 }],
                        borderColor: "indigo.500",
                        bg: "warmGray.50",
                      }}
                      style={{
                        transform: [{ scale: 1 }],
                        height: isWeb ? "100%" : undefined,
                        transition: "all 0.3s ease-in-out",
                      }}
                    >
                      <Box
                        rounded="2xl"
                        overflow="hidden"
                        h={isWeb ? "100%" : undefined}
                      >
                        <Box
                          h={40}
                          w="100%"
                          bg="coolGray.100"
                          position="relative"
                        >
                          <DynamicCourseThumbnail index={index} />
                          <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.5)"]}
                            style={{
                              position: "absolute",
                              bottom: 0,
                              width: "100%",
                              height: 48,
                            }}
                          />
                          <Box position="absolute" top={3} right={3}>
                            <Badge
                              bg="white:alpha.90"
                              _text={{
                                fontSize: "2xs",
                                fontWeight: "bold",
                                color: "coolGray.700",
                              }}
                              rounded="sm"
                            >
                              {course.level || "ALL"}
                            </Badge>
                          </Box>
                          {isLocked && (
                            <Center
                              position="absolute"
                              inset={0}
                              bg="coolGray.900:alpha.50"
                            >
                              <Box bg="white:alpha.20" p={2} rounded="full">
                                <Icon
                                  as={Ionicons}
                                  name="lock-closed"
                                  size="sm"
                                  color="white"
                                />
                              </Box>
                            </Center>
                          )}
                        </Box>
                        <VStack
                          p={4}
                          flex={isWeb ? 1 : 0}
                          justifyContent="space-between"
                        >
                          <VStack>
                            <HStack space={2} mb={2}>
                              <Badge
                                variant="subtle"
                                colorScheme="coolGray"
                                rounded="sm"
                                _text={{ fontSize: "2xs" }}
                              >
                                Development
                              </Badge>
                              <Badge
                                variant="subtle"
                                colorScheme="emerald"
                                rounded="sm"
                                _text={{ fontSize: "2xs" }}
                              >
                                Certified
                              </Badge>
                            </HStack>
                            <Text
                              fontWeight="bold"
                              color="coolGray.800"
                              fontSize={isSidebarOpen ? "sm" : "md"}
                              numberOfLines={2}
                              mb={1.5}
                            >
                              {course.title}
                            </Text>
                            <Text
                              fontSize="xs"
                              color="coolGray.500"
                              numberOfLines={2}
                              mb={3}
                            >
                              {course.description ||
                                "Unlock your potential with our expert-led course."}
                            </Text>
                            <HStack alignItems="center" space={1} mb={3}>
                              <Icon
                                as={Ionicons}
                                name="star"
                                size="2xs"
                                color="amber.500"
                              />
                              <Text
                                fontSize="2xs"
                                fontWeight="bold"
                                color="coolGray.500"
                              >
                                {course.rating || "New"}
                              </Text>
                              <Text fontSize="2xs" color="coolGray.300">
                                •
                              </Text>
                              <Text fontSize="2xs" color="coolGray.400">
                                {course.totalLectures || 0} Lessons
                              </Text>
                            </HStack>
                          </VStack>
                          <HStack
                            alignItems="center"
                            justifyContent="space-between"
                            pt={3}
                            borderTopWidth={1}
                            borderColor="coolGray.50"
                          >
                            <Text
                              fontSize="md"
                              fontWeight="bold"
                              color="coolGray.900"
                            >
                              {course.isFree ? "Free" : `₹${course.price}`}
                            </Text>
                            {isEnrolled ? (
                              <HStack alignItems="center" space={1}>
                                <Icon
                                  as={Ionicons}
                                  name="play-circle"
                                  size="sm"
                                  color="emerald.500"
                                />
                                <Text
                                  fontSize="2xs"
                                  fontWeight="bold"
                                  color="emerald.600"
                                  textTransform="uppercase"
                                >
                                  Resume
                                </Text>
                              </HStack>
                            ) : isPaid ? (
                              <HStack
                                alignItems="center"
                                bg="indigo.50"
                                px={2}
                                py={1}
                                rounded="md"
                              >
                                <Text
                                  fontSize="2xs"
                                  fontWeight="bold"
                                  color="indigo.600"
                                  textTransform="uppercase"
                                  mr={1}
                                >
                                  Buy
                                </Text>
                                <Icon
                                  as={Ionicons}
                                  name="arrow-forward"
                                  size="2xs"
                                  color="indigo.600"
                                />
                              </HStack>
                            ) : isLocked ? (
                              <Icon
                                as={Ionicons}
                                name="lock-closed"
                                size="xs"
                                color="coolGray.400"
                              />
                            ) : (
                              <Text
                                fontSize="2xs"
                                fontWeight="bold"
                                color="orange.600"
                                textTransform="uppercase"
                              >
                                Get Started
                              </Text>
                            )}
                          </HStack>
                        </VStack>
                      </Box>
                    </Pressable>
                  </Animated.View>
                </MotiView>
              );
            })}
          </Box>
        )}
      </Box>
    );
  };

  const CourseDetailsContent = () => {
    if (!selectedCourse) return null;
    const isEnrolled = enrollments.some(
      (e) => e.courseId === selectedCourse.courseId,
    );
    const isPaid = !selectedCourse.isFree;
    const isLocked = !isEnrolled && hasAnyEnrollment && !isPaid;

    return (
      <NBScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.95, translateY: 10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
        >
          <Box
            rounded="2xl"
            overflow="hidden"
            mb={6}
            shadow={3}
            bg="coolGray.200"
            h={56}
            position="relative"
          >
            <CourseDetailHeaderSvg />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                height: 100,
              }}
            />
            {isLocked && (
              <Center position="absolute" inset={0} bg="rgba(0,0,0,0.6)">
                <Box bg="white:alpha.10" p={3} rounded="full" mb={2}>
                  <Icon
                    as={Ionicons}
                    name="lock-closed"
                    size="xl"
                    color="white"
                  />
                </Box>
                <Text
                  color="white"
                  fontWeight="bold"
                  fontSize="md"
                  letterSpacing="lg"
                >
                  LOCKED CONTENT
                </Text>
              </Center>
            )}
          </Box>
        </MotiView>

        <HStack justifyContent="space-between" alignItems="flex-start" mb={6}>
          <VStack flex={1} pr={4}>
            <HStack alignItems="center" mb={2} space={2}>
              <Badge colorScheme="indigo" rounded="md" variant="subtle">
                {selectedCourse.level}
              </Badge>
              <Text fontSize="xs" fontWeight="medium" color="coolGray.500">
                ★ {selectedCourse.rating || "New"}
              </Text>
            </HStack>
            <Heading size="lg" color="coolGray.800" lineHeight="sm">
              {selectedCourse.title}
            </Heading>
          </VStack>
          <Text fontSize="xl" fontWeight="black" color="indigo.600" mt={2}>
            {selectedCourse.isFree ? "Free" : `₹${selectedCourse.price}`}
          </Text>
        </HStack>

        <HStack
          bg="white"
          p={4}
          rounded="xl"
          borderWidth={1}
          borderColor="coolGray.100"
          shadow={1}
          mb={8}
          space={4}
        >
          <HStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            space={2}
          >
            <Text fontSize="xl">⏳</Text>
            <VStack>
              <Text fontSize="2xs" fontWeight="bold" color="coolGray.400">
                DURATION
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="coolGray.700">
                {formatDuration(selectedCourse.totalDuration)}
              </Text>
            </VStack>
          </HStack>
          <Divider orientation="vertical" h={8} />
          <HStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            space={2}
          >
            <Text fontSize="xl">📚</Text>
            <VStack>
              <Text fontSize="2xs" fontWeight="bold" color="coolGray.400">
                LESSONS
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="coolGray.700">
                {selectedCourse.totalLectures || 0} Videos
              </Text>
            </VStack>
          </HStack>
        </HStack>

        <Heading size="md" color="coolGray.800" mb={2}>
          Course Overview
        </Heading>
        <Text fontSize="sm" color="coolGray.500" lineHeight="xl" mb={8}>
          {selectedCourse.description}
        </Text>

        {isEnrolled ? (
          <Button
            onPress={handleContinueLearning}
            bg="indigo.600"
            _pressed={{ bg: "indigo.700" }}
            size="lg"
            rounded="xl"
            shadow={3}
            mb={8}
            leftIcon={<Icon as={Ionicons} name="play-circle" size="sm" />}
          >
            Continue Learning
          </Button>
        ) : isPaid ? (
          <Button
            onPress={initiateEnroll}
            isDisabled={isEnrolling}
            bg="coolGray.900"
            _pressed={{ bg: "coolGray.800" }}
            size="lg"
            rounded="xl"
            shadow={3}
            mb={8}
            leftIcon={<Icon as={Ionicons} name="card-outline" size="sm" />}
          >
            Purchase for ₹{selectedCourse.price}
          </Button>
        ) : isLocked ? (
          <Button
            isDisabled={true}
            bg="coolGray.200"
            size="lg"
            rounded="xl"
            borderWidth={1}
            borderColor="coolGray.300"
            mb={8}
            leftIcon={
              <Icon
                as={Ionicons}
                name="lock-closed"
                size="sm"
                color="coolGray.400"
              />
            }
            _text={{ color: "coolGray.500" }}
          >
            Locked Content
          </Button>
        ) : (
          <Button
            onPress={initiateEnroll}
            isDisabled={isEnrolling}
            isLoading={isEnrolling}
            bg="emerald.600"
            _pressed={{ bg: "emerald.700" }}
            size="lg"
            rounded="xl"
            shadow={3}
            mb={8}
            endIcon={
              <Icon
                as={Ionicons}
                name="arrow-forward-circle-outline"
                size="sm"
              />
            }
          >
            Get Started for Free
          </Button>
        )}
      </NBScrollView>
    );
  };

  // --- UPDATED HEADER (NORMAL STYLE FOR BOTH ANDROID & WEB) ---
  const Header = () => {
    return (
      <HStack
        // Position: Absolute overlay
        position="absolute"
        top={0} // Sticking to top for both
        left={0}
        right={0}
        zIndex={100}
        // Appearance: Full width, square corners, solid background
        w="100%"
        rounded="none"
        bg="white"
        shadow={2}
        // Padding
        px={isSmallScreen ? 4 : 8}
        // Handle StatusBar for Android
        pt={Platform.OS === "android" ? insets.top + 5 : 4}
        pb={4}
        alignItems="center"
        justifyContent="space-between"
      >
        <HStack alignItems="center" space={2}>
          <Image source={logoImg} alt="Logo" w={6} h={6} resizeMode="contain" />
          <Text
            fontWeight="bold"
            fontSize={isSmallScreen ? "md" : "lg"}
            color="coolGray.800"
          >
            ANASOL
          </Text>
        </HStack>

        {!isSmallScreen && isWeb && (
          <HStack space={8} alignItems="center">
            {["Course", "Solutions", "Resources", "Pricing"].map((item) => (
              <Pressable key={item} _hover={{ opacity: 0.6 }}>
                <HStack alignItems="center" space={1}>
                  <Text color="coolGray.600" fontSize="sm" fontWeight="medium">
                    {item}
                  </Text>
                  <Icon
                    as={Ionicons}
                    name="chevron-down"
                    size="xs"
                    color="coolGray.400"
                    mt={0.5}
                  />
                </HStack>
              </Pressable>
            ))}
          </HStack>
        )}

        <HStack
          alignItems="center"
          space={3}
          flex={isSmallScreen ? 1 : undefined}
          justifyContent="flex-end"
        >
          <Box
            bg="coolGray.100"
            rounded="full"
            px={3}
            py={1}
            flex={isSmallScreen ? 1 : undefined}
            maxW={isSmallScreen ? "180px" : "300px"}
            minW={isSmallScreen ? "100px" : "200px"}
            flexDirection="row"
            alignItems="center"
          >
            <Icon
              as={Ionicons}
              name="search"
              size="xs"
              color="coolGray.400"
              mr={2}
            />
            <Input
              variant="unstyled"
              placeholder="Search..."
              fontSize="xs"
              h={8}
              p={0}
              _focus={{ bg: "transparent" }}
            />
          </Box>

          <Pressable onPress={() => router.push("/(student)/MyProfile")}>
            <VStack alignItems="center">
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                }}
                alt="Profile"
                w={8}
                h={8}
                rounded="full"
                borderWidth={1}
                borderColor="coolGray.200"
              />
            </VStack>
          </Pressable>
        </HStack>
      </HStack>
    );
  };

  const HeroSection = ({
    onStartLearning,
  }: {
    onStartLearning: () => void;
  }) => {
    return (
      <Box
        w="100%"
        bg="coolGray.50"
        pb={12}
        // PADDING TOP LOGIC:
        // Web: 24 (approx 96px) - creates space below fixed header
        // Android: 40 (approx 160px) - creates space below fixed header
        pt={isWeb ? 24 : Platform.OS === "android" ? 40 : 20}
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" top={0} left={0} right={0} height="100%">
          {isWeb ? (
            <LinearGradient
              colors={["#fff", "#fefce8", "#fdf2f8", "#fff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, opacity: 0.7 }}
            />
          ) : (
            <Svg height="100%" width="100%" style={{ opacity: 0.15 }}>
              <Defs>
                <SvgGradient id="gradAndroid" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#4f46e5" stopOpacity="0.4" />
                  <Stop offset="1" stopColor="#ec4899" stopOpacity="0.4" />
                </SvgGradient>
              </Defs>
              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#gradAndroid)"
              />
              <G transform="translate(180, 100) scale(1.5)">
                <Ellipse
                  cx="0"
                  cy="0"
                  rx="60"
                  ry="20"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  fill="none"
                  transform="rotate(60)"
                />
                <Ellipse
                  cx="0"
                  cy="0"
                  rx="60"
                  ry="20"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  fill="none"
                  transform="rotate(120)"
                />
                <Ellipse
                  cx="0"
                  cy="0"
                  rx="60"
                  ry="20"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  fill="none"
                  transform="rotate(0)"
                />
                <Circle cx="0" cy="0" r="6" fill="#ec4899" />
              </G>
              <Circle
                cx="30"
                cy="50"
                r="15"
                stroke="#ec4899"
                strokeWidth="2"
                fill="none"
              />
              <Rect
                x="300"
                y="200"
                width="40"
                height="40"
                stroke="#4f46e5"
                strokeWidth="2"
                fill="none"
                transform="rotate(15 320 220)"
              />
              <Path
                d="M50 250 L70 280 L90 250 Z"
                stroke="#ec4899"
                strokeWidth="2"
                fill="none"
              />
            </Svg>
          )}
        </Box>

        {isWeb && (
          <>
            <Box
              position="absolute"
              top={-50}
              left={-50}
              w={64}
              h={64}
              rounded="full"
              bg="red.500"
              opacity={0.8}
            />
            <Box
              position="absolute"
              top={20}
              right={-20}
              w={64}
              h={64}
              rounded="2xl"
              bg="cyan.300"
              opacity={0.8}
              transform={[{ rotate: "15deg" }]}
            />
          </>
        )}

        <VStack alignItems="center" zIndex={10} px={6}>
          <Heading
            size="3xl"
            textAlign="center"
            color="coolGray.900"
            fontWeight="black"
            maxW="900px"
            lineHeight="xs"
            mb={4}
          >
            MASTER ALL COURSES IN 30 DAYS
          </Heading>
          <Text
            fontSize="lg"
            color="coolGray.600"
            textAlign="center"
            maxW="600px"
            mb={8}
          >
            Unlock your potential with our expert-led courses. Built for
            professionals who want to get more done, faster. No fluff, just
            results.
          </Text>

          <HStack
            space={4}
            w="100%"
            justifyContent="center"
            px={isSmallScreen ? 2 : 0}
          >
            <Button
              flex={isSmallScreen ? 1 : undefined}
              bg="emerald.500"
              _pressed={{ bg: "emerald.600" }}
              rounded="full"
              px={isSmallScreen ? 4 : 8}
              py={3}
              _text={{
                fontWeight: "bold",
                fontSize: isSmallScreen ? "sm" : "md",
              }}
              shadow={4}
              onPress={onStartLearning}
            >
              Start Learning
            </Button>
            <Button
              flex={isSmallScreen ? 1 : undefined}
              variant="subtle"
              bg="white"
              rounded="full"
              px={isSmallScreen ? 4 : 8}
              py={3}
              _text={{
                fontWeight: "bold",
                fontSize: isSmallScreen ? "sm" : "md",
                color: "coolGray.700",
              }}
              shadow={2}
            >
              Explore
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  };

  // --- RENDER ---
  return (
    <Box flex={1} bg="coolGray.50">
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      {/* Header is now absolutely positioned over the content */}
      <Header />
      <HStack flex={1} overflow="hidden">
        <Animated.ScrollView
          ref={mainScrollViewRef}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          style={{ flex: 1, backgroundColor: "transparent" }}
        >
          <HeroSection onStartLearning={handleStartLearning} />
          <Box
            onLayout={(event) => {
              const layout = event.nativeEvent.layout;
              setCoursesY(layout.y);
            }}
          >
            <ContentBody />
          </Box>
        </Animated.ScrollView>
        {isWeb && !isSmallScreen && (
          <MotiView
            animate={{
              width: isSidebarOpen ? sideBarWidth : 0,
              opacity: isSidebarOpen ? 1 : 0,
            }}
            transition={{
              type: "timing",
              duration: 400,
              easing: Easing.out(Easing.ease),
            }}
            style={{
              backgroundColor: "white",
              borderLeftWidth: 1,
              borderColor: "#e2e8f0",
              height: "100%",
              shadowOpacity: 0.1,
              zIndex: 30,
              overflow: "hidden",
            }}
          >
            <Box w={sideBarWidth} h="100%" p={6}>
              {selectedCourse && (
                <MotiView
                  from={{ opacity: 0, translateX: 20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 100, type: "timing", duration: 400 }}
                  style={{ flex: 1 }}
                >
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    mb={6}
                    pb={4}
                    borderBottomWidth={1}
                    borderColor="coolGray.100"
                  >
                    <Heading size="md" color="coolGray.800">
                      Course Details
                    </Heading>
                    <Pressable
                      onPress={() => setSelectedCourse(null)}
                      p={1.5}
                      bg="coolGray.100"
                      rounded="full"
                      _hover={{ bg: "rose.100" }}
                    >
                      <Icon
                        as={Ionicons}
                        name="close"
                        size="sm"
                        color="coolGray.500"
                        _hover={{ color: "rose.500" }}
                      />
                    </Pressable>
                  </HStack>
                  <Box flex={1}>
                    <CourseDetailsContent />
                  </Box>
                </MotiView>
              )}
            </Box>
          </MotiView>
        )}
      </HStack>
      <Modal
        isOpen={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        size="md"
      >
        <Modal.Content maxW="400px" rounded="2xl" p={6}>
          <Modal.Body>
            <Center bg="indigo.100" rounded="full" w={10} h={10} mb={3}>
              <Icon as={Ionicons} name="school" size="sm" color="indigo.600" />
            </Center>
            <Heading size="md" color="coolGray.900" mb={2}>
              Ready to upskill?
            </Heading>
            <Text color="coolGray.500" fontSize="sm" mb={6}>
              You are enrolling in{" "}
              <Text fontWeight="bold" color="indigo.600">
                {selectedCourse?.title}
              </Text>
              . Access is free for a limited time.
            </Text>
            <HStack space={3}>
              <Button
                flex={1}
                variant="subtle"
                colorScheme="coolGray"
                onPress={() => setConfirmModalVisible(false)}
              >
                Cancel
              </Button>
              <Button
                flex={1}
                colorScheme="indigo"
                onPress={processEnrollment}
                shadow={3}
              >
                Join Now
              </Button>
            </HStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={paymentModalVisible}
        onClose={() => !isPaying && setPaymentModalVisible(false)}
        size="lg"
        animationPreset="slide"
        justifyContent="flex-end"
        _web={{ justifyContent: "center" }}
      >
        <Modal.Content
          w="100%"
          roundedTop="3xl"
          _web={{ rounded: "2xl", maxW: "450px" }}
        >
          <Modal.Body p={6}>
            <HStack justifyContent="space-between" alignItems="center" mb={6}>
              <HStack alignItems="center">
                <Center bg="emerald.100" rounded="full" w={8} h={8} mr={3}>
                  <Icon
                    as={Ionicons}
                    name="lock-closed"
                    size="xs"
                    color="emerald.600"
                  />
                </Center>
                <VStack>
                  <Heading size="sm" color="coolGray.800">
                    Secure Checkout
                  </Heading>
                  <Text fontSize="2xs" color="coolGray.400">
                    Encrypted 256-bit connection
                  </Text>
                </VStack>
              </HStack>
              {!isPaying && (
                <Pressable
                  onPress={() => setPaymentModalVisible(false)}
                  bg="coolGray.100"
                  rounded="full"
                  p={1}
                >
                  <Icon
                    as={Ionicons}
                    name="close"
                    size="xs"
                    color="coolGray.500"
                  />
                </Pressable>
              )}
            </HStack>
            <Box
              bg="coolGray.50"
              p={4}
              rounded="xl"
              mb={6}
              borderWidth={1}
              borderColor="coolGray.100"
            >
              <Text
                fontSize="2xs"
                fontWeight="bold"
                color="coolGray.400"
                textTransform="uppercase"
                mb={1}
              >
                Course
              </Text>
              <Text fontSize="md" fontWeight="bold" color="coolGray.800" mb={3}>
                {selectedCourse?.title}
              </Text>
              <HStack
                justifyContent="space-between"
                alignItems="flex-end"
                pt={3}
                borderTopWidth={1}
                borderColor="coolGray.200"
              >
                <Text fontSize="xs" fontWeight="medium" color="coolGray.500">
                  Total Amount
                </Text>
                <Text fontSize="2xl" fontWeight="black" color="indigo.600">
                  ₹{selectedCourse?.price}
                </Text>
              </HStack>
            </Box>
            <VStack space={4} mb={6}>
              <VStack space={1}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="coolGray.700"
                  ml={1}
                >
                  Card Information
                </Text>
                <Input
                  placeholder="0000 0000 0000 0000"
                  InputLeftElement={
                    <Icon
                      as={Ionicons}
                      name="card"
                      size="sm"
                      color="coolGray.400"
                      ml={3}
                    />
                  }
                  bg="white"
                  fontSize="sm"
                  keyboardType="numeric"
                  maxLength={16}
                />
              </VStack>
              <HStack space={3}>
                <VStack flex={1} space={1}>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="coolGray.700"
                    ml={1}
                  >
                    Expiry
                  </Text>
                  <Input
                    placeholder="MM/YY"
                    bg="white"
                    fontSize="sm"
                    maxLength={5}
                  />
                </VStack>
                <VStack flex={1} space={1}>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    color="coolGray.700"
                    ml={1}
                  >
                    CVV
                  </Text>
                  <Input
                    placeholder="123"
                    bg="white"
                    fontSize="sm"
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </VStack>
              </HStack>
            </VStack>
            <Button
              onPress={() => {
                setIsPaying(true);
                setTimeout(() => {
                  setIsPaying(false);
                  handlePaymentSuccess();
                }, 2000);
              }}
              isDisabled={isPaying}
              isLoading={isPaying}
              isLoadingText="Processing..."
              bg="coolGray.900"
              _pressed={{ bg: "coolGray.800" }}
              size="lg"
              rounded="xl"
              shadow={4}
              leftIcon={
                !isPaying ? (
                  <Icon as={Ionicons} name="lock-closed" size="sm" />
                ) : undefined
              }
            >
              Complete Payment
            </Button>
            <Center mt={4}>
              <Image
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png",
                }}
                alt="Visa"
                w={20}
                h={4}
                opacity={50}
                resizeMode="contain"
              />
            </Center>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={courseModalVisible}
        onClose={() => setCourseModalVisible(false)}
        size="full"
        animationPreset="slide"
      >
        <Modal.Content h="100%" bg="white">
          <Modal.CloseButton
            top={4}
            right={4}
            zIndex={50}
            bg="black:alpha.20"
            rounded="full"
            _icon={{ color: "white" }}
          />
          <Box flex={1}>
            {selectedCourse && (
              <Box flex={1}>
                <Box h={64} w="100%" bg="coolGray.200">
                  <CourseDetailHeaderSvg />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      width: "100%",
                      height: 100,
                    }}
                  />
                </Box>
                <Box flex={1} bg="white" roundedTop="3xl" mt={-8} px={6} pt={6}>
                  <CourseDetailsContent />
                </Box>
              </Box>
            )}
          </Box>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

export default Home;
