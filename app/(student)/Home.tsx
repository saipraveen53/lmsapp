import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CourseApi } from '../(utils)/axiosInstance';

const logoImg = require('../../assets/images/anasol-logo.png');

const Home = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets(); 
  const isWeb = Platform.OS === 'web';

  const [username, setUserName] = useState("Student");
  
  // Data State
  const [courses, setCourses] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Selection & Enroll State
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]); 
  
  // --- NEW: Confirmation Modal State ---
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // --- WEB LAYOUT LOGIC ---
  const sideBarWidth = 400; 
  const isSidebarOpen = isWeb && selectedCourse !== null;
  const contentWidth = isSidebarOpen ? (width - sideBarWidth) : width;
  
  const numColumns = isWeb 
    ? (isSidebarOpen 
        ? (contentWidth > 1200 ? 3 : contentWidth > 800 ? 2 : 1) 
        : (contentWidth > 1400 ? 4 : contentWidth > 1100 ? 3 : 2))
    : 1;

  const gap = 16; 
  const scrollBarBuffer = isWeb ? 16 : 0; 
  const paddingHorizontal = (isWeb ? 48 : 40); 
  const availableGridWidth = contentWidth - paddingHorizontal - scrollBarBuffer;
  const cardWidth = isWeb 
    ? (availableGridWidth - (gap * (numColumns - 1))) / numColumns 
    : '100%';

  // 1. Fetch User
  useEffect(() => {
    let fetchUsername = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          const decode: any = jwtDecode(token);
          setUserName(decode.sub || "Student");
        }
      } catch (error) { console.log("User err", error); }
    }
    fetchUsername();
  }, [])

  // 2. Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        let response = await CourseApi.get(`/api/courses`);
        if (response.data && response.data.success && response.data.data) {
            setCourses(response.data.data);
        }
      } catch (error) {
        console.log("Course fetch err", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // --- HANDLERS ---
  const handleCoursePress = (course: any) => {
      if (isWeb) {
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

  // STEP 1: User Clicks Enroll -> Show Confirmation Modal
  const initiateEnroll = () => {
      if(!selectedCourse) return;
      setConfirmModalVisible(true);
  };

  // STEP 2: User Confirms in Modal -> Call API
  const processEnrollment = async () => {
    setConfirmModalVisible(false); // Close Modal
    setIsEnrolling(true); // Start Loading
    
    try {
        const response = await CourseApi.post(`/api/courses/${selectedCourse.courseId}/enroll`);
        
        if (response.status === 200 || response.data?.success) {
            Alert.alert("Success", "Enrollment Successful!", [
                { 
                    text: "Start Learning", 
                    onPress: () => {
                        setEnrolledCourseIds((prev) => [...prev, selectedCourse.courseId]);
                    } 
                }
            ]);
        }
    } catch (error: any) {
        console.log("Enrollment Error:", error);
        const msg = error.response?.data?.message || "Failed to enroll. Please try again.";
        Alert.alert("Enrollment Failed", msg);
    } finally {
        setIsEnrolling(false); 
    }
  };

  const handleContinueLearning = () => {
    if (!isWeb) setCourseModalVisible(false);
    if (selectedCourse?.libraryId) {
        router.push({ pathname: "/(videos)/[id]", params: { id: selectedCourse.libraryId } });
    } else {
        Alert.alert("Content Unavailable", "No video content linked.");
    }
  };

  const formatDuration = (mins: number) => {
      if(!mins) return "0h 0m";
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
  };

  // --- COURSE DETAILS COMPONENT ---
  const CourseDetailsContent = () => {
      if (!selectedCourse) return null;
      const isEnrolled = enrolledCourseIds.includes(selectedCourse.courseId);

      return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
            <View className="relative overflow-hidden rounded-xl mb-6 shadow-sm group">
                <Image 
                    source={{ uri: selectedCourse.thumbnailUrl || "https://img.freepik.com/free-vector/laptop-with-program-code-isometric-icon-software-development-programming-applications-dark-neon_39422-971.jpg" }} 
                    className="w-full h-56 bg-gray-100 transition-transform duration-500 hover:scale-105"
                    resizeMode="cover"
                />
            </View>
            
            <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 pr-4">
                        <Text className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-1">{selectedCourse.level}</Text>
                        <Text className="text-2xl font-black text-gray-900 leading-tight">{selectedCourse.title}</Text>
                </View>
                <Text className="text-xl font-black text-indigo-600">{selectedCourse.isFree ? "Free" : `₹${selectedCourse.price}`}</Text>
            </View>

            <View className="flex-row items-center mb-6 space-x-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Text className="text-gray-600 text-xs font-bold">🕒 {formatDuration(selectedCourse.totalDuration)}</Text>
                <Text className="text-gray-600 text-xs font-bold ml-3">📹 {selectedCourse.totalLectures} Lessons</Text>
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-2">About Course</Text>
            <Text className="text-gray-600 leading-7 mb-6 text-sm">{selectedCourse.description}</Text>

            <Text className="text-lg font-bold text-gray-900 mb-3">What You'll Learn</Text>
            <View className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100 hover:border-indigo-200 transition-colors duration-300">
                    {selectedCourse.whatYouWillLearn ? (
                    selectedCourse.whatYouWillLearn.split(',').map((item: string, index: number) => (
                        <View key={index} className="flex-row items-center mb-2.5">
                                <Text className="text-green-500 mr-2">✓</Text>
                                <Text className="text-gray-700 font-medium text-sm">{item.trim()}</Text>
                        </View>
                    ))
                    ) : (<Text className="text-gray-500 italic">Details not available</Text>)}
            </View>

            {isEnrolled ? (
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    onPress={handleContinueLearning} 
                    className="bg-indigo-600 py-4 rounded-xl shadow-lg shadow-indigo-200 mt-2 mb-8 flex-row justify-center items-center hover:bg-indigo-700 active:scale-95 transition-all duration-200"
                >
                    <Text className="text-white text-center font-bold text-lg tracking-wide mr-2">Continue Learning</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity 
                    activeOpacity={0.8} 
                    onPress={initiateEnroll} // Calls the Modal Opener
                    disabled={isEnrolling} 
                    className="bg-green-600 py-4 rounded-xl shadow-lg shadow-green-200 mt-2 mb-8 hover:bg-green-700 active:scale-95 transition-all duration-200 flex-row justify-center items-center"
                >
                    {isEnrolling ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg tracking-wide">Enroll Now</Text>
                    )}
                </TouchableOpacity>
            )}
        </ScrollView>
      );
  };

  return (
    <View className="flex-1 bg-gray-50"> 
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />

      {/* HEADER */}
      <LinearGradient
        colors={['#4338ca', '#e11d48']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ 
          paddingTop: isWeb ? 16 : insets.top + 5, 
          paddingBottom: isWeb ? 16 : 15 
        }} 
        className={`shadow-md z-20 ${isWeb ? 'px-8 w-full' : 'rounded-b-3xl px-5'}`}
      >
        {isWeb ? (
            // WEB HEADER
            <View className="flex-row items-center justify-between w-full">
                <View className="flex-row items-center min-w-[200px]">
                    <Image source={logoImg} style={{ width: 40, height: 40 }} className="mr-3 bg-white rounded-full p-1 transition-transform hover:scale-110" resizeMode="contain" />
                    <View>
                        <Text className="text-indigo-100 text-[10px] font-bold uppercase">Welcome Back</Text>
                        <Text className="text-lg font-bold text-white">{username}</Text>
                    </View>
                </View>
                <View className="flex-1 mx-10 max-w-2xl">
                    <View className="flex-row items-center bg-white/95 px-4 py-2.5 rounded-full shadow-sm transition-all focus-within:ring-2 focus-within:ring-indigo-300">
                        <Text className="text-gray-400 mr-2">🔍</Text>
                        <TextInput placeholder="Search..." className="flex-1 text-gray-700 font-medium outline-none" style={{ outlineStyle: 'none' } as any} />
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.push('/(student)/MyProfile')} className="active:scale-90 transition-transform">
                    <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} className="w-9 h-9 rounded-full border-2 border-white/30 hover:border-white transition-colors" />
                </TouchableOpacity>
            </View>
        ) : (
            // MOBILE HEADER
            <View className="flex-row items-center justify-between w-full gap-3 mt-2">
                <Image 
                    source={logoImg} 
                    style={{ width: 40, height: 40 }} 
                    resizeMode="contain" 
                />

                <View className="flex-1 flex-row items-center bg-white px-3 py-2 rounded-full shadow-sm">
                    <Text className="text-gray-400 mr-2 text-sm">🔍</Text>
                    <TextInput 
                        placeholder="Search..." 
                        className="flex-1 text-gray-700 font-medium text-sm p-0" 
                        placeholderTextColor="#9CA3AF" 
                    />
                </View>

                <TouchableOpacity onPress={() => router.push('/(student)/MyProfile')}>
                    <Image 
                        source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }} 
                        className="w-9 h-9 rounded-full border-2 border-white/30" 
                    />
                </TouchableOpacity>
            </View>
        )}
      </LinearGradient>

      {/* --- CONTENT AREA --- */}
      <View className="flex-1 flex-row bg-gray-50 w-full overflow-hidden">
          
          {/* SCROLLABLE GRID */}
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 100 }}
          >
             <View className={`w-full ${isWeb ? 'px-6 pt-6' : 'px-5 pt-6'}`}>
                
                {/* Grid Title */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-gray-800">
                        {isSidebarOpen ? "Select a Course" : "All Available Courses"}
                    </Text>
                </View>

                {isLoading ? <ActivityIndicator size="large" color="#4F46E5" className="mt-10" /> : (
                    <View style={isWeb ? { flexDirection: 'row', flexWrap: 'wrap', gap: gap } : {}}>
                        {courses.map((course: any) => {
                            const isEnrolled = enrolledCourseIds.includes(course.courseId);
                            const isSelected = isWeb && selectedCourse?.courseId === course.courseId;
                            
                            return (
                                <TouchableOpacity
                                    key={course.courseId}
                                    onPress={() => handleCoursePress(course)}
                                    activeOpacity={0.8}
                                    style={isWeb ? { width: Math.floor(cardWidth) } : { width: '100%' }} 
                                    className={`
                                      bg-white rounded-2xl shadow-sm border group
                                      ${isSelected ? 'border-indigo-600 border-2 shadow-indigo-200 shadow-md scale-[1.02]' : 'border-gray-100'} 
                                      ${isWeb 
                                        ? 'flex-col overflow-hidden mb-0 pb-3 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl hover:border-indigo-200 active:scale-95' 
                                        : 'flex-row p-3 mb-4'
                                      }
                                    `}
                                >
                                    <View className="overflow-hidden">
                                        <Image source={{ uri: course.thumbnailUrl || "https://img.freepik.com/free-vector/laptop-with-program-code-isometric-icon-software-development-programming-applications-dark-neon_39422-971.jpg" }} resizeMode="cover" 
                                            className={`${
                                                isWeb 
                                                ? (isSidebarOpen ? 'w-full h-36 bg-gray-100 transition-transform duration-500 group-hover:scale-110' : 'w-full h-52 bg-gray-100 transition-transform duration-500 group-hover:scale-110')
                                                : 'w-24 h-24 rounded-xl bg-gray-100'
                                            }`} 
                                        />
                                    </View>
                                    
                                    <View className={`${isWeb ? 'px-4 pt-3 flex-1' : 'flex-1 ml-3 justify-center'}`}>
                                        <View className="flex-row justify-between items-start mb-1">
                                            <Text className="text-blue-600 text-[10px] font-bold uppercase">{course.level || "Course"}</Text>
                                            <Text className="text-gray-600 text-[10px] font-bold">★ {course.rating || "New"}</Text>
                                        </View>
                                        <Text className={`font-bold text-gray-900 mb-1 leading-tight ${isSidebarOpen ? 'text-sm' : 'text-lg'}`} numberOfLines={2}>
                                            {course.title}
                                        </Text>
                                        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                            <Text className="text-indigo-600 font-bold text-sm">{course.isFree ? "Free" : `₹${course.price}`}</Text>
                                            {isEnrolled && <Text className="text-green-600 text-[10px] font-bold">✓</Text>}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
             </View>
          </ScrollView>

          {/* RIGHT SIDE: DETAILS PANEL (WEB ONLY) */}
          {isWeb && (
            <View 
                className={`bg-white border-l border-gray-200 h-full shadow-2xl z-30 transition-all duration-500 ease-in-out overflow-hidden`}
                style={{ width: isSidebarOpen ? sideBarWidth : 0 }}
            >
                <View style={{ width: sideBarWidth, height: '100%', padding: 24 }}>
                    {selectedCourse && (
                        <>
                            <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-100">
                                <Text className="text-xl font-bold text-gray-800">Course Details</Text>
                                <TouchableOpacity 
                                    onPress={() => setSelectedCourse(null)} 
                                    className="p-2 bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                >
                                    <Text className="text-gray-500 font-bold text-xs hover:text-red-500">✕ Close</Text>
                                </TouchableOpacity>
                            </View>
                            <CourseDetailsContent />
                        </>
                    )}
                </View>
            </View>
          )}

      </View>

      {/* CONFIRMATION MODAL */}
      <Modal 
        animationType="fade" 
        transparent={true} 
        visible={confirmModalVisible} 
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 backdrop-blur-sm">
            <View className="bg-white p-6 rounded-2xl w-[90%] max-w-sm shadow-2xl scale-100">
                <Text className="text-xl font-bold text-gray-900 mb-2">Confirm Enrollment</Text>
                <Text className="text-gray-600 mb-6 leading-6">
                    Are you sure you want to enroll in <Text className="font-bold text-indigo-600">{selectedCourse?.title}</Text>?
                </Text>
                
                <View className="flex-row justify-end gap-3">
                    <TouchableOpacity 
                        onPress={() => setConfirmModalVisible(false)} 
                        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        <Text className="text-gray-700 font-medium">Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        onPress={processEnrollment} 
                        className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                        <Text className="text-white font-medium">Yes, Enroll</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      {/* MOBILE COURSE DETAILS MODAL */}
      <Modal animationType="slide" visible={courseModalVisible} presentationStyle="pageSheet" onRequestClose={() => setCourseModalVisible(false)}>
        {selectedCourse && (
            <View className="flex-1 bg-white">
                <View className="relative">
                    <Image source={{ uri: selectedCourse.thumbnailUrl || "https://img.freepik.com/free-vector/laptop-with-program-code-isometric-icon-software-development-programming-applications-dark-neon_39422-971.jpg" }} className="w-full h-64 bg-gray-200" resizeMode="cover" />
                    <TouchableOpacity onPress={() => setCourseModalVisible(false)} className="absolute top-4 right-4 bg-black/30 p-2 rounded-full"><Text className="text-white font-bold text-xs">✕</Text></TouchableOpacity>
                </View>
                <View className="flex-1 px-6 pt-6">
                    <CourseDetailsContent />
                </View>
            </View>
        )}
      </Modal>

    </View>
  );
};

export default Home;