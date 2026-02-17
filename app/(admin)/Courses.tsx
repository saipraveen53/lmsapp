import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";
import { WebView } from "react-native-webview";
import { CourseApi } from "../(utils)/axiosInstance";
import "../globals.css";

// --- VECTOR GRAPHICS (SVGs) ---

// 1. Header Background
const HeaderBgSvg = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 400 150"
    preserveAspectRatio="none"
  >
    <Defs>
      <SvgGradient id="headerGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#312e81" stopOpacity="1" />
        <Stop offset="1" stopColor="#4f46e5" stopOpacity="1" />
      </SvgGradient>
    </Defs>
    <Rect width="400" height="150" fill="url(#headerGrad)" />
    <Circle cx="30" cy="20" r="60" fill="white" fillOpacity="0.03" />
    <Circle cx="370" cy="80" r="50" fill="white" fillOpacity="0.03" />
    <Path
      d="M0 80 Q 100 40 200 80 T 400 80 V 120 H 0 Z"
      fill="white"
      fillOpacity="0.03"
    />
  </Svg>
);

// 2. Empty State Illustration
const EmptyStateSvg = () => (
  <Svg width="180" height="140" viewBox="0 0 200 150">
    <Circle cx="100" cy="75" r="50" fill="#f1f5f9" />
    <Path
      d="M70 60 L130 60 L130 100 Q 130 110 120 110 L 80 110 Q 70 110 70 100 Z"
      fill="white"
      stroke="#94a3b8"
      strokeWidth="2"
      strokeDasharray="4 4"
    />
    <Circle cx="130" cy="50" r="15" fill="#e2e8f0" />
    <Path
      d="M125 50 L130 55 L138 45"
      stroke="#94a3b8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// 3. Dynamic Vector Course Thumbnail
const CourseVectorThumbnail = ({
  index,
  title,
}: {
  index: number;
  title?: string;
}) => {
  const themes = [
    { start: "#4f46e5", end: "#818cf8", icon: "code-slash-outline" }, // Indigo
    { start: "#059669", end: "#34d399", icon: "terminal-outline" }, // Emerald
    { start: "#db2777", end: "#f472b6", icon: "layers-outline" }, // Pink
    { start: "#ea580c", end: "#fb923c", icon: "cube-outline" }, // Orange
    { start: "#0891b2", end: "#22d3ee", icon: "laptop-outline" }, // Cyan
  ];

  const theme = themes[index % themes.length];

  return (
    <View className="w-full h-full relative overflow-hidden">
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <SvgGradient id={`grad-${index}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={theme.start} />
            <Stop offset="1" stopColor={theme.end} />
          </SvgGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#grad-${index})`} />
        <Circle cx="10%" cy="20%" r="40" fill="white" fillOpacity="0.1" />
        <Circle cx="90%" cy="80%" r="60" fill="white" fillOpacity="0.1" />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <View className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 shadow-sm">
          <Ionicons name={theme.icon as any} size={28} color="white" />
        </View>
      </View>
    </View>
  );
};

// --- HELPER: Get Image ---
const getCourseImage = (url: string | null) => {
  if (url && url.length > 5) return { uri: url };
  return null;
};

// --- SIDEBAR HELPER COMPONENTS ---
const TechRow = ({ label, value }: { label: string; value: any }) => (
  <View className="flex-row justify-between py-2 border-b border-slate-100">
    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
      {label}
    </Text>
    <Text
      className="text-[11px] text-slate-700 font-medium text-right flex-1 ml-4"
      numberOfLines={1}
    >
      {value !== null && value !== undefined ? String(value) : "N/A"}
    </Text>
  </View>
);

// ----------------------------------------------------------------------
// SIDEBAR COMPONENT
// ----------------------------------------------------------------------
const CourseDetailSidebar = ({ course, visible, onClose }: any) => {
  const [sections, setSections] = useState<any[]>([]);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const { height } = useWindowDimensions();

  const openLink = (url: string | null) => {
    if (url)
      Linking.openURL(url).catch((err) =>
        console.error("Couldn't load page", err),
      );
  };

  const handleDeleteLecture = async (lectureId: string) => {
    try {
      // Optionally, add a confirmation dialog here
      await CourseApi.delete(`/api/courses/lectures/${lectureId}`);
      setSections((prevSections) =>
        prevSections.map((section) => ({
          ...section,
          lectures: section.lectures.filter((l: any) => l.id !== lectureId),
        })),
      );
      if (Platform.OS === "web") {
        window.alert("Lecture deleted successfully.");
      } else {
        Alert.alert("Deleted", "Lecture deleted successfully.");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to delete lecture.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Error", msg);
      }
    }
  };
  const handleVideoPress = (guid: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentVideo(guid);
  };

  const renderPlayer = () => {
    if (!currentVideo) return null;
    const embedUrl = `https://iframe.mediadelivery.net/embed/${course.libraryId}/${currentVideo}?autoplay=true`;

    return (
      <View className="w-full h-[250px] md:h-[400px] bg-black relative rounded-b-2xl overflow-hidden shadow-xl">
        <View className="w-full h-full">
          {Platform.OS === "web" ? (
            <iframe
              src={embedUrl}
              style={{ width: "100%", height: "100%", border: "none" }}
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
              style={{ flex: 1, backgroundColor: "#000" }}
              originWhitelist={["*"]}
            />
          )}
        </View>
        <TouchableOpacity
          className="absolute top-4 right-4 bg-black/60 px-3 py-1.5 rounded-full border border-white/20 z-50 backdrop-blur-md"
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            setCurrentVideo(null);
          }}
        >
          <Text className="text-white text-xs font-bold">Close Player ✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  useEffect(() => {
    if (
      course?.lectures &&
      Array.isArray(course.lectures) &&
      course.lectures.length > 0
    ) {
      // If lectures exist in the course object, show them as a section
      setSections([
        {
          id: "api-lectures-section",
          title: "Course Lectures",
          orderIndex: 1,
          description: `${course.lectures.length} Lectures`,
          lectures: course.lectures,
        },
      ]);
    } else if (course?.libraryId) {
      // Otherwise, fetch BunnyCDN videos
      const fetchBunnyVideos = async () => {
        try {
          const url = `https://video.bunnycdn.com/library/${course.libraryId}/videos?page=1&itemsPerPage=100`;
          const response = await fetch(url, {
            method: "GET",
            headers: {
              AccessKey: "eb8560ce-e8a6-414c-8e250605c6d5-627d-4c55",
              Accept: "application/json",
            },
          });
          const data = await response.json();
          if (data.items && Array.isArray(data.items)) {
            setSections([
              {
                id: "bunny-dynamic-section",
                title: "Course Videos (Cloud)",
                orderIndex: 1,
                description: `${data.items.length} Videos Available`,
                lectures: data.items.map((item: any) => ({
                  id: item.guid,
                  title: item.title,
                  description: `Duration: ${Math.floor(item.length / 60)}m ${item.length % 60}s`,
                  videoGuid: item.guid,
                  thumbnailUrl: null,
                  allowDownload: false,
                  isPreview: false,
                })),
              },
            ]);
          }
        } catch (error) {
          console.error("Failed to fetch BunnyCDN videos:", error);
          setSections([]);
        }
      };
      fetchBunnyVideos();
    } else {
      setSections([]);
    }
  }, [course]);

  if (!course) return null;

  const renderSectionItem = (section: any) => (
    <View
      key={section.id}
      className="mb-4 bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm"
    >
      <View className="p-3 bg-slate-50 border-b border-slate-100 flex-row justify-between items-center">
        <View>
          <Text className="font-bold text-slate-700 text-sm">
            Sec {section.orderIndex}: {section.title}
          </Text>
          <Text className="text-[10px] text-slate-400 mt-0.5">
            {section.description}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#94a3b8" />
      </View>

      <View className="bg-white">
        {section.lectures && section.lectures.length > 0 ? (
          section.lectures.map((lecture: any) => (
            <Pressable
              key={lecture.id}
              onPress={() => handleVideoPress(lecture.videoGuid)}
              className={`flex-row p-3 border-b border-slate-50 items-center ${currentVideo === lecture.videoGuid ? "bg-indigo-50" : "active:bg-slate-50"}`}
            >
              <View
                className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${currentVideo === lecture.videoGuid ? "bg-indigo-100" : "bg-slate-100"}`}
              >
                <Ionicons
                  name={currentVideo === lecture.videoGuid ? "pause" : "play"}
                  size={12}
                  color={
                    currentVideo === lecture.videoGuid ? "#4f46e5" : "#64748b"
                  }
                />
              </View>
              <View className="flex-1 justify-center">
                <Text
                  className={`font-semibold text-xs mb-0.5 ${currentVideo === lecture.videoGuid ? "text-indigo-700" : "text-slate-700"}`}
                >
                  {lecture.title}
                </Text>
                <Text className="text-[10px] text-slate-400" numberOfLines={1}>
                  {lecture.description}
                </Text>
              </View>
              {/* Delete Icon */}
              <TouchableOpacity
                onPress={() => handleDeleteLecture(lecture.id)}
                className="ml-2 p-1 rounded-full bg-rose-50 border border-rose-100"
              >
                <Ionicons name="trash-outline" size={16} color="#dc2626" />
              </TouchableOpacity>
            </Pressable>
          ))
        ) : (
          <Text className="text-[10px] text-slate-400 text-center py-3 italic">
            No lectures found.
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row justify-end bg-slate-900/40 backdrop-blur-sm">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="w-full md:w-[500px] bg-slate-50 shadow-2xl h-full border-l border-white/20">
          <View className="bg-white px-4 py-3 flex-row justify-between items-center border-b border-slate-200 pt-12 md:pt-4 shadow-sm z-10">
            <Text
              className="font-bold text-lg text-slate-800"
              numberOfLines={1}
            >
              {course.title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-slate-100 p-2 rounded-full"
            >
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {currentVideo ? (
              renderPlayer()
            ) : (
              <View className="relative w-full h-[200px] overflow-hidden">
                <CourseVectorThumbnail
                  index={course.courseId ? parseInt(course.courseId) : 0}
                />
                <View className="absolute inset-0 p-6 justify-end">
                  <View className="flex-row gap-2 mb-2">
                    <View className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded border border-white/20">
                      <Text className="text-[10px] text-white font-bold">
                        {course.category || "Course"}
                      </Text>
                    </View>
                    <View className="bg-black/30 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                      <Text className="text-[10px] text-white font-bold">
                        {course.level || "Beginner"}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-white font-bold text-2xl shadow-sm">
                    {course.title}
                  </Text>
                </View>
              </View>
            )}

            <View className="p-5">
              <View className="flex-row items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <View>
                  <Text className="text-2xl font-black text-slate-800">
                    {course.isFree ? "Free" : `$${course.price}`}
                  </Text>
                  <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Price
                  </Text>
                </View>
                <View className="h-8 w-[1px] bg-slate-200 mx-4" />
                <View className="flex-row gap-4">
                  <View className="items-center">
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <Text className="text-[10px] font-bold text-slate-600 mt-1">
                      {course.rating?.toFixed(1) || "New"}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Ionicons name="people" size={16} color="#64748b" />
                    <Text className="text-[10px] font-bold text-slate-600 mt-1">
                      {course.totalStudents}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm text-slate-600 leading-6">
                  {course.description}
                </Text>
              </View>

              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="list" size={16} color="#4f46e5" />
                  <Text className="text-sm font-bold text-slate-800 ml-2">
                    Curriculum Content
                  </Text>
                </View>
                {sections && sections.length > 0 ? (
                  sections.map((section: any) => renderSectionItem(section))
                ) : (
                  <View className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl items-center justify-center">
                    <Ionicons
                      name="file-tray-outline"
                      size={24}
                      color="#94a3b8"
                    />
                    <Text className="text-slate-400 mt-2 text-xs">
                      Content loading or empty.
                    </Text>
                  </View>
                )}
              </View>

              <View className="mt-4 pt-4 border-t border-slate-100">
                <TechRow label="Library ID" value={course.libraryId} />
                <TechRow label="Language" value={course.language} />
                <TechRow
                  label="Total Duration"
                  value={`${Math.floor(course.totalDuration / 60)}h ${course.totalDuration % 60}m`}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// --- TYPES ---
interface LectureForm {
  videoLibraryId: string;
  videoGuid: string;
  title: string;
  description: string;
  durationSeconds: string;
  isPreview: boolean;
  orderIndex: string;
}

const INITIAL_FORM_STATE: LectureForm = {
  videoLibraryId: "",
  videoGuid: "",
  title: "",
  description: "",
  durationSeconds: "0",
  isPreview: false,
  orderIndex: "1",
};

const isWeb = Platform.OS === "web";

// ====================================================================
// MAIN COMPONENT: COURSES
// ====================================================================
export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // --- STATE ---
  const [detailSidebarVisible, setDetailSidebarVisible] = useState(false);
  const [selectedDetailCourse, setSelectedDetailCourse] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>("");
  const [form, setForm] = useState<LectureForm>(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LectureForm, string>>
  >({});
  const [lectureMessage, setLectureMessage] = useState<string | null>(null);
  const [lectureMessageType, setLectureMessageType] = useState<
    "success" | "error" | null
  >(null);

  const { width } = useWindowDimensions();
  const router = useRouter();

  // --- RESPONSIVE CONFIG ---
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const columns = isDesktop ? 3 : isTablet ? 2 : 1;
  const gap = 24;
  const containerPadding = isDesktop ? 48 : 24;
  const totalGapSpace = gap * (columns - 1);
  const cardWidth = (width - containerPadding * 2 - totalGapSpace) / columns;
  const [bunnyVideos, setBunnyVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [bunnyVideoCounts, setBunnyVideoCounts] = useState<{
    [libraryId: string]: number;
  }>({});

  const [unpublishModalVisible, setUnpublishModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });
  const [unpublishTarget, setUnpublishTarget] = useState<any>(null);
  const [unpublishedCourses, setUnpublishedCourses] = useState<any[]>([]);
  const [showUnpublished, setShowUnpublished] = useState(false);
  const [publishTarget, setPublishTarget] = useState<any>(null);
  const [loadingUnpublished, setLoadingUnpublished] = useState(false);
  const logoAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [logoAnim]);

  useEffect(() => {
    fetchUnpublishedCourses();
  }, []);

  const fetchUnpublishedCourses = async () => {
    try {
      setLoadingUnpublished(true);
      const res = await CourseApi.get("/api/courses/unpublished");
      setUnpublishedCourses(res.data.data || []);
    } catch {
      setUnpublishedCourses([]);
    } finally {
      setLoadingUnpublished(false);
    }
  };

  // Unpublish handler
  const handleUnpublish = (course: any) => {
    setUnpublishTarget(course);
    setUnpublishModalVisible(true);
  };

  const confirmUnpublish = async () => {
    if (!unpublishTarget) return;
    try {
      await CourseApi.put(`/api/courses/${unpublishTarget.courseId}/unpublish`);
      setSuccessModal({
        visible: true,
        message: "Course unpublished successfully!",
      });
      setUnpublishModalVisible(false);
      setUnpublishTarget(null);
      fetchCourses();
      fetchUnpublishedCourses();
    } catch {
      setSuccessModal({
        visible: true,
        message: "Failed to unpublish course.",
      });
    }
  };

  // Publish handler
  const handlePublish = (course: any) => {
    setPublishTarget(course);
    setPublishModalVisible(true);
  };

  const confirmPublish = async () => {
    if (!publishTarget) return;
    try {
      await CourseApi.put(`/api/courses/${publishTarget.courseId}/publish`);
      setSuccessModal({
        visible: true,
        message: "Course published successfully!",
      });
      setPublishModalVisible(false);
      setPublishTarget(null);
      fetchCourses();
      fetchUnpublishedCourses();
    } catch {
      setSuccessModal({ visible: true, message: "Failed to publish course." });
    }
  };
  // --- FETCH DATA ---
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    CourseApi.get("/api/courses/published")
      .then((res) => setCourses(res.data.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  const openCourseDetails = (course: any) => {
    setSelectedDetailCourse(course);
    setDetailSidebarVisible(true);
  };

  const closeCourseDetails = () => {
    setDetailSidebarVisible(false);
    setSelectedDetailCourse(null);
  };

  const openQuizUpload = (course: any) => {
    router.push({
      pathname: "/(admin)/BulkQuizUpload",
      params: {
        courseId: course.courseId,
        courseName: course.title,
        courseData: JSON.stringify(course),
      },
    });
  };

  // --- MODAL HANDLERS ---
  const openLectureModal = (course: any) => {
    setSelectedCourseId(course.courseId);
    setSelectedCourseTitle(course.title);
    setForm({
      ...INITIAL_FORM_STATE,
      videoLibraryId: course.libraryId ? String(course.libraryId) : "",
    });
    setErrors({});
    setBunnyVideos([]); // Clear previous videos
    setModalVisible(true);
  };

  const closeLectureModal = () => {
    setModalVisible(false);
    setSelectedCourseId(null);
  };

  const updateField = (key: keyof LectureForm, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // --- BUNNY API FETCH ---
  const fetchBunnyVideos = async () => {
    if (!form.videoLibraryId) {
      Alert.alert("Required", "Please enter a Library ID first.");
      return;
    }

    setLoadingVideos(true);
    try {
      const url = `https://video.bunnycdn.com/library/${form.videoLibraryId}/videos?page=1&itemsPerPage=100`;
      const response = await axios.get(url, {
        headers: {
          AccessKey: "eb8560ce-e8a6-414c-8e250605c6d5-627d-4c55",
          Accept: "application/json",
        },
      });

      if (response.status === 200 && response.data.items) {
        setBunnyVideos(response.data.items);
        if (response.data.items.length > 0) {
          setVideoModalVisible(true);
        } else {
          Alert.alert("No Videos", "No videos found in this library.");
        }
      }
    } catch (error: any) {
      console.error("Bunny API Error:", error);
      Alert.alert(
        "Error",
        "Failed to fetch videos. Check Library ID or Network.",
      );
    } finally {
      setLoadingVideos(false);
    }
  };

  const selectBunnyVideo = (video: any) => {
    // Auto-fill fields from selected video
    setForm((prev) => ({
      ...prev,
      title: video.title ? video.title.replace(".mp4", "") : prev.title,
      videoGuid: video.guid,
      durationSeconds: video.length ? String(video.length) : "0",
    }));
    setVideoModalVisible(false);
  };

  useEffect(() => {
    const fetchAllBunnyCounts = async () => {
      const counts: { [libraryId: string]: number } = {};
      await Promise.all(
        courses
          .filter((c) => c.libraryId)
          .map(async (c) => {
            try {
              const url = `https://video.bunnycdn.com/library/${c.libraryId}/videos?page=1&itemsPerPage=1`;
              const res = await axios.get(url, {
                headers: {
                  AccessKey: "eb8560ce-e8a6-414c-8e250605c6d5-627d-4c55",
                  Accept: "application/json",
                },
              });
              counts[c.libraryId] = res.data.totalItems || 0;
            } catch {
              counts[c.libraryId] = 0;
            }
          }),
      );
      setBunnyVideoCounts(counts);
    };

    if (courses.length > 0) {
      fetchAllBunnyCounts();
    }
  }, [courses]);
  const validate = () => {
    const newErrors: any = {};
    if (!form.title.trim()) newErrors.title = "Required";
    if (!form.videoGuid.trim()) newErrors.videoGuid = "Required";
    if (!form.videoLibraryId.trim()) newErrors.videoLibraryId = "Required";
    if (parseInt(form.durationSeconds) <= 0)
      newErrors.durationSeconds = "Invalid";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitLecture = async () => {
    setLectureMessage(null);
    setLectureMessageType(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        courseId: selectedCourseId,
        videoLibraryId: parseInt(form.videoLibraryId),
        videoGuid: form.videoGuid,
        title: form.title,
        description: form.description,
        durationSeconds: parseInt(form.durationSeconds),
        isPreview: form.isPreview,
        orderIndex: parseInt(form.orderIndex),
      };
      await CourseApi.post("/api/videos/link", payload);
      setLectureMessage("Lecture linked successfully!");
      setLectureMessageType("success");
      Alert.alert("Success", "Lecture linked successfully!", [
        { text: "OK", onPress: closeLectureModal },
      ]);
      fetchCourses();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to link lecture.";
      setLectureMessage(msg);
      setLectureMessageType("error");
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    const performDelete = async () => {
      try {
        await CourseApi.delete(`/api/courses/${courseId}`);
        if (Platform.OS === "web") window.alert("Deleted Successfully");
        else Alert.alert("Deleted", "Course deleted successfully.");
        fetchCourses();
      } catch (error: any) {
        const msg = error.response?.data?.message || "Failed to delete.";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Error", msg);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to delete this course?"))
        performDelete();
    } else {
      Alert.alert("Delete Course", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: performDelete },
      ]);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ================= COMPACT HEADER SECTION ================= */}
      {/* Reduced Height: h-28 on mobile (approx 110px), h-36 on desktop */}
      <View className="h-32 md:h-40 bg-indigo-900 relative z-20">
        {/* SVG Container - Clipped */}
        <View className="absolute inset-0 overflow-hidden">
          <HeaderBgSvg />
        </View>

        {/* Header Content */}
        <View
          className={`flex-1 px-6 md:px-12 justify-start ${Platform.OS === "android" ? "pt-10" : "pt-4"}`}
        >
          <View className="flex-row justify-between items-center mb-1">
            <View>
              <Text className="text-2xl font-black text-white shadow-sm tracking-tight">
                Courses
              </Text>
              <Text className="text-indigo-200 text-[10px] font-medium opacity-90 uppercase tracking-widest">
                Admin Console
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => {
                  setShowUnpublished(true);
                  fetchUnpublishedCourses();
                }}
                className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg flex-row items-center hover:bg-white/20 mr-2"
              >
                <Ionicons name="eye-off-outline" size={16} color="white" />
                <Text className="text-white font-bold ml-1 text-xs">
                  Unpublished ({unpublishedCourses.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(admin)/Courseform")}
                activeOpacity={0.8}
                className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg flex-row items-center hover:bg-white/20"
              >
                <Ionicons name="add" size={16} color="white" />
                <Text className="text-white font-bold ml-1 text-xs">
                  Add New
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Floating Search Bar - POPPED OUT with negative margin to overlap */}
        <View className="absolute -bottom-6 left-6 right-6 md:left-12 md:right-12 z-50">
          <View className="bg-white rounded-xl shadow-xl shadow-slate-300 flex-row items-center px-4 h-12 border border-slate-100">
            <Ionicons name="search" size={18} color="#475569" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search courses by name..."
              placeholderTextColor="#94a3b8"
              className="flex-1 h-full ml-3 text-slate-800 text-sm font-medium"
              style={{ outlineStyle: "none" } as any}
            />
          </View>
        </View>
      </View>

      {/* ================= CONTENT SECTION ================= */}
      {/* Added pt-12 to push content below the floating search bar */}
      <View className="flex-1 pt-12 px-5 md:px-12">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : filteredCourses.length === 0 ? (
          <View className="flex-1 items-center justify-center opacity-70">
            <Animated.View style={{ transform: [{ scale: logoAnim }] }}>
              <EmptyStateSvg />
            </Animated.View>
            <Text className="text-slate-400 font-bold mt-6 text-center text-sm">
              {courses.length === 0
                ? "No courses available yet."
                : "No matching courses found."}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: gap }}>
              {filteredCourses.map((c, index) => (
                <Pressable
                  key={c.courseId}
                  onPress={() => openCourseDetails(c)}
                  className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  style={{ width: cardWidth }}
                >
                  {/* VECTOR GRAPHIC HERO */}
                  <View className="h-32 bg-slate-100 relative">
                    <CourseVectorThumbnail index={index} title={c.title} />

                    {/* Status Badges */}
                    <View className="absolute top-2 left-2 flex-row gap-1.5">
                      <View
                        className={`px-2 py-0.5 rounded backdrop-blur-md border border-white/10 ${c.isFree ? "bg-emerald-500/90" : "bg-indigo-600/90"}`}
                      >
                        <Text className="text-[8px] font-bold text-white uppercase tracking-wide">
                          {c.isFree ? "FREE" : "PAID"}
                        </Text>
                      </View>
                      {!c.isPublished && (
                        <View className="px-2 py-0.5 rounded bg-orange-500/90 backdrop-blur-md border border-white/10">
                          <Text className="text-[8px] font-bold text-white uppercase tracking-wide">
                            Draft
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Delete Action */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(c.courseId);
                      }}
                      className="absolute top-2 right-2 bg-black/20 backdrop-blur-md p-1.5 rounded-lg border border-white/10 hover:bg-rose-500/80 transition-colors"
                    >
                      <Ionicons name="trash-outline" size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  {/* Card Content */}
                  <View className="p-3 flex-1 justify-between bg-white">
                    <View>
                      <Text
                        className="text-base font-bold text-slate-800 leading-tight mb-1"
                        numberOfLines={1}
                      >
                        {c.title}
                      </Text>
                      <Text
                        className="text-[11px] text-slate-500 mb-3 h-8 leading-4"
                        numberOfLines={2}
                      >
                        {c.description || "No description provided."}
                      </Text>

                      <View className="flex-row items-center justify-between pb-3 border-b border-slate-50 mb-3">
                        <View className="flex-row items-center">
                          <Ionicons
                            name="book-outline"
                            size={10}
                            color="#94a3b8"
                          />
                          <Text className="text-[10px] text-slate-500 ml-1 font-medium">
                            {c.lecturesCount || 0} Lessons
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons
                            name="time-outline"
                            size={10}
                            color="#94a3b8"
                          />
                          <Text className="text-[10px] text-slate-500 ml-1 font-medium">
                            {Math.floor(c.totalDuration / 60)}h
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action Footer */}
                    <View className="flex-row gap-2 border-t border-slate-50 pt-2">
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          openLectureModal(c);
                        }}
                        className="flex-1 bg-indigo-50 hover:bg-indigo-100 py-1.5 rounded-lg flex-row items-center justify-center border border-indigo-100 transition-colors"
                      >
                        <Ionicons name="videocam" size={12} color="#4f46e5" />
                        <Text className="text-indigo-700 font-bold text-[10px] ml-1">
                          Video
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          openQuizUpload(c);
                        }}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 py-1.5 rounded-lg flex-row items-center justify-center border border-slate-200 transition-colors"
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={12}
                          color="#64748b"
                        />
                        <Text className="text-slate-600 font-bold text-[10px] ml-1">
                          Quiz
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleUnpublish(c);
                        }}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 py-1.5 rounded-lg flex-row items-center justify-center border border-rose-200 transition-colors"
                      >
                        <Ionicons
                          name="eye-off-outline"
                          size={12}
                          color="#dc2626"
                        />
                        <Text className="text-rose-700 font-bold text-[10px] ml-1">
                          Unpublish
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
      {/* --- UNPUBLISH MODAL (Alert Style) --- */}
      <Modal
        visible={unpublishModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUnpublishModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-[28px] p-8 w-full max-w-sm items-center shadow-2xl">
            <View className="bg-orange-100 p-4 rounded-full mb-4">
              <Ionicons name="alert-circle" size={32} color="#f59e42" />
            </View>

            <Text className="font-extrabold text-xl mb-2 text-slate-800 text-center">
              Unpublish Course?
            </Text>

            <Text className="text-slate-500 mb-8 text-center leading-5">
              Are you sure you want to hide{" "}
              <Text className="font-semibold text-slate-700">
                "{unpublishTarget?.title}"
              </Text>{" "}
              from students?
            </Text>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setUnpublishModalVisible(false)}
                activeOpacity={0.7}
                className="flex-1 bg-slate-100 py-3.5 rounded-2xl items-center"
              >
                <Text className="font-bold text-slate-600">No, Keep it</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmUnpublish}
                activeOpacity={0.8}
                className="flex-1 bg-rose-500 py-3.5 rounded-2xl items-center shadow-lg shadow-rose-200"
              >
                <Text className="font-bold text-white">Yes, Unpublish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Success Modal --- */}
      <Modal
        visible={successModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuccessModal({ visible: false, message: "" })}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-[28px] p-8 w-full max-w-sm items-center shadow-2xl border border-emerald-50">
            <View className="bg-emerald-100 p-4 rounded-full mb-4">
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            </View>

            <Text className="font-extrabold text-xl text-emerald-800 text-center">
              Success!
            </Text>

            <Text className="text-slate-500 mt-2 mb-8 text-center">
              {successModal.message}
            </Text>

            <TouchableOpacity
              onPress={() => setSuccessModal({ visible: false, message: "" })}
              activeOpacity={0.8}
              className="w-full bg-slate-900 py-3.5 rounded-2xl items-center"
            >
              <Text className="font-bold text-white text-base">Awesome</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- Unpublished Courses Modal --- */}
      <Modal
        visible={showUnpublished}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUnpublished(false)}
      >
        <View className="flex-1 bg-slate-900/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 w-full h-[80%] shadow-2xl">
            {/* Header Handle */}
            <View className="w-12 h-1.5 bg-slate-200 rounded-full self-center mb-6" />

            <View className="flex-row justify-between items-center mb-6 px-2">
              <View>
                <Text className="font-black text-2xl text-slate-800">
                  Drafts
                </Text>
                <Text className="text-slate-400 text-sm">
                  Courses currently hidden
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowUnpublished(false)}
                className="bg-slate-100 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {loadingUnpublished ? (
              <View className="flex-1 justify-center">
                <ActivityIndicator size="large" color="#4f46e5" />
              </View>
            ) : unpublishedCourses.length === 0 ? (
              <View className="flex-1 justify-center items-center">
                <Ionicons name="Construct-outline" size={60} color="#e2e8f0" />
                <Text className="text-slate-400 text-center mt-4 font-medium">
                  Your draft folder is empty.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: gap,
                  }}
                  className="pb-10"
                >
                  {unpublishedCourses.map((course: any, index: number) => (
                    <View
                      key={course.courseId}
                      className="bg-slate-50 border border-slate-100 rounded-[20px] p-5 flex-col justify-between"
                      style={{
                        width: cardWidth, // use the same cardWidth as published courses
                        marginBottom: gap,
                      }}
                    >
                      {/* Thumbnail & Info */}
                      <View className="mb-4">
                        <View className="h-32 bg-slate-100 relative rounded-xl overflow-hidden">
                          <CourseVectorThumbnail
                            index={index}
                            title={course.title}
                          />

                          {/* Status Badges */}
                          <View className="absolute top-2 left-2 flex-row gap-1.5">
                            <View
                              className={`px-2 py-0.5 rounded backdrop-blur-md border border-white/10 ${
                                course.isFree
                                  ? "bg-emerald-500/90"
                                  : "bg-indigo-600/90"
                              }`}
                            >
                              <Text className="text-[8px] font-bold text-white uppercase tracking-wide">
                                {course.isFree ? "FREE" : "PAID"}
                              </Text>
                            </View>
                            {!course.isPublished && (
                              <View className="px-2 py-0.5 rounded bg-orange-500/90 backdrop-blur-md border border-white/10">
                                <Text className="text-[8px] font-bold text-white uppercase tracking-wide">
                                  Draft
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Delete Action */}
                          {/*<TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteCourse(course.courseId);
                            }}
                            className="absolute top-2 right-2 bg-black/20 backdrop-blur-md p-1.5 rounded-lg border border-white/10 hover:bg-rose-500/80 transition-colors"
                          >
                            <Ionicons
                              name="trash-outline"
                              size={12}
                              color="#fff"
                            />
                          </TouchableOpacity>*/}
                        </View>
                      </View>

                      {/* Card Content */}
                      <Text
                        className="font-bold text-slate-800 text-lg"
                        numberOfLines={1}
                      >
                        {course.title}
                      </Text>
                      <Text className="text-slate-400 text-xs mt-1 uppercase tracking-widest font-semibold">
                        Hidden from Store
                      </Text>
                      <Text
                        className="text-[11px] text-slate-500 mb-3 h-8 leading-4"
                        numberOfLines={2}
                      >
                        {course.description || "No description provided."}
                      </Text>
                      <View className="flex-row items-center justify-between pb-3 border-b border-slate-50 mb-3">
                        <View className="flex-row items-center">
                          <Ionicons
                            name="book-outline"
                            size={10}
                            color="#94a3b8"
                          />
                          <Text className="text-[10px] text-slate-500 ml-1 font-medium">
                            {course.lecturesCount || 0} Lessons
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons
                            name="time-outline"
                            size={10}
                            color="#94a3b8"
                          />
                          <Text className="text-[10px] text-slate-500 ml-1 font-medium">
                            {Math.floor(course.totalDuration / 60)}h
                          </Text>
                        </View>
                      </View>

                      {/* Publish Button */}
                      <TouchableOpacity
                        onPress={() => handlePublish(course)}
                        activeOpacity={0.7}
                        className="bg-indigo-600 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200"
                      >
                        <Text className="font-bold text-white">Publish</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* --- Confirm Publish Modal --- */}
      <Modal
        visible={publishModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPublishModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white rounded-[28px] p-8 w-full max-w-sm items-center shadow-2xl">
            <View className="bg-indigo-100 p-4 rounded-full mb-4">
              <Ionicons name="rocket" size={32} color="#4f46e5" />
            </View>

            <Text className="font-extrabold text-xl mb-2 text-slate-800 text-center">
              Ready to Go Live?
            </Text>

            <Text className="text-slate-500 mb-8 text-center leading-5">
              This will make{" "}
              <Text className="font-semibold text-slate-700">
                "{publishTarget?.title}"
              </Text>{" "}
              visible to all students.
            </Text>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setPublishModalVisible(false)}
                activeOpacity={0.7}
                className="flex-1 bg-slate-100 py-3.5 rounded-2xl items-center"
              >
                <Text className="font-bold text-slate-600">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmPublish}
                activeOpacity={0.8}
                className="flex-1 bg-indigo-600 py-3.5 rounded-2xl items-center shadow-lg shadow-indigo-200"
              >
                <Text className="font-bold text-white text-base">Go Live</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* --- SIDEBAR & MODALS (Kept same logic) --- */}
      <CourseDetailSidebar
        course={selectedDetailCourse}
        visible={detailSidebarVisible}
        onClose={closeCourseDetails}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeLectureModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/60 backdrop-blur-sm"
        >
          <TouchableWithoutFeedback onPress={closeLectureModal}>
            <View className="absolute top-0 bottom-0 left-0 right-0" />
          </TouchableWithoutFeedback>

          <View
            className={`bg-white rounded-t-3xl p-6 shadow-2xl ${isDesktop ? "w-[500px] self-center rounded-3xl mb-10 h-[85%]" : "h-[90%] w-full"}`}
          >
            <View className="flex-row justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <View>
                <Text className="text-xl font-bold text-slate-800">
                  New Lecture
                </Text>
                <Text className="text-xs text-indigo-500 font-bold mt-0.5">
                  For: {selectedCourseTitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeLectureModal}
                className="bg-slate-100 p-2 rounded-full"
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <Text className="text-xs font-bold text-slate-400 uppercase mb-3">
                General Information
              </Text>
              <View className="space-y-4 mb-6">
                <View>
                  <Text className="text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                    Title *
                  </Text>
                  <TextInput
                    className={`bg-slate-50 border rounded-xl px-4 py-3 ${errors.title ? "border-red-500" : "border-slate-200"}`}
                    value={form.title}
                    onChangeText={(t) => updateField("title", t)}
                    placeholder="e.g. Introduction to React"
                  />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                    Description
                  </Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-24 text-top"
                    value={form.description}
                    onChangeText={(t) => updateField("description", t)}
                    placeholder="Brief summary of the lecture..."
                    multiline
                  />
                </View>
              </View>

              <Text className="text-xs font-bold text-slate-400 uppercase mb-3">
                Video Settings
              </Text>
              <View className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4 mb-6">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-slate-700 mb-1.5">
                      Library ID
                    </Text>
                    <TextInput
                      className={`bg-white border rounded-xl px-3 py-2.5 ${errors.videoLibraryId ? "border-red-500" : "border-slate-200"}`}
                      value={form.videoLibraryId}
                      onChangeText={(t) => updateField("videoLibraryId", t)}
                      placeholder="Lib ID"
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-slate-700 mb-1.5">
                      Sort Order
                    </Text>
                    <TextInput
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2.5"
                      value={form.orderIndex}
                      onChangeText={(t) => updateField("orderIndex", t)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View>
                  <Text className="text-xs font-semibold text-slate-700 mb-1.5">
                    Video GUID *
                  </Text>
                  <TextInput
                    className={`bg-white border rounded-xl px-4 py-3 ${errors.videoGuid ? "border-red-500" : "border-slate-200"}`}
                    value={form.videoGuid}
                    onChangeText={(t) => updateField("videoGuid", t)}
                    placeholder="Paste BunnyCDN GUID here"
                  />
                </View>
                <View className="flex-row items-center justify-between pt-2">
                  <View className="flex-row items-center bg-white px-3 py-2 rounded-lg border border-slate-200">
                    <Text className="text-xs font-semibold text-slate-600 mr-2">
                      Preview?
                    </Text>
                    <Switch
                      value={form.isPreview}
                      onValueChange={(v) => updateField("isPreview", v)}
                      trackColor={{ false: "#cbd5e1", true: "#4f46e5" }}
                      thumbColor={"#fff"}
                    />
                  </View>
                  <View className="w-1/2">
                    <TextInput
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                      value={form.durationSeconds}
                      onChangeText={(t) => updateField("durationSeconds", t)}
                      placeholder="Duration (sec)"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
              <View className="mb-6">
                <TouchableOpacity
                  onPress={fetchBunnyVideos}
                  disabled={loadingVideos}
                  className="flex-row items-center justify-center bg-indigo-50 border border-indigo-200 py-3 rounded-xl active:bg-indigo-100"
                >
                  {loadingVideos ? (
                    <ActivityIndicator size="small" color="#4f46e5" />
                  ) : (
                    <>
                      <Ionicons
                        name="cloud-download-outline"
                        size={18}
                        color="#4f46e5"
                      />
                      <Text className="ml-2 text-indigo-700 font-bold">
                        Fetch from BunnyCDN
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* --- BUNNY VIDEOS LIST MODAL (NESTED OR CONDITIONAL) --- */}
              {videoModalVisible && (
                <View className="bg-slate-100 p-4 rounded-2xl mb-6 border border-slate-200">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-bold text-slate-700">
                      Select a Video
                    </Text>
                    <TouchableOpacity
                      onPress={() => setVideoModalVisible(false)}
                    >
                      <Ionicons name="close-circle" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    style={{ maxHeight: 250 }}
                    nestedScrollEnabled={true}
                  >
                    {bunnyVideos.map((video) => (
                      <TouchableOpacity
                        key={video.guid}
                        onPress={() => selectBunnyVideo(video)}
                        className="bg-white p-3 rounded-lg mb-2 border border-slate-200 flex-row items-center"
                      >
                        <View className="bg-indigo-100 p-2 rounded-md mr-3">
                          <Ionicons name="videocam" size={16} color="#4f46e5" />
                        </View>
                        <View className="flex-1">
                          <Text
                            className="text-xs font-bold text-slate-800"
                            numberOfLines={1}
                          >
                            {video.title}
                          </Text>
                          <Text className="text-[10px] text-slate-400">
                            ID: {video.guid.substring(0, 8)}... |{" "}
                            {Math.floor(video.length / 60)}m
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={14}
                          color="#cbd5e1"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              <TouchableOpacity
                onPress={handleSubmitLecture}
                disabled={submitting}
                className="shadow-lg shadow-indigo-200"
              >
                <LinearGradient
                  colors={["#4f46e5", "#4338ca"]}
                  className="py-4 rounded-xl items-center"
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-lg">
                      Save Lecture
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {lectureMessage && (
                <View
                  className={`mt-4 p-3 rounded-lg flex-row items-center justify-center ${lectureMessageType === "success" ? "bg-emerald-50" : "bg-red-50"}`}
                >
                  <Ionicons
                    name={
                      lectureMessageType === "success"
                        ? "checkmark-circle"
                        : "alert-circle"
                    }
                    size={18}
                    color={
                      lectureMessageType === "success" ? "#10b981" : "#ef4444"
                    }
                  />
                  <Text
                    className={`ml-2 text-sm font-bold ${lectureMessageType === "success" ? "text-emerald-700" : "text-red-700"}`}
                  >
                    {lectureMessage}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
