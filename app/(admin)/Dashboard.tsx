import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import jwtDecode from "jwt-decode";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import "../globals.css"; // Ensure your tailwind/nativewind setup is here
// --- Types ---
type Course = {
  courseId: string;
  name: string;
  category: string;
  thumbnailUrl?: string;
  price?: number;
  isPaid: boolean;
  videos?: number;
  status: "active" | "inactive";
  createdAt: string;
};

// --- Mock Data ---
const sampleCourses: Course[] = [
  { courseId: "C001", name: "Intro to React Native", category: "Mobile Dev", thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60", price: 0, isPaid: false, videos: 8, status: "active", createdAt: new Date().toISOString() },
  { courseId: "C002", name: "Advanced TypeScript", category: "Web Dev", thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60", price: 49, isPaid: true, videos: 15, status: "active", createdAt: new Date().toISOString() },
  { courseId: "C003", name: "UI/UX Design Master", category: "Design", thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=60", price: 29, isPaid: true, videos: 10, status: "inactive", createdAt: new Date().toISOString() },
  { courseId: "C004", name: "Algorithms & DS", category: "CS Basics", thumbnailUrl: "", price: 0, isPaid: false, videos: 20, status: "active", createdAt: new Date().toISOString() },
  { courseId: "C005", name: "DevOps Pipeline", category: "DevOps", thumbnailUrl: "https://images.unsplash.com/photo-1667372393119-c81c0cda0a29?w=800&q=60", price: 99, isPaid: true, videos: 45, status: "active", createdAt: new Date().toISOString() },
];

const mockStudents = 1248;

// --- Components ---

// 1. Reusable Stat Card
const StatCard = ({ label, value, subtext, icon, color, width }: any) => (
  <View 
    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100" 
    style={{ width: width, marginBottom: 16 }}
  >
    <View className="flex-row justify-between items-start">
      <View>
        <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider">{label}</Text>
        <Text className="text-2xl font-bold text-gray-800 mt-1">{value}</Text>
      </View>
      <View className={`p-2 rounded-xl ${color} bg-opacity-10`}>
        <Ionicons name={icon} size={20} color="#4c1d95" /> 
      </View>
    </View>
    <Text className="text-xs text-gray-400 mt-2">{subtext}</Text>
  </View>
);

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  // Layout Logic
  // Desktop: 4 cards (gap handled via calc or style), Tablet: 2 cards, Mobile: 1 card (or 2 small)
  let cardWidth = "100%"; 
  if (isDesktop) cardWidth = "23.5%"; // 4 columns
  else if (isTablet) cardWidth = "48%"; // 2 columns
  else cardWidth = "48%"; // 2 columns on mobile too for tighter look, or 100%

  const stats = useMemo(() => {
    const totalCourses = sampleCourses.length;
    const totalVideos = sampleCourses.reduce((s, c) => s + (c.videos ?? 0), 0);
    const paidCourses = sampleCourses.filter((c) => c.isPaid).length;
    const freeCourses = totalCourses - paidCourses;
    const avgVideosPerCourse = totalCourses ? Math.round(totalVideos / totalCourses) : 0;
    return { totalCourses, totalVideos, paidCourses, freeCourses, avgVideosPerCourse };
  }, []);

  const paidPct = stats.totalCourses ? Math.round((stats.paidCourses / stats.totalCourses) * 100) : 0;
  const freePct = 100 - paidPct;

  const [username, setUserName] = useState("Admin");
  const logoImg = require('../../assets/images/anasol-logo.png');
  // The Gradient Colors extracted from the image
  // Purple -> Pink/Red -> Orange
  const BRAND_GRADIENT = ['#7c3aed', '#db2777', '#ea580c'] as const;

   useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          const decode: any = jwtDecode(token);
          setUserName(decode.sub || "Admin");
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };
    fetchUsername();
  }, []);
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" />
      
      {/* --- Header Section with Gradient --- */}
    <LinearGradient
  colors={BRAND_GRADIENT}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  className="pt-0 pb-12 px-6 rounded-b-[30px] shadow-lg"
  style={{
    marginBottom: -20,
    zIndex: 10,
    width: isDesktop ? '100%': '100%', // 800 can be any px value for desktop
    alignSelf: 'center', // Center on desktop
    height: isDesktop ? 140 : 120,
  }}
>
        <View className="flex-row justify-between items-center max-w-8xl mx-auto w-full">
          <View>
            <View className="flex-row items-center space-x-2 mb-1">
               {/* Small logo placeholder */}
               <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                  <Image source={logoImg} style={{ width: 30, height: 30, resizeMode: 'contain' }} />
               </View>
               <Text className="text-white/80 ml-2 font-semibold tracking-widest text-xs uppercase">Anasol LMS</Text>
            </View>
            <Text className="text-3xl font-bold text-white">Dashboard</Text>
            <Text className="text-white/80 text-sm mt-1">Welcome <Text className="text-white/80 font-semibold text-2xl mt-1">{username}</Text></Text>
          </View>
          
          <View className="flex-row space-x-3">
             <Pressable className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                <Ionicons name="notifications-outline" size={22} color="white" />
             </Pressable>
             {/*<Pressable className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                <Ionicons name="person-outline" size={22} color="white" />
             </Pressable>*/}
          </View>
        </View>
      </LinearGradient>

      {/* --- Main Scrollable Content --- */}
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-8xl mx-auto w-full">
            
            {/* 1. Statistics Grid */}
            <View className="flex-row flex-wrap justify-between mb-2">
              <StatCard 
                label="Total Courses" 
                value={stats.totalCourses} 
                subtext="Active catalog items" 
                icon="library" 
                color="bg-purple-100" 
                width={cardWidth} 
              />
              <StatCard 
                label="Total Videos" 
                value={stats.totalVideos} 
                subtext="Content material" 
                icon="videocam" 
                color="bg-pink-100" 
                width={cardWidth} 
              />
              <StatCard 
                label="Total Students" 
                value={mockStudents} 
                subtext="Active enrollments" 
                icon="people" 
                color="bg-orange-100" 
                width={cardWidth} 
              />
              <StatCard 
                label="Engagement" 
                value={`${stats.avgVideosPerCourse}`} 
                subtext="Avg videos / course" 
                icon="analytics" 
                color="bg-indigo-100" 
                width={cardWidth} 
              />
            </View>

            {/* 2. Analytics Section (Chart) */}
            <View className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-lg font-bold text-gray-800">Course Distribution</Text>
                <Pressable>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
                </Pressable>
              </View>

              {/* Custom Progress Bar */}
              <View className="h-4 w-full bg-gray-100 rounded-full flex-row overflow-hidden mb-4">
                 <LinearGradient 
                    colors={['#7c3aed', '#db2777']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={{ width: `${paidPct}%`, height: '100%' }} 
                 />
                 {/* Free section is transparent, showing bg-gray-100 */}
              </View>

              <View className="flex-row justify-between">
                 <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-purple-600 mr-2" />
                    <View>
                        <Text className="text-gray-500 text-xs">Paid Content</Text>
                        <Text className="text-gray-800 font-bold">{stats.paidCourses} Courses ({paidPct}%)</Text>
                    </View>
                 </View>
                 <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-gray-300 mr-2" />
                    <View>
                        <Text className="text-gray-500 text-xs">Free Content</Text>
                        <Text className="text-gray-800 font-bold">{stats.freeCourses} Courses ({freePct}%)</Text>
                    </View>
                 </View>
              </View>
            </View>

            {/* 3. Top Courses List */}
            <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-800">Top Performing Courses</Text>
                <Pressable>
                    <Text className="text-purple-600 font-semibold text-sm">View All</Text>
                </Pressable>
            </View>

            <View className="gap-y-4">
              {sampleCourses.map((c) => (
                <View 
                  key={c.courseId} 
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-row flex-wrap md:flex-nowrap items-center justify-between"
                >
                  <View className="flex-row items-center flex-1 min-w-[250px]">
                    {/* Thumbnail */}
                    <View className="h-16 w-16 rounded-xl bg-gray-100 overflow-hidden mr-4 border border-gray-100">
                       {c.thumbnailUrl ? (
                         <Image source={{ uri: c.thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
                       ) : (
                         <View className="w-full h-full items-center justify-center bg-purple-50">
                             <Ionicons name="image-outline" size={24} color="#7c3aed" />
                         </View>
                       )}
                    </View>
                    
                    {/* Info */}
                    <View>
                        <Text className="text-xs text-orange-600 font-bold mb-0.5">{c.category}</Text>
                        <Text className="text-base font-bold text-gray-800">{c.name}</Text>
                        <View className="flex-row items-center mt-1">
                           <Ionicons name="videocam-outline" size={12} color="#9ca3af" />
                           <Text className="text-xs text-gray-400 ml-1 mr-3">{c.videos} Videos</Text>
                           <View className={`px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <Text className={`text-[10px] font-bold ${c.status === 'active' ? 'text-green-700' : 'text-gray-500'}`}>
                                 {c.status.toUpperCase()}
                              </Text>
                           </View>
                        </View>
                    </View>
                  </View>

                  {/* Price & Action */}
                  <View className="flex-row items-center justify-between w-full md:w-auto mt-4 md:mt-0 pl-0 md:pl-4">
                      <Text className="text-lg font-bold text-gray-800 mr-4">
                         {c.isPaid ? `$${c.price}` : <Text className="text-green-600">Free</Text>}
                      </Text>
                      
                      <Pressable className="bg-gray-50 p-2 rounded-full border border-gray-100">
                         <Ionicons name="chevron-forward" size={20} color="#374151" />
                      </Pressable>
                  </View>
                </View>
              ))}
            </View>
        </View>
      </ScrollView>
    </View>
  );
}