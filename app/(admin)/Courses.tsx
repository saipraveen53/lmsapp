import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated, Easing,
  Image,
  ImageBackground, // Added
  KeyboardAvoidingView,
  Linking, // Added
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { rootApi } from "../(utils)/axiosInstance";

import "../globals.css";

// --- HELPER: Get Image ---
const getCourseImage = (url: string | null) => {
  if (url && url.length > 5) return { uri: url };
  return { uri: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop" };
};

// ----------------------------------------------------------------------
// SIDEBAR HELPER COMPONENTS (Copied from CourseDetails.tsx)
// ----------------------------------------------------------------------

const TechRow = ({ label, value }: { label: string, value: any }) => (
  <View className="flex-row justify-between py-1 border-b border-slate-100">
    <Text className="text-[10px] font-bold text-slate-500 uppercase">{label}</Text>
    <Text className="text-[10px] text-slate-600 font-mono text-right flex-1 ml-4" numberOfLines={1}>
        {value !== null && value !== undefined ? String(value) : "N/A"}
    </Text>
  </View>
);

const FeatureItem = ({ icon, text, color = "#4f46e5" }: any) => (
    <View className="flex-row items-center mb-2 mr-4">
        <Ionicons name={icon} size={14} color={color} />
        <Text className="text-xs text-slate-700 ml-1.5 font-medium">{text}</Text>
    </View>
);

// ----------------------------------------------------------------------
// SIDEBAR COMPONENT
// ----------------------------------------------------------------------
const CourseDetailSidebar = ({ course, visible, onClose }: any) => {
    const [imgError, setImgError] = useState(false);
    const { height } = useWindowDimensions();

    if (!course) return null;

    // Helper to handle link opening
    const openLink = (url: string | null) => {
        if(url) Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    // Render Helpers
    const renderDescriptionContent = () => (
        <>
            <Text className="text-xl font-bold text-slate-800 mb-3">About this Course</Text>
            <Text className="text-slate-600 leading-7 text-sm">{course.description}</Text>
            
            <View className="mt-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <Text className="font-bold text-purple-900 mb-2 flex-row items-center">
                    <Ionicons name="school" size={16} /> What You Will Learn
                    </Text>
                    <Text className="text-purple-800 text-sm leading-5">{course.whatYouWillLearn}</Text>
            </View>
        </>
    );

    const renderSectionItem = (section: any) => (
        <View key={section.id} className="mb-5 border border-slate-200 rounded-xl overflow-hidden">
            <LinearGradient
                colors={['#f8fafc', '#f1f5f9']}
                className="p-3 border-b border-slate-200 flex-row justify-between items-center"
            >
                <View>
                    <Text className="font-bold text-slate-700 text-sm">Sec {section.orderIndex}: {section.title}</Text>
                    <Text className="text-[10px] text-slate-400 mt-0.5">{section.description}</Text>
                </View>
                <Text className="text-[10px] text-slate-300 font-mono">ID: {section.id}</Text>
            </LinearGradient>

            <View className="bg-white p-2">
                {section.lectures && section.lectures.length > 0 ? (
                    section.lectures.map((lecture: any) => (
                        <View key={lecture.id} className="flex-row mb-3 last:mb-0 p-2 hover:bg-slate-50 rounded-lg">
                            <View className="w-20 h-14 bg-slate-200 rounded-md overflow-hidden mr-3 relative">
                                <Image 
                                    source={{ uri: lecture.thumbnailUrl || "https://via.placeholder.com/150" }} 
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                                {lecture.isPreview && (
                                    <View className="absolute inset-0 items-center justify-center bg-black/20">
                                        <Ionicons name="play" size={16} color="white" />
                                    </View>
                                )}
                            </View>
                            <View className="flex-1 justify-center">
                                <View className="flex-row justify-between">
                                    <Text className="font-semibold text-slate-700 text-xs">{lecture.title}</Text>
                                    <Text className="text-[9px] text-slate-300 font-mono">ID:{lecture.id}</Text>
                                </View>
                                <Text className="text-[10px] text-slate-500 mt-0.5" numberOfLines={1}>{lecture.description}</Text>
                                <View className="flex-row flex-wrap items-center mt-1 gap-2">
                                    <View className="bg-slate-100 px-1.5 rounded"><Text className="text-[8px] text-slate-400 font-mono">GUID: {lecture.videoGuid || "N/A"}</Text></View>
                                    {lecture.allowDownload && <Ionicons name="download" size={10} color="#10b981" />}
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text className="text-[10px] text-slate-400 text-center py-2 italic">No lectures found.</Text>
                )}
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View className="flex-1 flex-row justify-end bg-black/50">
                {/* Backdrop Click to Close */}
                <Pressable className="flex-1" onPress={onClose} />
                
                {/* Sidebar Container */}
                <View className="w-full md:w-[480px] bg-slate-100 shadow-2xl h-full">
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                        
                        {/* 1. HERO IMAGE (Mobile Layout Style) */}
                        <View className="relative w-full h-[350px]">
                            <ImageBackground
                                source={{ uri: !imgError && course.thumbnailUrl ? course.thumbnailUrl : "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop" }}
                                className="w-full h-full"
                                resizeMode="cover"
                                onError={() => setImgError(true)}
                            >
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(15, 23, 42, 1)']}
                                    className="flex-1 justify-between p-6 pt-12"
                                >
                                    <Pressable 
                                        onPress={onClose}
                                        className="self-start bg-black/30 backdrop-blur-md px-3 py-2 rounded-full flex-row items-center border border-white/20"
                                    >
                                        <Ionicons name="close" size={18} color="white" />
                                        {/*<Text className="text-white font-bold ml-2">Close</Text>*/}
                                    </Pressable>

                                    <View className="mb-8">
                                        <View className="flex-row flex-wrap gap-2 mb-3">
                                            <View className="bg-indigo-600 px-3 py-1 rounded-md">
                                                <Text className="text-white text-xs font-bold uppercase">{course.category || "Development"}</Text>
                                            </View>
                                             {course.isFree && <View className="bg-emerald-500 px-3 py-1 rounded-md"><Text className="text-white text-xs font-bold">FREE</Text></View>}
                                             {!course.isPublished && <View className="bg-orange-500 px-3 py-1 rounded-md"><Text className="text-white text-xs font-bold">DRAFT</Text></View>}
                                        </View>

                                        <Text className="text-2xl font-extrabold text-white shadow-lg leading-tight mb-2">
                                            {course.title}
                                        </Text>
                                        
                                        <View className="flex-row items-center gap-4">
                                            <View className="flex-row items-center bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                                                <Ionicons name="star" size={16} color="#fbbf24" />
                                                <Text className="text-white font-bold ml-1.5">{course.rating?.toFixed(1) || "0.0"}</Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons name="people" size={16} color="#cbd5e1" />
                                                <Text className="text-slate-300 ml-1.5 font-medium">{course.totalStudents} Enrolled</Text>
                                            </View>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </ImageBackground>
                        </View>

                        {/* 2. STACKED CONTENT (Price -> Desc -> Curriculum) */}
                        <View className="px-4 -mt-10">
                            
                            {/* Price & Tech Card */}
                            <View className="mb-6">
                                <View className="bg-white rounded-xl shadow-lg p-5 border-t-4 border-indigo-500 mb-6">
                                    <Text className="text-2xl font-bold text-slate-800 mb-1">{course.isFree ? "Free" : `$${course.price}`}</Text>
                                    <Text className="text-xs text-slate-400 font-bold uppercase mb-4 tracking-wide">Course Price</Text>
                                    <View className="space-y-3">
                                        <FeatureItem icon="cellular-outline" text={`Level: ${course.level}`} />
                                        <FeatureItem icon="language-outline" text={`Language: ${course.language}`} />
                                        <FeatureItem icon="layers-outline" text={`${course.totalLectures} Total Lectures`} />
                                        <FeatureItem icon="checkmark-circle-outline" text={course.requirements} />
                                    </View>
                                </View>

                                <View className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                                    <Text className="text-xs font-bold text-slate-400 uppercase mb-3 flex-row items-center">
                                        <Ionicons name="code-slash" size={12} /> System Data
                                    </Text>
                                    <TechRow label="Course ID" value={course.courseId} />
                                    <TechRow label="Library ID" value={course.libraryId} />
                                    <TechRow label="Created At" value={course.createdAt} />
                                    <TechRow label="Updated At" value={course.updatedAt} />
                                    <TechRow label="Published At" value={course.publishedAt} />
                                    <Pressable 
                                        onPress={() => openLink(course.previewVideoUrl)}
                                        className="mt-3 flex-row items-center bg-indigo-50 p-2 rounded border border-indigo-100 active:bg-indigo-100"
                                    >
                                         <Ionicons name="play-circle" size={16} color="#4f46e5" />
                                         <Text className="text-[10px] text-indigo-700 font-bold ml-2 flex-1" numberOfLines={1}>
                                            {course.previewVideoUrl || "No Preview URL"}
                                         </Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Description & Curriculum */}
                            <View className="bg-white rounded-2xl shadow-sm p-6 min-h-[500px]">
                                <View className="mb-8 border-b border-slate-100 pb-6">
                                    {renderDescriptionContent()}
                                </View>

                                <View>
                                    <View className="flex-row justify-between items-end mb-4">
                                        <Text className="text-xl font-bold text-slate-800">Curriculum</Text>
                                        <Text className="text-xs text-slate-400">{course.sections?.length || 0} Sections • {course.totalLectures} Lectures</Text>
                                    </View>
                                    {course.sections && course.sections.length > 0 ? (
                                        course.sections.map((section: any) => renderSectionItem(section))
                                    ) : (
                                        <View className="p-8 border-2 border-dashed border-slate-200 rounded-xl items-center justify-center">
                                            <Ionicons name="file-tray-outline" size={32} color="#cbd5e1" />
                                            <Text className="text-slate-400 mt-2 text-xs">No curriculum content available.</Text>
                                        </View>
                                    )}
                                </View>
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

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // --- SIDEBAR STATE ---
  const [detailSidebarVisible, setDetailSidebarVisible] = useState(false);
  const [selectedDetailCourse, setSelectedDetailCourse] = useState<any>(null);

  // --- MODAL STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>("");
  const [form, setForm] = useState<LectureForm>(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LectureForm, string>>>({});

  const [lectureMessage, setLectureMessage] = useState<string | null>(null);
  const [lectureMessageType, setLectureMessageType] = useState<"success" | "error" | null>(null);
  const { width } = useWindowDimensions();
  const router = useRouter();

  // --- RESPONSIVE LOGIC (FIXED) ---
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  
  const columns = isDesktop ? 3 : isTablet ? 2 : 1;
  const gap = 20; // Gap between cards
  
  // Mobile lo padding 16 (px-4), Desktop lo 24 (px-6)
  const containerPadding = isDesktop ? 48 : 16; // (Left + Right Padding total)
  
  // Correct Card Width Formula: (Screen - Padding - TotalGapSpace) / Columns
  const totalGapSpace = gap * (columns );
  const cardWidth = (width - containerPadding - totalGapSpace) / columns;

  const logoAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1.10,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start();
}, [logoAnim]);
  // --- FETCH COURSES ---
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    rootApi.get("http://192.168.0.105:8088/api/courses")
      .then(res => {
        setCourses(res.data.data || []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  // UPDATED: Open Sidebar instead of pushing to new route
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
        pathname: '/(admin)/BulkQuizUpload',
        params: { 
            courseId: course.courseId, 
            courseName: course.title,
            courseData: JSON.stringify(course) 
        } 
    });
  };

  // --- HANDLERS FOR LECTURE FORM ---

  const openLectureModal = (course: any) => {
    setSelectedCourseId(course.courseId);
    setSelectedCourseTitle(course.title);
    setForm(INITIAL_FORM_STATE); 
    setErrors({});
    setModalVisible(true);
  };

  const closeLectureModal = () => {
    setModalVisible(false);
    setSelectedCourseId(null);
  };

  const updateField = (key: keyof LectureForm, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!form.title.trim()) newErrors.title = "Lecture Title is required";
    if (!form.videoGuid.trim()) newErrors.videoGuid = "Video GUID is required";
    if (!form.videoLibraryId.trim()) newErrors.videoLibraryId = "Library ID is required";
    if (parseInt(form.durationSeconds) <= 0) newErrors.durationSeconds = "Duration must be > 0";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );
  const handleSubmitLecture = async () => {
  setLectureMessage(null);
  setLectureMessageType(null);

  if (!validate()) {
    setLectureMessage("Please fix the highlighted errors.");
    setLectureMessageType("error");
    Alert.alert("Validation Error", "Please fix the highlighted errors.");
    return;
  }

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
      orderIndex: parseInt(form.orderIndex)
    };

    await rootApi.post("http://192.168.0.105:8088/api/videos/link", payload);

    setLectureMessage("Lecture linked successfully!");
    setLectureMessageType("success");
    Alert.alert("Success", "Lecture linked successfully!", [
      { text: "OK", onPress: closeLectureModal }
    ]);
    fetchCourses(); 

  } catch (error: any) {
    console.error("Lecture Creation Error:", error);
    const msg = error.response?.data?.message || "Failed to link lecture.";
    setLectureMessage(msg);
    setLectureMessageType("error");
    Alert.alert("Error", msg);
  } finally {
    setSubmitting(false);
  }
};

const handleDeleteCourse = (courseId: string) => {
  if (Platform.OS === "web") {
    const confirmed = window.confirm("Are you sure you want to delete this course?");
    if (!confirmed) return;
    (async () => {
      try {
        await rootApi.delete(`http://192.168.0.105:8088/api/courses/${courseId}`);
        if (window.alert) window.alert("Course deleted successfully.");
        fetchCourses();
      } catch (error: any) {
        window.alert(error?.response?.data?.message || "Failed to delete course.");
      }
    })();
    return;
  }

  Alert.alert(
    "Delete Course",
    "Are you sure you want to delete this course?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await rootApi.delete(`http://192.168.0.105:8088/api/courses/${courseId}`);
            Alert.alert("Deleted", "Course deleted successfully.");
            fetchCourses();
          } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to delete course.");
          }
        },
      },
    ]
  );
};
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-6 pt-6">
        
        {/* --- Header Section with Search Bar --- */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">Courses</Text>
              <Text className="text-sm font-medium text-slate-500 mt-1">Manage your academy content</Text>
            </View>
            <Pressable onPress={() => router.push("/(admin)/Courseform")} className="active:opacity-90">
              <LinearGradient
                colors={['#4f46e5', '#7c3aed']}
                start={{x:0, y:0}} end={{x:1, y:1}}
                className="flex-row items-center px-5 py-3 rounded-xl shadow-lg shadow-indigo-200"
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text className="text-white font-bold ml-2 text-sm">New Course</Text>
              </LinearGradient>
            </Pressable>
          </View>
          {/* --- Search Bar --- */}
          <View style={{ marginTop: 16 }}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search courses..."
              placeholderTextColor="#94a3b8"
              style={{
                backgroundColor: "#f1f5f9",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 16,
                color: "#1e293b",
                borderWidth: 1,
                borderColor: "#e5e7eb",
              }}
            />
          </View>
        </View>

        {/* --- Content Grid --- */}
       {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : filteredCourses.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", marginTop: 60 }}>
            <Animated.Image
              source={require("../../assets/images/anasol-logo.png")}
              style={{
                width: 100,
                height: 100,
                transform: [{ scale: logoAnim }],
                marginBottom: 8,
              }}
              resizeMode="contain"
            />
            <Text style={{ color: "#64748b", fontSize: 14, fontWeight: "bold", marginTop: 12 }}>
              {courses.length === 0
                ? "No courses found or server unavailable."
                : "No courses match your search."}
            </Text>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={{ paddingBottom: 100 }} 
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: gap }}>
              {filteredCourses.map((c) => (
                <Pressable
                  key={c.courseId}
                  onPress={() => openCourseDetails(c)}
                  className="bg-white rounded-2xl shadow-sm shadow-slate-200 border border-slate-100 overflow-hidden group hover:shadow-md transition-all"
                  style={{ width: cardWidth }}
                >
                  {/* Thumbnail */}
                  <View className="h-40 md:h-48 relative bg-slate-100">
                    <Image source={getCourseImage(c.thumbnailUrl)} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute top-3 right-3">
                       <View className={`px-2.5 py-1 rounded-md backdrop-blur-md ${c.isFree ? 'bg-emerald-500' : 'bg-slate-900'}`}>
                          <Text className="text-[10px] font-bold text-white uppercase tracking-wide">
                            {c.isFree ? "FREE" : "PAID"}
                          </Text>
                       </View>
                    </View>
                  </View>

                  {/* Card Content */}
                  <View className="p-4">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className="text-base md:text-lg font-bold text-slate-800 leading-tight flex-1 mr-2" numberOfLines={1}>
                        {c.title}
                      </Text>
                    </View>
                    
                    <Text className="text-xs text-slate-500 mb-3 leading-4 h-8" numberOfLines={2}>
                      {c.description || "No description provided."}
                    </Text>

                    <View className="flex-row items-center gap-4 mb-4 pb-3 border-b border-slate-50">
                        <View className="flex-row items-center">
                           <Ionicons name="book-outline" size={14} color="#94a3b8" />
                           <Text className="text-xs text-slate-500 ml-1 font-medium">{c.lecturesCount || 0} Lessons</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={(e) => {
                            e.stopPropagation();
                            openLectureModal(c);
                        }} 
                        className="bg-emerald-50 p-2.5 rounded-lg flex-row items-center justify-center border border-emerald-100"
                        style={{ width: 40 }}
                      >
                        <Ionicons name="videocam-outline" size={16} color="#10b981" />
                      </Pressable>

                      <Pressable
                        onPress={(e) => {
                            e.stopPropagation();
                            openQuizUpload(c);
                        }} 
                        className="flex-1 bg-indigo-50 py-2.5 rounded-lg flex-row items-center justify-center border border-indigo-100"
                      >
                        <Ionicons name="cloud-upload-outline" size={14} color="#4f46e5" />
                        <Text className="text-indigo-700 font-bold text-xs ml-1.5">Quiz</Text>
                      </Pressable>
                      
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(c.courseId);
                        }}
                        className="bg-rose-50 p-2.5 rounded-lg items-center justify-center border border-rose-100"
                        style={{ width: 40 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#e11d48" />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* --- COURSE DETAIL SIDEBAR --- */}
      <CourseDetailSidebar 
         course={selectedDetailCourse}
         visible={detailSidebarVisible}
         onClose={closeCourseDetails}
      />

      {/* ====================================================================
          ADD LECTURE MODAL
         ==================================================================== */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={modalVisible} 
        onRequestClose={closeLectureModal}
      >
         <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            className="flex-1 justify-end bg-black/60"
         >
             <TouchableWithoutFeedback onPress={closeLectureModal}>
                 <View className="absolute top-0 bottom-0 left-0 right-0" />
             </TouchableWithoutFeedback>

             {/* Modal Container: Adjusted width & radius for Mobile */}
             <View className={`bg-white rounded-t-3xl p-5 ${isDesktop ? "w-[600px] self-center rounded-3xl mb-10 h-[80%]" : "h-[90%] w-full"}`}>
                 
                 {/* Modal Header */}
                 <View className="flex-row justify-between items-center mb-6 border-b border-slate-100 pb-4">
                     <View className="flex-1 mr-2">
                        <Text className="text-xl font-bold text-slate-800">Add New Lecture</Text>
                        <Text className="text-xs text-indigo-500 font-bold mt-1 uppercase tracking-wide" numberOfLines={1}>
                            Course: {selectedCourseTitle}
                        </Text>
                     </View>
                     <TouchableOpacity onPress={closeLectureModal} className="bg-slate-100 p-2 rounded-full">
                         <Ionicons name="close" size={24} color="#64748b" />
                     </TouchableOpacity>
                 </View>

                 <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    
                    {/* Basic Info */}
                    <View className="mb-6">
                        <Text className="text-xs font-bold text-slate-500 uppercase mb-3">Lecture Details</Text>
                        
                        <View className="mb-4">
                            <Text className="text-xs font-semibold text-slate-700 mb-1.5 ml-1">Title *</Text>
                            <TextInput 
                                className={`bg-slate-50 border rounded-xl px-4 py-3 ${errors.title ? 'border-red-500' : 'border-slate-200'}`}
                                value={form.title}
                                onChangeText={(t) => updateField('title', t)}
                                placeholder="e.g. Introduction to Spring Boot"
                            />
                            {errors.title && <Text className="text-red-500 text-[10px] ml-1 mt-1">{errors.title}</Text>}
                        </View>

                        <View className="mb-4">
                            <Text className="text-xs font-semibold text-slate-700 mb-1.5 ml-1">Description</Text>
                            <TextInput 
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-24 text-top"
                                value={form.description}
                                onChangeText={(t) => updateField('description', t)}
                                placeholder="Brief overview..."
                                multiline
                            />
                        </View>
                    </View>

                    {/* Technical Config */}
                    <View className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <Text className="text-xs font-bold text-slate-500 uppercase mb-3">Video Configuration</Text>
                        
                        <View className="flex-row gap-3 mb-4">
                             <View className="flex-1">
                                <Text className="text-xs font-semibold text-slate-700 mb-1.5 ml-1">Library ID *</Text>
                                <TextInput 
                                    className={`bg-white border rounded-xl px-3 py-2.5 ${errors.videoLibraryId ? 'border-red-500' : 'border-slate-200'}`}
                                    value={form.videoLibraryId}
                                    onChangeText={(t) => updateField('videoLibraryId', t)}
                                    placeholder="567017"
                                    keyboardType="numeric"
                                />
                             </View>
                             <View className="flex-1">
                                <Text className="text-xs font-semibold text-slate-700 mb-1.5 ml-1">Order Index</Text>
                                <TextInput 
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-2.5"
                                    value={form.orderIndex}
                                    onChangeText={(t) => updateField('orderIndex', t)}
                                    keyboardType="numeric"
                                />
                             </View>
                        </View>

                        <View className="mb-4">
                            <Text className="text-xs font-semibold text-slate-700 mb-1.5 ml-1">Video GUID *</Text>
                            <TextInput 
                                className={`bg-white border rounded-xl px-4 py-3 ${errors.videoGuid ? 'border-red-500' : 'border-slate-200'}`}
                                value={form.videoGuid}
                                onChangeText={(t) => updateField('videoGuid', t)}
                                placeholder="afa0e720-..."
                            />
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="w-[48%]">
                                <Text className="text-xs font-semibold text-slate-700 mb-1.5 ml-1">Duration (Sec)</Text>
                                <TextInput 
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-2.5"
                                    value={form.durationSeconds}
                                    onChangeText={(t) => updateField('durationSeconds', t)}
                                    keyboardType="numeric"
                                    placeholder="120"
                                />
                            </View>

                            <View className="w-[48%] flex-row items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                                <Text className="text-xs font-bold text-slate-600">Is Preview?</Text>
                                <Switch 
                                    value={form.isPreview}
                                    onValueChange={(v) => updateField('isPreview', v)}
                                    trackColor={{ false: "#cbd5e1", true: "#4f46e5" }}
                                    thumbColor={"#fff"}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity 
                      onPress={handleSubmitLecture}
                      disabled={submitting}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#4f46e5', '#4338ca']}
                        className="py-4 rounded-xl items-center shadow-lg shadow-indigo-200"
                      >
                        {submitting ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text className="text-white font-bold text-lg">Create Lecture</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    {/* Validation Message */}
                    {lectureMessage && (
                      <View style={{ marginTop: 12, alignItems: "center" }}>
                        <Text style={{
                          color: lectureMessageType === "success" ? "#16a34a" : "#dc2626",
                          fontWeight: "bold",
                          fontSize: 15,
                        }}>
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