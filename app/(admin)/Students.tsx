import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal, // IMPORT ADDED
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
import { CourseApi } from "../(utils)/axiosInstance";

// --- TYPES ---
interface Course {
  courseId: number;
  title: string;
  description: string;
}

interface Student {
  studentId: string;
  fullName: string;
  email: string;
  collegeName: string;
  passoutYear: string;
  phoneNumber?: string;
  profileImage?: string;
}

export default function Students() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  // Responsive Check
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;
  const gap = 16;

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  const [showDropdown, setShowDropdown] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");

  // --- 1. FETCH COURSES ON MOUNT ---
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await CourseApi.get("http://192.168.0.139:8088/api/courses");
      const data = response.data?.data || [];
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  // --- 2. FETCH STUDENTS FOR SELECTED COURSE ---
  const handleSelectCourse = async (course: Course) => {
    setSelectedCourse(course);
    setShowDropdown(false); 
    setLoadingStudents(true);
    setStudents([]); 

    try {
      const response = await CourseApi.get(`http://192.168.0.139:8088/api/courses/${course.courseId}/students`);
      setStudents(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.collegeName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- RENDER ITEM: STUDENT CARD ---
  const renderStudentCard = ({ item }: { item: Student }) => (
    <View 
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4"
      style={isDesktop || isTablet ? { flex: 1, margin: gap / 2, minWidth: (width / numColumns) - 40 } : { marginBottom: 16 }}
    >
      <View className="flex-row items-center mb-4">
        <View className="w-12 h-12 rounded-full bg-indigo-50 items-center justify-center mr-4 border border-indigo-100">
          <Text className="text-indigo-600 font-bold text-lg">
            {item.fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
            {item.fullName}
          </Text>
          <Text className="text-xs text-slate-500" numberOfLines={1}>
            {item.email}
          </Text>
        </View>
        <View className="bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
           <Text className="text-[10px] font-bold text-emerald-700">
             {item.passoutYear || "N/A"}
           </Text>
        </View>
      </View>

      <View className="border-t border-slate-50 pt-3">
        <View className="flex-row items-center mb-2">
           <Ionicons name="school-outline" size={14} color="#64748b" />
           <Text className="text-xs text-slate-600 ml-2 flex-1" numberOfLines={1}>
             {item.collegeName || "Unknown College"}
           </Text>
        </View>
        
        {item.phoneNumber && (
          <View className="flex-row items-center">
             <Ionicons name="call-outline" size={14} color="#64748b" />
             <Text className="text-xs text-slate-600 ml-2">
               {item.phoneNumber}
             </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      
      {/* --- HEADER --- */}
        <View className="flex-row justify-between items-center mb-4 pt-5 px-4">
            <View>
                <Text className="text-black text-3xl font-extrabold">Registered Students</Text>
                <Text className="text-indigo-300 text-sm font-medium opacity-90">Manage enrollments & details</Text>
            </View>
        </View>

        {/* --- COURSE SELECTOR BUTTON --- */}
        <View className="z-50"> 
            <TouchableOpacity 
                onPress={() => setShowDropdown(!showDropdown)} 
                activeOpacity={0.9}
                className="bg-white rounded-xl flex-row items-center px-4 py-3 shadow-sm border border-slate-300 mx-8 mb-2"
            >
                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${selectedCourse ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                    <Ionicons name={selectedCourse ? "library" : "search"} size={16} color={selectedCourse ? "#4f46e5" : "#94a3b8"} />
                </View>
                <View className="flex-1">
                    <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        {selectedCourse ? "Selected Course" : "Filter by Course"}
                    </Text>
                    <Text className="text-slate-800 font-bold text-sm" numberOfLines={1}>
                        {selectedCourse ? selectedCourse.title : "Tap to select a course..."}
                    </Text>
                </View>
                <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color="#94a3b8" />
            </TouchableOpacity>

            {/* --- LOGIC SPLIT: DESKTOP vs MOBILE --- */}

            {/* 1. DESKTOP VIEW: Use Absolute Dropdown (No Changes) */}
            {isDesktop && showDropdown && (
                <View 
                    className="mx-8 bg-white border border-slate-200 rounded-xl shadow-lg absolute top-full left-0 right-0 z-50"
                    style={{ maxHeight: 300, elevation: 50 }} 
                >
                    {loadingCourses ? (
                        <View className="p-4">
                            <ActivityIndicator color="#4f46e5" />
                        </View>
                    ) : (
                        <FlatList 
                            data={courses}
                            nestedScrollEnabled={true} 
                            keyExtractor={(item) => item.courseId.toString()}
                            contentContainerStyle={{ padding: 8 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => handleSelectCourse(item)}
                                    className={`p-3 mb-1 rounded-lg flex-row items-center ${
                                        selectedCourse?.courseId === item.courseId ? 'bg-indigo-50' : 'bg-transparent'
                                    }`}
                                >
                                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                                        selectedCourse?.courseId === item.courseId ? 'bg-indigo-500' : 'bg-slate-100'
                                    }`}>
                                        <Text className={`font-bold text-xs ${selectedCourse?.courseId === item.courseId ? 'text-white' : 'text-slate-500'}`}>
                                            {item.title.charAt(0)}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className={`font-bold text-sm ${selectedCourse?.courseId === item.courseId ? 'text-indigo-900' : 'text-slate-700'}`}>
                                            {item.title}
                                        </Text>
                                    </View>
                                    {selectedCourse?.courseId === item.courseId && (
                                        <Ionicons name="checkmark-circle" size={18} color="#4f46e5" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            )}

            {/* 2. MOBILE VIEW: Use Modal (Bottom Sheet Style) */}
            {!isDesktop && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showDropdown}
                    onRequestClose={() => setShowDropdown(false)}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white rounded-t-3xl h-[60%] shadow-2xl">
                            {/* Modal Header */}
                            <View className="p-5 border-b border-slate-100 flex-row justify-between items-center">
                                <Text className="text-lg font-bold text-slate-800">Select Course</Text>
                                <TouchableOpacity onPress={() => setShowDropdown(false)} className="bg-slate-100 p-2 rounded-full">
                                    <Ionicons name="close" size={20} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            {/* Modal List */}
                            {loadingCourses ? (
                                <View className="flex-1 justify-center items-center">
                                    <ActivityIndicator size="large" color="#4f46e5" />
                                </View>
                            ) : (
                                <FlatList 
                                    data={courses}
                                    keyExtractor={(item) => item.courseId.toString()}
                                    contentContainerStyle={{ padding: 16 }}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity 
                                            onPress={() => handleSelectCourse(item)}
                                            className={`p-4 mb-3 rounded-xl border flex-row items-center ${
                                                selectedCourse?.courseId === item.courseId 
                                                ? 'bg-indigo-50 border-indigo-200' 
                                                : 'bg-white border-slate-100'
                                            }`}
                                        >
                                            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                                                selectedCourse?.courseId === item.courseId ? 'bg-indigo-500' : 'bg-slate-100'
                                            }`}>
                                                <Text className={`font-bold ${selectedCourse?.courseId === item.courseId ? 'text-white' : 'text-slate-500'}`}>
                                                    {item.title.charAt(0)}
                                                </Text>
                                            </View>
                                            <View className="flex-1">
                                                <Text className={`font-bold text-base ${selectedCourse?.courseId === item.courseId ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                    {item.title}
                                                </Text>
                                            </View>
                                            {selectedCourse?.courseId === item.courseId && (
                                                <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                            )}
                        </View>
                    </View>
                </Modal>
            )}

        </View>
      

      {/* --- BODY CONTENT --- */}
      <View className="flex-1 px-4 mt-6"> 
        {/* Loading / Data States */}
        {loadingStudents ? (
             <View className="flex-1 justify-center items-center">
                 <ActivityIndicator size="large" color="#4f46e5" />
                 <Text className="text-slate-400 text-xs mt-3 font-medium">Fetching students...</Text>
             </View>
        ) : !selectedCourse ? (
             <View className="flex-1 justify-center items-center pb-20">
                 <View className="bg-indigo-50 w-24 h-24 rounded-full items-center justify-center mb-4">
                     <Ionicons name="people" size={40} color="#818cf8" />
                 </View>
                 <Text className="text-slate-800 font-bold text-lg">No Course Selected</Text>
                 <Text className="text-slate-500 text-center px-10 mt-2 leading-5">
                     Please select a course from the dropdown above.
                 </Text>
                 <TouchableOpacity 
                    onPress={() => setShowDropdown(true)}
                    className="mt-6 bg-indigo-600 px-6 py-3 rounded-full shadow-lg shadow-indigo-200"
                 >
                    <Text className="text-white font-bold">Select Course</Text>
                 </TouchableOpacity>
             </View>
        ) : students.length === 0 ? (
             <View className="flex-1 justify-center items-center pb-20">
                 <Ionicons name="file-tray-outline" size={48} color="#cbd5e1" />
                 <Text className="text-slate-400 font-bold mt-4">No students found.</Text>
             </View>
        ) : (
             <FlatList
                data={filteredStudents}
                keyExtractor={(item) => item.studentId || item.email}
                key={numColumns} 
                numColumns={numColumns}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={renderStudentCard}
             />
        )}
      </View>

    </SafeAreaView>
  );
}