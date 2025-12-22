import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient'; // Import Gradient
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView, Text,
  View, useWindowDimensions
} from "react-native";
import "../globals.css";

// ... Keep your Types & Sample Data same as previous file ...
// (Omitting dummy data to save space, paste your sampleCourses here)
const sampleCourses = [
  { courseId: "C001", name: "Intro to React", description: "Basics of React.", thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60", price: 0, isPaid: false, status: "active", createdAt: new Date().toISOString() },
  { courseId: "C002", name: "Advanced TS", description: "Deep dive into types.", thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60", price: 49, isPaid: true, status: "active", createdAt: new Date().toISOString() },
];

export default function Courses() {
  const [courses, setCourses] = useState<any[]>(sampleCourses);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const { width } = useWindowDimensions();
  const router = useRouter();

  const columns = width >= 720 ? 2 : 1;
  const cardWidth = (width - 48 - (16 * (columns - 1))) / columns;

  // ... Keep openCreate, openEdit, handleSave logic same ...
  const openCreate = () => { setEditingCourse(null); setForm({}); setModalVisible(true); };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 p-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-2xl font-bold text-slate-800">Courses</Text>
            <Text className="text-sm text-slate-500">Manage catalogue</Text>
          </View>
          <Pressable onPress={openCreate}>
            <LinearGradient
                colors={['#4338ca', '#6366f1']}
                start={{x:0, y:0}} end={{x:1, y:0}}
                className="flex-row items-center px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-200"
            >
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text className="text-white font-bold ml-2">New Course</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {courses.map((c) => (
              <View key={c.courseId} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100" style={{ width: cardWidth }}>
                {/* Thumbnail */}
                <View className="h-40 mb-3 rounded-xl overflow-hidden bg-slate-100 relative">
                  <Image source={{ uri: c.thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
                  <View className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold">
                    <Text className="text-[10px] font-bold text-slate-800">{c.isPaid ? 'PAID' : 'FREE'}</Text>
                  </View>
                </View>

                <Text className="text-lg font-bold text-slate-800 mb-1">{c.name}</Text>
                <Text className="text-sm text-slate-500 mb-4" numberOfLines={2}>{c.description}</Text>

                {/* --- ACTION: UPLOAD QUIZ (Gradient Border Button) --- */}
                <Pressable
                  onPress={() => router.push({ pathname: '/(admin)/BulkQuizUpload', params: { courseId: c.courseId, courseName: c.name } })}
                >
                  <LinearGradient
                    colors={['#fdf4ff', '#eef2ff']} // Very light gradient bg
                    className="border border-indigo-200 p-3 rounded-xl flex-row items-center justify-center mb-3"
                  >
                     <View className="bg-indigo-100 p-1.5 rounded-full mr-2">
                        <Ionicons name="cloud-upload" size={14} color="#4338ca" />
                     </View>
                     <Text className="text-indigo-700 font-bold text-sm">Upload Quiz / Test</Text>
                  </LinearGradient>
                </Pressable>

                <View className="flex-row gap-2 mt-auto">
                    <Pressable className="flex-1 bg-slate-100 py-2 rounded-lg items-center" onPress={() => {}}>
                        <Text className="text-slate-600 font-bold text-xs">Edit</Text>
                    </Pressable>
                    <Pressable className="flex-1 bg-rose-50 py-2 rounded-lg items-center" onPress={() => {}}>
                        <Text className="text-rose-600 font-bold text-xs">Delete</Text>
                    </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        
        {/* Modal Logic (Hidden for brevity - keep your existing modal code) */}
        {/* ... Paste your Modal code here ... */}
        
      </View>
    </SafeAreaView>
  );
}
