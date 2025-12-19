import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import "../globals.css";

type Course = {
  courseId: string;
  name: string;
  thumbnailUrl?: string;
  price?: number;
  isPaid: boolean;
  videos?: number;
  status: "active" | "inactive";
  createdAt: string;
};

const sampleCourses: Course[] = [
  { courseId: "C001", name: "Intro to React", thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60", price: 0, isPaid: false, videos: 8, status: "active", createdAt: new Date().toISOString() },
  { courseId: "C002", name: "Advanced TypeScript", thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60", price: 49, isPaid: true, videos: 15, status: "active", createdAt: new Date().toISOString() },
  { courseId: "C003", name: "UI Design Basics", thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=60", price: 29, isPaid: true, videos: 10, status: "inactive", createdAt: new Date().toISOString() },
  { courseId: "C004", name: "Algorithms 101", thumbnailUrl: "", price: 0, isPaid: false, videos: 20, status: "active", createdAt: new Date().toISOString() },
];

const mockStudents = 1248;

export default function Dashboard() {
  const { width } = useWindowDimensions();

  const stats = useMemo(() => {
    const totalCourses = sampleCourses.length;
    const totalVideos = sampleCourses.reduce((s, c) => s + (c.videos ?? 0), 0);
    const paidCourses = sampleCourses.filter((c) => c.isPaid).length;
    const freeCourses = totalCourses - paidCourses;
    const avgVideosPerCourse = totalCourses ? Math.round(totalVideos / totalCourses) : 0;
    return { totalCourses, totalVideos, paidCourses, freeCourses, avgVideosPerCourse };
  }, []);

  const columnLayout = width >= 1000 ? "row" : "column";
  const cardWidth = width >= 1000 ? `${100 / 4 - 1}%` : "100%";

  const paidPct = stats.totalCourses ? Math.round((stats.paidCourses / stats.totalCourses) * 100) : 0;
  const freePct = 100 - paidPct;

  return (
    <SafeAreaView className="flex-1 bg-sky-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-sky-700">Dashboard</Text>
            <Text className="text-sm text-sky-500">Overview & analytics — Student App</Text>
          </View>
          {/*<View className="flex-row items-center space-x-3">
            <Pressable className="flex-row items-center bg-white px-3 py-2 rounded-md shadow">
              <Ionicons name="cloud-download-outline" size={18} color="#0ea5e9" />
              <Text className="ml-2 text-sky-700 font-semibold">Export</Text>
            </Pressable>
            <Pressable className="flex-row items-center bg-sky-600 px-4 py-2 rounded-md shadow">
              <Ionicons name="add" size={18} color="white" />
              <Text className="ml-2 text-white font-semibold">New Course</Text>
            </Pressable>
          </View>*/}
        </View>

        {/* Summary cards */}
        <View className="mb-6" style={{ flexDirection: columnLayout }}>
          <View className="bg-white rounded-xl p-4 mr-4 mb-4 shadow" style={{ width: cardWidth, minWidth: 220 }}>
            <Text className="text-xs text-sky-500">Total Courses</Text>
            <Text className="text-2xl font-bold text-sky-700 mt-2">{stats.totalCourses}</Text>
            <Text className="text-sm text-gray-500 mt-1">Active catalog items</Text>
          </View>

          <View className="bg-white rounded-xl p-4 mr-4 mb-4 shadow" style={{ width: cardWidth, minWidth: 220 }}>
            <Text className="text-xs text-sky-500">Total Videos</Text>
            <Text className="text-2xl font-bold text-sky-700 mt-2">{stats.totalVideos}</Text>
            <Text className="text-sm text-gray-500 mt-1">Materials across courses</Text>
          </View>

          <View className="bg-white rounded-xl p-4 mr-4 mb-4 shadow" style={{ width: cardWidth, minWidth: 220 }}>
            <Text className="text-xs text-sky-500">Total Students</Text>
            <Text className="text-2xl font-bold text-sky-700 mt-2">{mockStudents}</Text>
            <Text className="text-sm text-gray-500 mt-1">Enrolled users</Text>
          </View>

          <View className="bg-white rounded-xl p-4 mb-4 shadow" style={{ width: cardWidth, minWidth: 220 }}>
            <Text className="text-xs text-sky-500">Avg Videos / Course</Text>
            <Text className="text-2xl font-bold text-sky-700 mt-2">{stats.avgVideosPerCourse}</Text>
            <Text className="text-sm text-gray-500 mt-1">Content density</Text>
          </View>
        </View>

        {/* Paid vs Free Chart */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-sky-700">Paid vs Free Courses</Text>
            <Text className="text-sm text-gray-500">{paidPct}% paid • {freePct}% free</Text>
          </View>

          <View className="w-full bg-gray-100 rounded-full h-4 overflow-hidden mb-3">
            <View style={{ width: `${paidPct}%` }} className="h-full bg-sky-600" />
            {/* free part is the remaining background */}
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <View className="w-3 h-3 bg-sky-600 rounded" />
              <Text className="text-sm text-sky-700 font-semibold">{stats.paidCourses} Paid</Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <View className="w-3 h-3 bg-gray-300 rounded" />
              <Text className="text-sm text-sky-700 font-semibold">{stats.freeCourses} Free</Text>
            </View>
          </View>
        </View>

        {/* Top Courses list (cards) */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-sky-700 mb-3">Top Courses</Text>
          <View className="space-y-3">
            {sampleCourses.slice(0, 4).map((c) => (
              <View key={c.courseId} className="bg-white rounded-xl p-3 flex-row items-center justify-between shadow">
                <View className="flex-row items-center">
                  <View className="rounded-md overflow-hidden bg-sky-100 mr-3" style={{ width: 64, height: 64, alignItems: "center", justifyContent: "center" }}>
                    {c.thumbnailUrl ? (
                      <Image source={{ uri: c.thumbnailUrl }} style={{ width: 64, height: 64 }} resizeMode="cover" />
                    ) : (
                      <Ionicons name="book-outline" size={32} color="#60a5fa" />
                    )}
                  </View>
                  <View style={{ maxWidth: "65%" }}>
                    <Text className="font-semibold text-sky-700">{c.name}</Text>
                    <Text className="text-xs text-gray-500">{c.courseId} • {c.status} • {c.videos ?? 0} videos</Text>
                  </View>
                </View>

                <View className="items-end">
                  <Text className="text-sm font-semibold text-sky-700">{c.isPaid ? `$${(c.price ?? 0).toFixed(2)}` : "Free"}</Text>
                  <View className="flex-row items-center mt-2">
                    <Pressable className="px-3 py-1 bg-sky-600 rounded-md mr-2">
                      <Text className="text-white font-semibold">Manage</Text>
                    </Pressable>
                    <Pressable className="px-3 py-1 bg-gray-100 rounded-md">
                      <Ionicons name="ellipsis-horizontal" size={18} color="#374151" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Insights / quick actions */}
        <View className="bg-white rounded-xl p-4 mb-10 shadow">
          <Text className="text-lg font-bold text-sky-700 mb-3">Quick Insights</Text>

          <View className="flex-row flex-wrap -mx-2">
            <View className="p-2 w-1/2 md:w-1/4">
              <View className="bg-sky-50 rounded-lg p-3 items-start">
                <Text className="text-xs text-gray-500">Active Courses</Text>
                <Text className="text-xl font-bold text-sky-700 mt-2">{sampleCourses.filter(s => s.status === "active").length}</Text>
              </View>
            </View>

            <View className="p-2 w-1/2 md:w-1/4">
              <View className="bg-sky-50 rounded-lg p-3 items-start">
                <Text className="text-xs text-gray-500">Inactive Courses</Text>
                <Text className="text-xl font-bold text-amber-500 mt-2">{sampleCourses.filter(s => s.status === "inactive").length}</Text>
              </View>
            </View>

            <View className="p-2 w-1/2 md:w-1/4">
              <View className="bg-sky-50 rounded-lg p-3 items-start">
                <Text className="text-xs text-gray-500">Total Students</Text>
                <Text className="text-xl font-bold text-sky-700 mt-2">{mockStudents}</Text>
              </View>
            </View>

            <View className="p-2 w-1/2 md:w-1/4">
              <View className="bg-sky-50 rounded-lg p-3 items-start">
                <Text className="text-xs text-gray-500">Avg Videos</Text>
                <Text className="text-xl font-bold text-sky-700 mt-2">{Math.round(stats.totalVideos / Math.max(1, stats.totalCourses))}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}