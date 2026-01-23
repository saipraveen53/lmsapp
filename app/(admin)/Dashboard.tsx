import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";
import { rootApi } from "../(utils)/axiosInstance";
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
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60",
];

const sampleCourses: Course[] = [
  {
    courseId: "C001",
    name: "Intro to React",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60",
    price: 0,
    isPaid: false,
    videos: 8,
    status: "active",
  },
  {
    courseId: "C002",
    name: "Advanced TypeScript",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60",
    price: 49,
    isPaid: true,
    videos: 15,
    status: "active",
  },
  {
    courseId: "C003",
    name: "UI Design Basics",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=60",
    price: 29,
    isPaid: true,
    videos: 10,
    status: "inactive",
  },
  {
    courseId: "C004",
    name: "Algorithms 101",
    thumbnailUrl: "",
    price: 0,
    isPaid: false,
    videos: 20,
    status: "active",
  },
];

// --- VECTOR DIAGRAMS (SVGs) ---

// 1. Header Banner Illustration (Android)
const HeaderIllustration = () => (
  <Svg width="100%" height="100%" viewBox="0 0 300 150">
    <Defs>
      <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#4f46e5" stopOpacity="1" />
        <Stop offset="1" stopColor="#818cf8" stopOpacity="1" />
      </SvgGradient>
    </Defs>
    <Rect width="300" height="150" fill="url(#grad)" rx="20" />
    <Circle cx="250" cy="120" r="60" fill="white" fillOpacity="0.1" />
    <Circle cx="40" cy="30" r="40" fill="white" fillOpacity="0.1" />
    <Path
      d="M200 80 Q 230 40 260 80 T 320 80"
      stroke="white"
      strokeWidth="2"
      fill="none"
      strokeOpacity="0.3"
    />
  </Svg>
);

// 2. Activity Diagram (Web/Dashboard Panel)
//

// [Image of Activity Diagram]

const ActivityChartSvg = () => (
  <Svg width="100%" height="100" viewBox="0 0 400 100">
    <Path
      d="M0 80 C 50 80, 50 20, 100 20 S 150 60, 200 60 S 250 10, 300 40 S 350 90, 400 50"
      stroke="#6366f1"
      strokeWidth="3"
      fill="none"
    />
    <Circle cx="100" cy="20" r="4" fill="#4f46e5" />
    <Circle cx="200" cy="60" r="4" fill="#4f46e5" />
    <Circle cx="300" cy="40" r="4" fill="#4f46e5" />

    {/* Grid lines for context */}
    <Line
      x1="0"
      y1="20"
      x2="400"
      y2="20"
      stroke="#e2e8f0"
      strokeDasharray="4 4"
    />
    <Line
      x1="0"
      y1="50"
      x2="400"
      y2="50"
      stroke="#e2e8f0"
      strokeDasharray="4 4"
    />
    <Line
      x1="0"
      y1="80"
      x2="400"
      y2="80"
      stroke="#e2e8f0"
      strokeDasharray="4 4"
    />
  </Svg>
);

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  // Responsive Layout Logic
  const gap = 20;
  const containerPadding = isWeb ? 40 : 20;
  const availableWidth = width - containerPadding * 2;

  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [totalVideos, setTotalVideos] = useState<number>(0);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [totalActiveStudents, setTotalActiveStudents] = useState<number>(0);

  let cardWidth = 0;
  if (isDesktop) {
    cardWidth = (availableWidth - gap * 3) / 4;
  } else if (isTablet) {
    cardWidth = (availableWidth - gap) / 2;
  } else {
    // Mobile: Full width for stats list items or half for grid
    cardWidth = (availableWidth - gap) / 2;
  }

  const stats = useMemo(() => {
    return {
      totalCourses: sampleCourses.length,
      totalStudents: 1248,
      paid: 2,
      free: 2,
    };
  }, []);

  const [username, setUserName] = useState("Admin");

  useEffect(() => {
    rootApi
      .get("/api/courses")
      .then((res) => {
        const rawData = res.data?.data || [];
        let globalVideoCount = 0;
        const courses = rawData.map((c: any) => {
          const courseLecturesCount = Array.isArray(c.sections)
            ? c.sections.reduce(
                (sum: number, s: any) =>
                  sum + (Array.isArray(s.lectures) ? s.lectures.length : 0),
                0,
              )
            : 0;
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
        setTotalVideos(globalVideoCount);
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
          setUserName(fullName.slice(0, 5));
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };
    fetchUsername();
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    rootApi
      .get("/api/courses/count")
      .then((res) => {
        setTotalCourses(res.data?.data || 0);
      })
      .catch(() => setTotalCourses(0));
  }, []);

  const displayedCourses = showAllCourses
    ? recentCourses
    : recentCourses.slice(0, 5);

  // --- ANDROID SPECIFIC UI ---
  const AndroidLayout = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* 1. HERO HEADER WITH ILLUSTRATION */}
      <View className="mb-6">
        <View className="h-48 w-full rounded-b-3xl overflow-hidden relative shadow-lg bg-indigo-600">
          <View className="absolute inset-0">
            <HeaderIllustration />
          </View>
          <View className="p-6 justify-end h-full">
            <Text className="text-indigo-100 font-medium text-xs uppercase tracking-widest mb-1 opacity-90">
              {currentDate}
            </Text>
            <Text className="text-3xl font-extrabold text-white">
              Hi, {username}
            </Text>
            <Text className="text-indigo-100 text-sm opacity-80 mt-1">
              Welcome back to your academy.
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        {/* 2. HORIZONTAL STATS SCROLL */}
        <Text className="text-lg font-bold text-slate-800 mb-4 ml-1">
          Overview
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
          className="mb-8"
        >
          <MobileStatCard
            title="Courses"
            value={totalCourses}
            icon="school"
            color="#4f46e5" // Indigo
            bg="#e0e7ff"
          />
          <MobileStatCard
            title="Students"
            value={stats.totalStudents}
            icon="people"
            color="#e11d48" // Rose
            bg="#ffe4e6"
          />
          <MobileStatCard
            title="Videos"
            value={totalVideos}
            icon="play-circle"
            color="#f97316" // Orange
            bg="#ffedd5"
          />
          <MobileStatCard
            title="Revenue"
            value="$4.2k"
            icon="wallet"
            color="#10b981" // Emerald
            bg="#d1fae5"
          />
        </ScrollView>

        {/* 3. MODERN COURSE LIST */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold text-slate-800 ml-1">
            Recent Activity
          </Text>
          <TouchableOpacity onPress={() => setShowAllCourses(!showAllCourses)}>
            <Text className="text-indigo-600 font-semibold text-xs bg-indigo-50 px-3 py-1 rounded-full">
              {showAllCourses ? "Collapse" : "View All"}
            </Text>
          </TouchableOpacity>
        </View>

        <View>
          {displayedCourses.map((c, index) => (
            <View
              key={c.courseId}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 flex-row items-center"
            >
              <Image
                source={{
                  uri:
                    c.thumbnailUrl ||
                    PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length],
                }}
                className="w-16 h-16 rounded-xl bg-slate-200"
                resizeMode="cover"
              />
              <View className="flex-1 ml-4">
                <View className="flex-row justify-between items-start">
                  <Text
                    className="font-bold text-slate-800 text-sm flex-1 mr-2"
                    numberOfLines={1}
                  >
                    {c.name}
                  </Text>
                  <Text
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                      c.isPaid
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {c.isPaid ? "Paid" : "Free"}
                  </Text>
                </View>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="film-outline" size={14} color="#94a3b8" />
                  <Text className="text-xs text-slate-500 ml-1">
                    {c.videos} Videos
                  </Text>
                  <View className="w-1 h-1 bg-slate-300 rounded-full mx-2" />
                  <Text
                    className={`text-xs capitalize font-medium ${
                      c.status === "active"
                        ? "text-emerald-500"
                        : "text-slate-400"
                    }`}
                  >
                    {c.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  // --- WEB SPECIFIC UI ---
  const WebLayout = () => (
    <ScrollView
      contentContainerStyle={{
        padding: containerPadding,
        maxWidth: 1400,
        alignSelf: "center",
        width: "100%",
      }}
    >
      {/* 1. DASHBOARD HEADER */}
      <View className="flex-row justify-between items-center mb-10 pb-6 border-b border-slate-200">
        <View>
          <Text className="text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-2">
            Admin Portal • {currentDate}
          </Text>
          <Text className="text-4xl font-black text-slate-900">
            Welcome back, {username}
          </Text>
          <Text className="text-slate-500 mt-2 text-lg">
            Manage your courses and track performance metrics.
          </Text>
        </View>
        <View className="flex-row items-center bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
          <View className="w-2 h-2 rounded-full bg-emerald-500 mr-3 animate-pulse" />
          <Text className="text-slate-600 font-medium">System Online</Text>
        </View>
      </View>

      {/* 2. ACTIVITY CHART SECTION (Visual Diagram) */}
      <View className="flex-row mb-10 gap-8">
        {/* Left: Stats Grid */}
        <View className="flex-1">
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
              value={stats.totalStudents}
              icon="people-outline"
              theme="rose"
              width={cardWidth}
            />
            <StatCard
              title="Content Library"
              value={`${totalVideos} Videos`}
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
        </View>

        {/* Right: Activity Graph Panel */}
        {isDesktop && (
          <View className="w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 justify-between">
            <View>
              <Text className="text-lg font-bold text-slate-800 mb-1">
                User Activity
              </Text>
              <Text className="text-sm text-slate-500">
                Last 7 Days Performance
              </Text>
            </View>
            <View className="h-32 justify-center my-4">
              {/* SVG ACTIVITY DIAGRAM */}
              <ActivityChartSvg />
            </View>
            <View className="flex-row justify-between items-center pt-4 border-t border-slate-50">
              <Text className="text-slate-400 text-xs">Updated 5 mins ago</Text>
              <Text className="text-indigo-600 font-bold text-sm">
                View Report →
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 3. COURSES TABLE SECTION */}
      <View className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <View className="p-6 border-b border-slate-100 flex-row justify-between items-center bg-slate-50/50">
          <Text className="text-xl font-bold text-slate-800">
            Recent Courses
          </Text>
          <TouchableOpacity
            onPress={() => setShowAllCourses(!showAllCourses)}
            className="bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50"
          >
            <Text className="text-slate-600 font-medium text-sm">
              {showAllCourses ? "Show Less" : "View All Courses"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Table Header */}
        <View className="flex-row bg-slate-50 py-3 px-6 border-b border-slate-100">
          <Text className="flex-1 font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Course Name
          </Text>
          <Text className="w-32 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Price
          </Text>
          <Text className="w-32 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Content
          </Text>
          <Text className="w-32 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider">
            Status
          </Text>
        </View>

        {/* Table Body */}
        {displayedCourses.map((c, index) => (
          <View
            key={c.courseId}
            className={`flex-row items-center px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer ${
              index !== displayedCourses.length - 1
                ? "border-b border-slate-100"
                : ""
            }`}
          >
            {/* Course Info */}
            <View className="flex-1 flex-row items-center">
              <Image
                source={{
                  uri:
                    c.thumbnailUrl ||
                    PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length],
                }}
                className="w-12 h-12 rounded-lg mr-4 bg-slate-200"
              />
              <View>
                <Text className="font-bold text-slate-700 text-sm">
                  {c.name}
                </Text>
                <Text className="text-xs text-slate-400 mt-0.5">
                  ID: {c.courseId}
                </Text>
              </View>
            </View>

            {/* Price */}
            <View className="w-32 items-center">
              <View
                className={`px-3 py-1 rounded-full ${c.isPaid ? "bg-indigo-50" : "bg-emerald-50"}`}
              >
                <Text
                  className={`text-xs font-bold ${c.isPaid ? "text-indigo-600" : "text-emerald-600"}`}
                >
                  {c.price === 0 ? "Free" : `$${c.price}`}
                </Text>
              </View>
            </View>

            {/* Content */}
            <View className="w-32 items-center">
              <View className="flex-row items-center">
                <Ionicons name="film-outline" size={14} color="#64748b" />
                <Text className="text-slate-600 text-sm font-medium ml-1">
                  {c.videos}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View className="w-32 items-center">
              <View className="flex-row items-center">
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${c.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}
                />
                <Text className="text-slate-600 text-sm capitalize">
                  {c.status}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar
        barStyle={isWeb ? "dark-content" : "light-content"}
        backgroundColor={isWeb ? "#f8fafc" : "#4f46e5"}
      />
      {isWeb ? <WebLayout /> : <AndroidLayout />}
    </SafeAreaView>
  );
}

// --- HELPER COMPONENTS ---

// 1. Desktop/Tablet Stat Card
const getThemeColors = (theme: string) => {
  switch (theme) {
    case "indigo":
      return {
        bg: "#e0e7ff",
        icon: "#4f46e5",
        trend: "text-indigo-600",
        trendBg: "bg-indigo-50",
      };
    case "rose":
      return {
        bg: "#ffe4e6",
        icon: "#e11d48",
        trend: "text-rose-600",
        trendBg: "bg-rose-50",
      };
    case "orange":
      return {
        bg: "#ffedd5",
        icon: "#f97316",
        trend: "text-orange-600",
        trendBg: "bg-orange-50",
      };
    case "emerald":
      return {
        bg: "#d1fae5",
        icon: "#10b981",
        trend: "text-emerald-600",
        trendBg: "bg-emerald-50",
      };
    default:
      return {
        bg: "#f1f5f9",
        icon: "#64748b",
        trend: "text-slate-600",
        trendBg: "bg-slate-50",
      };
  }
};

const StatCard = ({ title, value, icon, theme, trend, width }: any) => {
  const colors = getThemeColors(theme);
  return (
    <View
      style={{ width: width }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-col justify-between hover:shadow-md transition-all cursor-default"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View
          style={{ backgroundColor: colors.bg }}
          className="w-12 h-12 rounded-xl items-center justify-center"
        >
          <Ionicons name={icon} size={24} color={colors.icon} />
        </View>
        <View className={`px-2.5 py-1 rounded-full ${colors.trendBg}`}>
          <Text className={`text-[10px] font-bold ${colors.trend}`}>
            ↗ +2.5%
          </Text>
        </View>
      </View>
      <View>
        <Text className="text-3xl font-black text-slate-800 tracking-tight">
          {value}
        </Text>
        <Text className="text-sm text-slate-500 font-medium mt-1">{title}</Text>
      </View>
    </View>
  );
};

// 2. Mobile Stat Card (Simplified for Horizontal Scroll)
const MobileStatCard = ({ title, value, icon, color, bg }: any) => {
  return (
    <View className="bg-white p-4 rounded-2xl mr-3 w-32 shadow-sm border border-slate-100 items-center">
      <View
        style={{ backgroundColor: bg }}
        className="w-10 h-10 rounded-full items-center justify-center mb-3"
      >
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text className="text-xl font-bold text-slate-800 text-center">
        {value}
      </Text>
      <Text className="text-xs text-slate-500 text-center mt-1">{title}</Text>
    </View>
  );
};
