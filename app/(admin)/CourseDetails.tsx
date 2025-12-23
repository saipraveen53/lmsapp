import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, ImageBackground, Linking, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

// 1. Data Row for Technical Details
const TechRow = ({ label, value }: { label: string, value: any }) => (
  <View className="flex-row justify-between py-1 border-b border-slate-100">
    <Text className="text-[10px] font-bold text-slate-500 uppercase">{label}</Text>
    <Text className="text-[10px] text-slate-600 font-mono text-right flex-1 ml-4" numberOfLines={1}>
        {value !== null && value !== undefined ? String(value) : "N/A"}
    </Text>
  </View>
);

// 2. Icon + Text Feature
const FeatureItem = ({ icon, text, color = "#4f46e5" }: any) => (
    <View className="flex-row items-center mb-2 mr-4">
        <Ionicons name={icon} size={14} color={color} />
        <Text className="text-xs text-slate-700 ml-1.5 font-medium">{text}</Text>
    </View>
);

// 3. Status Badge
const StatusBadge = ({ active, text }: { active: boolean, text: string }) => (
    <View className={`px-2 py-0.5 rounded border ${active ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
        <Text className={`text-[10px] font-bold ${active ? 'text-emerald-700' : 'text-slate-500'}`}>{text}</Text>
    </View>
);

export default function CourseDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768; // Desktop Breakpoint

  // 1. Logic: Parse Data (Unchanged)
  const course = params.course ? JSON.parse(params.course as string) : null;
  const [imgError, setImgError] = useState(false);

  if (!course) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Ionicons name="cloud-offline-outline" size={48} color="#94a3b8" />
        <Text className="text-slate-500 mt-4">Course data not found.</Text>
      </View>
    );
  }

  // Helper to handle link opening
  const openLink = (url: string | null) => {
      if(url) Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View className="flex-1 bg-slate-100">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* ====================================================================
            1. HALF-SCREEN BACKGROUND IMAGE HERO
           ==================================================================== */}
        <View className="relative w-full h-[450px]">
            <ImageBackground
                source={{ uri: !imgError && course.thumbnailUrl ? course.thumbnailUrl : "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop" }}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => setImgError(true)}
            >
                {/* Gradient Overlay for Text Readability */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(15, 23, 42, 1)']}
                    className="flex-1 justify-between p-6 pt-12"
                >
                    {/* Header Nav */}
                    <Pressable 
                        onPress={() => router.push("/(admin)/Courses")}
                        className="self-start bg-black/30 backdrop-blur-md px-4 py-2 rounded-full flex-row items-center border border-white/20"
                    >
                        <Ionicons name="arrow-back" size={18} color="white" />
                        <Text className="text-white font-bold ml-2">Back</Text>
                    </Pressable>

                    {/* Hero Text Content (Only show here on Mobile, or minimal on Desktop) */}
                    <View className={isDesktop ? "max-w-6xl mx-auto w-full mb-12" : "mb-16"}>
                        <View className="flex-row flex-wrap gap-2 mb-3">
                            <View className="bg-indigo-600 px-3 py-1 rounded-md">
                                <Text className="text-white text-xs font-bold uppercase">{course.category || "Development"}</Text>
                            </View>
                             {course.isFree && <View className="bg-emerald-500 px-3 py-1 rounded-md"><Text className="text-white text-xs font-bold">FREE</Text></View>}
                             {!course.isPublished && <View className="bg-orange-500 px-3 py-1 rounded-md"><Text className="text-white text-xs font-bold">DRAFT</Text></View>}
                        </View>

                        <Text className="text-3xl md:text-5xl font-extrabold text-white shadow-lg leading-tight mb-2">
                            {course.title}
                        </Text>
                        <Text className="text-indigo-200 text-lg font-medium mb-4 shadow-sm">
                            {course.subtitle}
                        </Text>

                        {/* Ratings & Students */}
                        <View className="flex-row items-center gap-4">
                            <View className="flex-row items-center bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                                <Ionicons name="star" size={16} color="#fbbf24" />
                                <Text className="text-white font-bold ml-1.5">{course.rating?.toFixed(1) || "0.0"}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="people" size={16} color="#cbd5e1" />
                                <Text className="text-slate-300 ml-1.5 font-medium">{course.totalStudents} Enrolled</Text>
                            </View>
                             <View className="flex-row items-center">
                                <Ionicons name="time" size={16} color="#cbd5e1" />
                                <Text className="text-slate-300 ml-1.5 font-medium">{course.totalDuration} mins</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>

        {/* ====================================================================
            2. MAIN CONTENT CARD (Floats over the Image)
           ==================================================================== */}
        <View className={`px-4 -mt-10 ${isDesktop ? "max-w-7xl mx-auto w-full" : ""}`}>
            
            <View className={isDesktop ? "flex-row gap-6 items-start" : "flex-col"}>
                
                {/* --- LEFT COLUMN (Overview & Technicals) --- */}
                <View className={isDesktop ? "w-[350px]" : "w-full mb-6"}>
                    
                    {/* Primary Info Card */}
                    <View className="bg-white rounded-xl shadow-lg p-5 border-t-4 border-indigo-500 mb-6">
                        <Text className="text-2xl font-bold text-slate-800 mb-1">{course.isFree ? "Free" : `$${course.price}`}</Text>
                        <Text className="text-xs text-slate-400 font-bold uppercase mb-4 tracking-wide">Course Price</Text>
                        
                        <View className="space-y-3">
                            <FeatureItem icon="cellular-outline" text={`Level: ${course.level}`} />
                            <FeatureItem icon="language-outline" text={`Language: ${course.language}`} />
                            <FeatureItem icon="layers-outline" text={`${course.totalLectures} Total Lectures`} />
                            <FeatureItem icon="person-outline" text={`Target: ${course.targetAudience}`} />
                            <FeatureItem icon="checkmark-circle-outline" text={course.requirements} />
                        </View>
                    </View>

                    {/* Technical / Admin Data Card (Showing ALL variables) */}
                    <View className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                        <Text className="text-xs font-bold text-slate-400 uppercase mb-3 flex-row items-center">
                            <Ionicons name="code-slash" size={12} /> System Data
                        </Text>
                        
                        <TechRow label="Course ID" value={course.courseId} />
                        <TechRow label="Library ID" value={course.libraryId} />
                        <TechRow label="Created At" value={course.createdAt} />
                        <TechRow label="Updated At" value={course.updatedAt} />
                        <TechRow label="Published At" value={course.publishedAt} />
                        
                        {/* Preview Video Link */}
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

                {/* --- RIGHT COLUMN (Description & Curriculum) --- */}
                <View className="flex-1 bg-white rounded-2xl shadow-sm p-6 min-h-[500px]">
                    
                    {/* Description Section */}
                    <View className="mb-8 border-b border-slate-100 pb-6">
                        <Text className="text-xl font-bold text-slate-800 mb-3">About this Course</Text>
                        <Text className="text-slate-600 leading-7 text-sm">{course.description}</Text>
                        
                        <View className="mt-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
                             <Text className="font-bold text-purple-900 mb-2 flex-row items-center">
                                <Ionicons name="school" size={16} /> What You Will Learn
                             </Text>
                             <Text className="text-purple-800 text-sm leading-5">{course.whatYouWillLearn}</Text>
                        </View>
                    </View>

                    {/* Curriculum Section */}
                    <View className="flex-row justify-between items-end mb-4">
                        <Text className="text-xl font-bold text-slate-800">Curriculum</Text>
                        <Text className="text-xs text-slate-400">{course.sections?.length || 0} Sections • {course.totalLectures} Lectures</Text>
                    </View>

                    {course.sections && course.sections.length > 0 ? (
                        course.sections.map((section: any) => (
                            <View key={section.id} className="mb-5 border border-slate-200 rounded-xl overflow-hidden">
                                {/* Section Header */}
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

                                {/* Lectures List */}
                                <View className="bg-white p-2">
                                    {section.lectures && section.lectures.length > 0 ? (
                                        section.lectures.map((lecture: any) => (
                                            <View key={lecture.id} className="flex-row mb-3 last:mb-0 p-2 hover:bg-slate-50 rounded-lg">
                                                {/* Lecture Thumbnail (Small) */}
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

                                                {/* Lecture Details */}
                                                <View className="flex-1 justify-center">
                                                    <View className="flex-row justify-between">
                                                        <Text className="font-semibold text-slate-700 text-xs">{lecture.title}</Text>
                                                        <Text className="text-[9px] text-slate-300 font-mono">ID:{lecture.id}</Text>
                                                    </View>
                                                    
                                                    <Text className="text-[10px] text-slate-500 mt-0.5" numberOfLines={1}>{lecture.description}</Text>
                                                    
                                                    {/* Lecture Technical Data (videoGuid, etc) */}
                                                    <View className="flex-row flex-wrap items-center mt-1 gap-2">
                                                        <View className="bg-slate-100 px-1.5 rounded"><Text className="text-[8px] text-slate-400 font-mono">GUID: {lecture.videoGuid || "N/A"}</Text></View>
                                                        <View className="bg-slate-100 px-1.5 rounded"><Text className="text-[8px] text-slate-400 font-mono">Lib: {lecture.videoLibraryId || "N/A"}</Text></View>
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
                        ))
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
  );
}