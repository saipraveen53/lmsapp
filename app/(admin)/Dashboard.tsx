import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { CourseApi } from "../(utils)/axiosInstance";
// import "../globals.css"; 

// --- TYPES & DATA ---
type Course = {
  courseId: string;
  name: string;
  thumbnailUrl?: string;
  price?: number;
  isPaid: boolean;
  videos?: number;
  status: "active" | "inactive";
};

// --- PLACEHOLDER IMAGES ARRAY ---
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=60",
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60"
];

const sampleCourses: Course[] = [
  { courseId: "C001", name: "Intro to React", thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60", price: 0, isPaid: false, videos: 8, status: "active" },
  { courseId: "C002", name: "Advanced TypeScript", thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60", price: 49, isPaid: true, videos: 15, status: "active" },
  { courseId: "C003", name: "UI Design Basics", thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=60", price: 29, isPaid: true, videos: 10, status: "inactive" },
  { courseId: "C004", name: "Algorithms 101", thumbnailUrl: "", price: 0, isPaid: false, videos: 20, status: "active" },
];

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  // Responsive Layout Logic
  const gap = 20;
  const containerPadding = 30;
  const availableWidth = width - (containerPadding * 2);

  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  
  // --- NEW STATE: Total Videos Count ---
  const [totalVideos, setTotalVideos] = useState<number>(0);
  const [bunnyVideoCounts, setBunnyVideoCounts] = useState<{ [courseId: string]: number }>({});
  
  // --- STATE: Controls initial display limit ---
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [totalActiveStudents, setTotalActiveStudents] = useState<number>(0);

  let cardWidth = 0;
  if (isDesktop) {
    // 4 columns: (Total - 3 gaps) / 4
    cardWidth = (availableWidth - (gap * 4)) / 4  ;
  } else if (isTablet) {
    // 2 columns: (Total - 1 gap) / 2
    cardWidth = (availableWidth - gap) / 2;
  } else {
    // Mobile: 2 columns
    cardWidth = (availableWidth - gap) / 2;
  }

  const stats = useMemo(() => {
    return { totalCourses: sampleCourses.length, totalStudents: 1248, paid: 2, free: 2 };
  }, []);

  const [username, setUserName] = useState("Admin");

  useEffect(() => {
    CourseApi
      .get("/api/courses")
      .then((res) => {
        const rawData = res.data?.data || [];
        
        let globalVideoCount = 0; // Initialize counter for all videos across all courses

        // Map API data to UI fields
        const courses = rawData.map((c: any) => {
          // Count total lectures in all sections for THIS course
          const courseLecturesCount = Array.isArray(c.sections)
            ? c.sections.reduce(
                (sum: number, s: any) =>
                  sum + (Array.isArray(s.lectures) ? s.lectures.length : 0),
                0
              )
            : 0;

          // Add to the global count
          globalVideoCount += courseLecturesCount;

          return {
            courseId: c.courseId,
            name: c.title,
            thumbnailUrl: c.thumbnailUrl,
            price: c.price,
            isPaid: !c.isFree,
            videos: courseLecturesCount,
            status: c.isPublished ? "active" : "inactive",
            libraryId: c.libraryId,
          };
        });

        setRecentCourses(courses);
        setTotalVideos(globalVideoCount); // Update the state
      })
      .catch((err) => {
        console.log("Error fetching courses:", err);
        setRecentCourses([]);
        setTotalVideos(0);
      });
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          const decode: any = jwtDecode(token);
          const fullName = decode.sub || "Admin";
          // UPDATED: Slice to get only the first 5 characters
          setUserName(fullName.slice(0, 5));
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };
    fetchUsername();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    CourseApi
      .get("/api/courses/count")
      .then((res) => {
        setTotalCourses(res.data?.data || 0);
      })
      .catch(() => setTotalCourses(0));
  }, []);

  const fetchTotalActiveStudents = useCallback(async () => {
    try {
      // 1. Get all courses
      const coursesRes = await CourseApi.get("/api/courses");
      const courses = coursesRes.data?.data || [];

      // 2. For each course, fetch enrollment stats
      const statsPromises = courses.map((course: any) =>
        CourseApi.get(`http://192.168.0.230:8088/api/courses/${course.courseId}/enrollment-stats`)
          .then(res => res.data?.totalEnrolledStudents || 0)
          .catch(() => 0)
      );
      const stats = await Promise.all(statsPromises);

      // 3. Sum up all students
      const total = stats.reduce((sum, n) => sum + n, 0);
      setTotalActiveStudents(total);
    } catch (err) {
      setTotalActiveStudents(0);
    }
  }, []);

  useEffect(() => {
    fetchTotalActiveStudents();
  }, [fetchTotalActiveStudents]);

  useEffect(() => {
    const fetchBunnyCounts = async () => {
      const counts: { [courseId: string]: number } = {};
      await Promise.all(
        recentCourses
          .filter((c) => c.libraryId)
          .map(async (c) => {
            try {
              const url = `https://video.bunnycdn.com/library/${c.libraryId}/videos?page=1&itemsPerPage=1`;
              const res = await axios.get(url, {
                headers: {
                  AccessKey: "eb8560ce-e8a6-414c-8e250605c6d5-627d-4c55",
                  Accept: "application/json",
                },
              });
              counts[c.courseId] = res.data.totalItems || 0;
            } catch {
              counts[c.courseId] = 0;
            }
          })
      );
      setBunnyVideoCounts(counts);
    };

    if (recentCourses.length > 0) {
      fetchBunnyCounts();
    }
  }, [recentCourses]);
  // --- LOGIC: Determine which courses to display ---
  // If showAllCourses is true, show everything.
  // If false, slice the first 5.
  const displayedCourses = showAllCourses ? recentCourses : recentCourses.slice(0, 5);
  const totalBunnyVideos = Object.values(bunnyVideoCounts).reduce((sum, count) => sum + count, 0);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <ScrollView contentContainerStyle={{ padding: containerPadding, paddingBottom: 40 }}>
        
        {/* HEADER SECTION */}
        <View className="flex-row justify-between items-end mb-8">
          <View>
            <Text className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
              {currentDate}
            </Text>
            <Text className="text-3xl font-extrabold text-slate-800">
              Hello, {username} <Text className="text-yellow-500">👋</Text>
            </Text>
            <Text className="text-slate-500 mt-1 text-base">
              Here's your academy performance overview.
            </Text>
          </View>
        </View>

        {/* STATS GRID */}
        <View className="flex-row flex-wrap" style={{ gap: gap }}>
          <StatCard 
            title="Total Courses" 
            value={totalCourses} 
            icon="school-outline" 
            theme="indigo"
            width={cardWidth} 
          />
        <StatCard 
          title="Active Students" 
          value={totalActiveStudents} // <-- Use fetched value here
          icon="people-outline" 
          theme="rose"
          width={cardWidth} 
        />
          {/* UPDATED: Uses dynamic totalVideos state */}
         <StatCard 
            title="Content Library" 
            value={`${totalBunnyVideos} Videos`} 
            icon="play-circle-outline" 
            theme="orange"
            width={cardWidth} 
          />
          <StatCard 
            title="Total Revenue" 
            value="$4,250" 
            icon="wallet-outline" 
            theme="emerald"
            width={cardWidth} 
          />
        </View>

        {/* RECENT COURSES SECTION */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xl font-bold text-slate-800">Recent Courses</Text>
            
            {/* UPDATED: Button toggles the view */}
            <TouchableOpacity onPress={() => setShowAllCourses(!showAllCourses)}>
              <Text className="text-indigo-600 font-semibold text-sm">
                {showAllCourses ? "Show Less" : "View All"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {displayedCourses.map((c, index) => (
              <View
                key={c.courseId}
                className={`p-4 flex-row items-center justify-between ${
                  index !== displayedCourses.length - 1 ? "border-b border-slate-50" : ""
                } hover:bg-slate-50 transition-colors`}
              >
                {/* Left Side: Image & Text */}
                <View className="flex-row items-center flex-1 mr-4">
                  <View className="relative shadow-sm">
                    {/* Use random placeholder from array if no URL exists */}
                    <Image
                      source={{ uri: c.thumbnailUrl || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length] }}
                      className="w-14 h-14 rounded-xl"
                      resizeMode="cover"
                    />
                    
                    {/* Status Dot */}
                    <View
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        c.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                  </View>

                  <View className="ml-4 flex-1">
                    <Text className="font-bold text-slate-700 text-base" numberOfLines={1}>
                      {c.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="film-outline" size={12} color="#94a3b8" />
                      <Text className="text-xs text-slate-500 ml-1 mr-3">{c.libraryId ? (bunnyVideoCounts[c.courseId] ?? "...") : 0} Lessons</Text>
                      {isDesktop && (
                        <Text
                          className={`text-xs capitalize font-medium ${
                            c.status === "active" ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          ● {c.status}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Right Side: Price & Tag */}
                <View className="items-end">
                  <Text className="font-bold text-slate-800 text-base mb-1">
                    {c.price === 0 ? "Free" : `$${c.price}`}
                  </Text>
                  <View
                    className={`px-2 py-0.5 rounded-md ${
                      c.isPaid ? "bg-indigo-50" : "bg-emerald-50"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase tracking-wide ${
                        c.isPaid ? "text-indigo-600" : "text-emerald-600"
                      }`}
                    >
                      {c.isPaid ? "Premium" : "Free"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- HELPER COMPONENTS ---

const getThemeColors = (theme: string) => {
    switch (theme) {
        case 'indigo': return { bg: '#e0e7ff', icon: '#4f46e5', trend: 'text-indigo-600', trendBg: 'bg-indigo-50' };
        case 'rose': return { bg: '#ffe4e6', icon: '#e11d48', trend: 'text-rose-600', trendBg: 'bg-rose-50' };
        case 'orange': return { bg: '#ffedd5', icon: '#f97316', trend: 'text-orange-600', trendBg: 'bg-orange-50' };
        case 'emerald': return { bg: '#d1fae5', icon: '#10b981', trend: 'text-emerald-600', trendBg: 'bg-emerald-50' };
        default: return { bg: '#f1f5f9', icon: '#64748b', trend: 'text-slate-600', trendBg: 'bg-slate-50' };
    }
}

const StatCard = ({ title, value, icon, theme, trend, width }: any) => {
    const colors = getThemeColors(theme);
    
    return (
        <View 
            style={{ width: width }} 
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-col justify-between"
        >
            <View className="flex-row justify-between items-start mb-4">
                <View 
                    style={{ backgroundColor: colors.bg }} 
                    className="w-10 h-10 rounded-full items-center justify-center"
                >
                     <Ionicons name={icon} size={20} color={colors.icon} />
                </View>
                
                {trend && (
                    <View className={`px-2 py-1 rounded-full ${colors.trendBg}`}>
                        <Text className={`text-[10px] font-bold ${colors.trend}`}>
                           ↗ {trend}
                        </Text>
                    </View>
                )}
            </View>
            
            <View>
                <Text className="text-2xl font-bold text-slate-800 tracking-tight">{value}</Text>
                <Text className="text-sm text-slate-500 font-medium mt-1">{title}</Text>
            </View>
        </View>
    );
};