import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import { rootApi } from "../(utils)/axiosInstance";
import "../globals.css";

// --- HELPER: Get Image (Network Fallback) ---
const getCourseImage = (url: string | null) => {
  // If no URL from backend, use a high-quality Unsplash tech image
  if (url && url.length > 5) return { uri: url };
  return { uri: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop" };
};

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const router = useRouter();

  // Responsive Logic: 3 cols on Desktop, 2 on Tablet, 1 on Mobile
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const columns = isDesktop ? 3 : isTablet ? 2 : 1;
  const gap = 20;
  const padding = 24;
  const cardWidth = (width - (padding * 2) - (gap * (columns))) / columns;

  
useEffect(() => {
  rootApi.get("http://192.168.0.249:8088/api/courses")
    .then(res => {
      setCourses(res.data.data || []);
    })
    .catch(() => setCourses([]))
    .finally(() => setLoading(false));
}, []);

  const openCreate = () => { /* Modal Logic */ };

  const openCourseDetails = (course: any) => {
    router.push({
      pathname: "/(admin)/CourseDetails",
      params: { course: JSON.stringify(course) }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-6 pt-6">
        
        {/* --- Header Section --- */}
        <View className="flex-row items-center justify-between mb-8">
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

        {/* --- Content Grid --- */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={{ paddingBottom: 100 }} 
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: gap }}>
              {courses.map((c) => (
                <Pressable
                  key={c.courseId}
                  onPress={() => openCourseDetails(c)}
                  className="bg-white rounded-2xl shadow-sm shadow-slate-200 border border-slate-100 overflow-hidden group hover:shadow-md transition-all"
                  style={{ width: cardWidth }}
                >
                  {/* Thumbnail Image */}
                  <View className="h-48 relative bg-slate-100">
                    <Image
                      source={getCourseImage(c.thumbnailUrl)}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    {/* Status Badge (Top Right) */}
                    <View className="absolute top-3 right-3">
                       <View className={`px-2.5 py-1 rounded-md backdrop-blur-md ${c.isFree ? 'bg-emerald-500' : 'bg-slate-900'}`}>
                          <Text className="text-[10px] font-bold text-white uppercase tracking-wide">
                            {c.isFree ? "FREE" : "PAID"}
                          </Text>
                       </View>
                    </View>
                  </View>

                  {/* Card Body */}
                  <View className="p-5">
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-lg font-bold text-slate-800 leading-6 flex-1 mr-2" numberOfLines={1}>
                        {c.title}
                      </Text>
                    </View>
                    
                    <Text className="text-xs text-slate-500 mb-4 leading-5 min-h-[40px]" numberOfLines={2}>
                      {c.description || "No description provided."}
                    </Text>

                    {/* Stats Row */}
                    <View className="flex-row items-center gap-4 mb-4 pb-4 border-b border-slate-50">
                        <View className="flex-row items-center">
                           <Ionicons name="book-outline" size={14} color="#94a3b8" />
                           <Text className="text-xs text-slate-500 ml-1 font-medium">{c.lecturesCount || 0} Lessons</Text>
                        </View>
                        <View className="flex-row items-center">
                           <Ionicons name="people-outline" size={14} color="#94a3b8" />
                           <Text className="text-xs text-slate-500 ml-1 font-medium">{c.studentsCount || 0} Students</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-2">
                       {/* Upload Quiz Button */}
                      <Pressable
                        onPress={() => router.push({ pathname: '/(admin)/BulkQuizUpload', params: { courseId: c.courseId, courseName: c.title } })}
                        className="flex-1 bg-indigo-50 py-2.5 rounded-lg flex-row items-center justify-center border border-indigo-100"
                      >
                        <Ionicons name="cloud-upload-outline" size={14} color="#4f46e5" />
                        <Text className="text-indigo-700 font-bold text-xs ml-1.5">Upload Quiz</Text>
                      </Pressable>
                      
                      {/* Delete Button */}
                      <Pressable className="w-10 bg-rose-50 rounded-lg items-center justify-center border border-rose-100">
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
    </SafeAreaView>
  );
}