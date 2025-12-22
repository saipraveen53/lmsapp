import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import "../globals.css";

// Same Data ...
type Course = { courseId: string; name: string; thumbnailUrl?: string; price?: number; isPaid: boolean; videos?: number; status: "active" | "inactive"; };
const sampleCourses: Course[] = [
  { courseId: "C001", name: "Intro to React", thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60", price: 0, isPaid: false, videos: 8, status: "active" },
  { courseId: "C002", name: "Advanced TypeScript", thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60", price: 49, isPaid: true, videos: 15, status: "active" },
  { courseId: "C003", name: "UI Design Basics", thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=60", price: 29, isPaid: true, videos: 10, status: "inactive" },
  { courseId: "C004", name: "Algorithms 101", thumbnailUrl: "", price: 0, isPaid: false, videos: 20, status: "active" },
];

export default function Dashboard() {
  const { width } = useWindowDimensions();

  const stats = useMemo(() => {
    return { totalCourses: sampleCourses.length, totalVideos: 53, totalStudents: 1248, paid: 2, free: 2 };
  }, []);

  const cardWidth = width >= 1000 ? "23%" : "47%";

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Welcome Banner */}
        <View className="mb-8">
            <Text className="text-3xl font-bold text-slate-800">Hello, Admin 👋</Text>
            <Text className="text-slate-500">Here's what's happening in your academy today.</Text>
        </View>

        {/* Stats Cards - Updated with Gradient Icons */}
        <View className="flex-row flex-wrap justify-between mb-6">
          <StatCard title="Total Courses" value={stats.totalCourses} icon="library" color1="#4f46e5" color2="#818cf8" width={cardWidth} />
          <StatCard title="Total Students" value={stats.totalStudents} icon="people" color1="#e11d48" color2="#fb7185" width={cardWidth} />
          <StatCard title="Total Videos" value={stats.totalVideos} icon="play-circle" color1="#f97316" color2="#fdba74" width={cardWidth} />
          <StatCard title="Revenue" value="$4.2k" icon="cash" color1="#10b981" color2="#34d399" width={cardWidth} />
        </View>

        {/* Top Courses List */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <Text className="text-lg font-bold text-slate-800 mb-4">Recent Courses</Text>
          {sampleCourses.map((c) => (
             <View key={c.courseId} className="flex-row items-center justify-between mb-4 pb-4 border-b border-slate-50 last:border-0 last:mb-0 last:pb-0">
                <View className="flex-row items-center flex-1">
                   <Image 
                      source={{ uri: c.thumbnailUrl || "https://via.placeholder.com/100" }} 
                      className="w-12 h-12 rounded-lg bg-slate-200 mr-3"
                   />
                   <View>
                      <Text className="font-bold text-slate-700">{c.name}</Text>
                      <Text className="text-xs text-slate-400">{c.videos} Videos • {c.status}</Text>
                   </View>
                </View>
                <View className={`px-2 py-1 rounded text-xs ${c.isPaid ? 'bg-indigo-50' : 'bg-green-50'}`}>
                    <Text className={`text-xs font-bold ${c.isPaid ? 'text-indigo-600' : 'text-green-600'}`}>
                        {c.isPaid ? `$${c.price}` : 'FREE'}
                    </Text>
                </View>
             </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ title, value, icon, color1, color2, width }: any) => (
    <View style={{ width: width }} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4">
        <View className="flex-row justify-between items-start mb-2">
            <View className="p-2 rounded-lg" style={{ backgroundColor: color2 + '20' }}>
                 <Ionicons name={icon} size={22} color={color1} />
            </View>
            <Text className="text-xs font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                +12%
            </Text>
        </View>
        <Text className="text-2xl font-bold text-slate-800">{value}</Text>
        <Text className="text-xs text-slate-500 font-medium">{title}</Text>
    </View>
);