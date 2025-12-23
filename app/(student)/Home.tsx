import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseApi } from '../(utils)/axiosInstance';

const { width } = Dimensions.get('window');

// --- STATIC CATEGORIES ---
const categories = ["All", "Coding", "Design", "Business", "Marketing", "Music"];

const Home = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [username, setUserName] = useState("Student");
  
  // --- STATE ---
  const [courses, setCourses] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // --- MODAL STATE ---
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // --- MOCK ENROLLED DATA ---
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]); 

  // 1. Fetch User Name
  useEffect(() => {
    let fetchUsername = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          const decode: any = jwtDecode(token);
          setUserName(decode.sub || "Student");
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    }
    fetchUsername();
  }, [])

  // 2. Fetch Courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        let response = await CourseApi.get(`/api/courses`);
        
        // Based on your JSON structure: { success: true, data: [...] }
        if (response.data && response.data.success && response.data.data) {
            setCourses(response.data.data);
        }
      } catch (error) {
        console.log("Error fetching courses:", error);
        Alert.alert("Error", "Could not load courses.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Open Modal
  const openCourseDetails = (course: any) => {
    setSelectedCourse(course);
    setCourseModalVisible(true);
  };

  // Handle Enroll
  const handleEnroll = () => {
    Alert.alert(
        "Enrollment Successful!", 
        `You have enrolled in ${selectedCourse?.title}`, 
        [
            { 
                text: "Start Learning", 
                onPress: () => {
                    if(selectedCourse) {
                        setEnrolledCourseIds((prev) => [...prev, selectedCourse.courseId]);
                    }
                } 
            }
        ]
    );
  };

  // Handle Video Navigation
  const handleContinueLearning = () => {
    setCourseModalVisible(false);
    
    // Check for libraryId in course object first
    if (selectedCourse?.libraryId) {
        router.push({
            pathname: "/(videos)/[id]",
            params: { id: selectedCourse.libraryId }
        });
    } else {
        Alert.alert("Content Unavailable", "This course does not have video content linked yet.");
    }
  };

  // Helper to format duration (assuming totalDuration is in minutes)
  const formatDuration = (mins: number) => {
      if(!mins) return "0h 0m";
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}h ${m}m`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* --- HEADER --- */}
      <View className="bg-white px-5 pt-2 pb-4 shadow-sm z-10 rounded-b-3xl">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-gray-400 text-sm font-medium">Welcome Back,</Text>
            <Text className="text-2xl font-bold text-gray-800 capitalize">
              {username} 👋
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(student)/MyProfile')}
            className="bg-gray-100 p-1 rounded-full border border-gray-200"
          >
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
              className="w-10 h-10 rounded-full"
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-gray-50 p-3 rounded-2xl border border-gray-200">
          <Text className="text-gray-400 mr-2 text-lg">🔍</Text>
          <TextInput
            placeholder="Search for courses..."
            className="flex-1 text-gray-700 font-medium h-full"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
      >
        {/* Banner */}
        <View className="bg-gray-900 rounded-3xl p-5 mb-8 flex-row items-center shadow-lg shadow-indigo-200">
          <View className="flex-1">
             <View className="bg-orange-500 self-start px-2 py-1 rounded-md mb-2">
                <Text className="text-white text-[10px] font-bold">PRO ACCESS</Text>
             </View>
             <Text className="text-white text-lg font-bold mb-1">Get 50% Off Today!</Text>
             <Text className="text-gray-300 text-xs mb-3">Unlock all premium courses.</Text>
             <TouchableOpacity className="bg-white py-2 px-4 rounded-xl self-start">
                <Text className="text-gray-900 font-bold text-xs">Upgrade Now</Text>
             </TouchableOpacity>
          </View>
          <Image 
             source={{ uri: "https://cdn3d.iconscout.com/3d/premium/thumb/trophy-cup-3d-icon-download-in-png-blend-fbx-gltf-file-formats--award-winner-reward-champion-prize-interface-pack-user-icons-4860718.png" }}
             className="w-24 h-24"
          />
        </View>

        {/* Categories */}
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveCategory(cat)}
                className={`mr-3 px-6 py-2.5 rounded-full border ${
                  activeCategory === cat ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`font-medium text-sm ${activeCategory === cat ? 'text-white' : 'text-gray-600'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- DYNAMIC COURSE LIST --- */}
        <View className="mb-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">All Courses</Text>
            <TouchableOpacity><Text className="text-indigo-600 font-bold text-xs">View All</Text></TouchableOpacity>
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#4F46E5" className="mt-10" />
          ) : (
            <>
                {courses.length === 0 ? (
                     <Text className="text-center text-gray-400 mt-5">No available courses.</Text>
                ) : (
                    courses.map((course: any) => {
                        const isEnrolled = enrolledCourseIds.includes(course.courseId);
                        // Fallback image since many thumbnails in your JSON are null
                        const imageUrl = course.thumbnailUrl || "https://img.freepik.com/free-vector/laptop-with-program-code-isometric-icon-software-development-programming-applications-dark-neon_39422-971.jpg";
                        
                        return (
                            <TouchableOpacity
                                key={course.courseId}
                                onPress={() => openCourseDetails(course)}
                                className="bg-white p-3 rounded-3xl mb-4 shadow-sm border border-gray-100 flex-row"
                            >
                                <Image
                                    source={{ uri: imageUrl }}
                                    className="w-28 h-28 rounded-2xl bg-gray-100"
                                />
                                <View className="flex-1 ml-4 justify-center py-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <View className="bg-blue-50 px-2 py-0.5 rounded">
                                            <Text className="text-blue-500 text-[10px] font-bold uppercase">
                                                {course.level || "Course"}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Text className="text-yellow-400 text-xs">★</Text>
                                            <Text className="text-gray-800 font-bold text-xs ml-1">
                                                {course.rating > 0 ? course.rating : "New"}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <Text className="text-base font-bold text-gray-900 mb-1 leading-tight" numberOfLines={2}>
                                        {course.title}
                                    </Text>
                                    <Text className="text-gray-400 text-xs mb-3">By Instructor</Text>
                                    
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-indigo-600 font-extrabold text-lg">
                                            {course.isFree ? "Free" : `₹${course.price}`}
                                        </Text>
                                        <View className={`p-2 rounded-full ${isEnrolled ? 'bg-green-100' : 'bg-gray-50'}`}>
                                            <Text className={`text-xs font-bold ${isEnrolled ? 'text-green-600' : 'text-gray-400'}`}>
                                                {isEnrolled ? '✓' : '+'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </>
          )}
        </View>
      </ScrollView>

      {/* --- MODAL --- */}
      <Modal
        animationType="slide"
        visible={courseModalVisible}
        presentationStyle="pageSheet"
        onRequestClose={() => setCourseModalVisible(false)}
      >
        {selectedCourse && (
            <View className="flex-1 bg-white">
                <View className="relative">
                    <Image 
                        source={{ uri: selectedCourse.thumbnailUrl || "https://img.freepik.com/free-vector/laptop-with-program-code-isometric-icon-software-development-programming-applications-dark-neon_39422-971.jpg" }} 
                        className="w-full h-64 bg-gray-200"
                        resizeMode="cover"
                    />
                    <TouchableOpacity 
                        onPress={() => setCourseModalVisible(false)}
                        className="absolute top-4 right-4 bg-black/30 p-2 rounded-full"
                    >
                        <Text className="text-white font-bold text-xs">✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 pr-4">
                             <Text className="text-blue-600 font-bold text-xs tracking-widest uppercase mb-1">
                                {selectedCourse.level}
                             </Text>
                             <Text className="text-2xl font-black text-gray-900 leading-tight">
                                {selectedCourse.title}
                             </Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-xl font-black text-indigo-600">
                                {selectedCourse.isFree ? "Free" : `₹${selectedCourse.price}`}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-6 space-x-4">
                        <Text className="text-gray-400 text-xs">🕒 {formatDuration(selectedCourse.totalDuration)}</Text>
                        <Text className="text-gray-400 text-xs ml-3">📹 {selectedCourse.totalLectures} Lessons</Text>
                        <Text className="text-gray-400 text-xs ml-3">👥 {selectedCourse.totalStudents} Students</Text>
                    </View>

                    <Text className="text-lg font-bold text-gray-900 mb-2">About Course</Text>
                    <Text className="text-gray-600 leading-6 mb-6">
                        {selectedCourse.description}
                    </Text>

                    {/* What you will learn Section (using a fixed list or parsing your string) */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">What You'll Learn</Text>
                    <View className="bg-gray-50 p-4 rounded-2xl mb-6">
                         {/* Splitting the comma separated string from API */}
                         {selectedCourse.whatYouWillLearn ? (
                            selectedCourse.whatYouWillLearn.split(',').map((item: string, index: number) => (
                                <View key={index} className="flex-row items-center mb-2">
                                     <Text className="text-green-500 mr-2">✓</Text>
                                     <Text className="text-gray-700 font-medium">{item.trim()}</Text>
                                </View>
                            ))
                         ) : (
                            <Text className="text-gray-500 italic">Details not available</Text>
                         )}
                    </View>

                    {enrolledCourseIds.includes(selectedCourse.courseId) ? (
                        <TouchableOpacity 
                            activeOpacity={0.8}
                            onPress={handleContinueLearning}
                            className="bg-indigo-600 py-4 rounded-2xl shadow-lg shadow-indigo-200 mt-4 mb-8 flex-row justify-center items-center"
                        >
                            <Text className="text-white text-center font-bold text-lg tracking-wide mr-2">
                                Continue Learning
                            </Text>
                            <Text className="text-white">▶</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            activeOpacity={0.8}
                            onPress={handleEnroll}
                            className="bg-green-600 py-4 rounded-2xl shadow-lg shadow-green-200 mt-4 mb-8"
                        >
                            <Text className="text-white text-center font-bold text-lg tracking-wide">
                                Enroll Now
                            </Text>
                        </TouchableOpacity>
                    )}

                </ScrollView>
            </View>
        )}
      </Modal>

    </SafeAreaView>
  );
};

export default Home;