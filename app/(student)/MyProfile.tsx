import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import api from "../(utils)/api";
import { useLms } from "../(utils)/LmsContext";

// --- RAZORPAY IMPORT ---
import RazorpayCheckout from "react-native-razorpay";

const { width } = Dimensions.get("window");
const isLargeScreen = width > 768;

// --- VECTOR BACKGROUND (WEB & MOBILE) ---
const DashboardBackground = ({ isWeb }: { isWeb: boolean }) => (
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      backgroundColor: "#F1F5F9",
    }}
  >
    {/* Abstract Blobs */}
    <Svg height="100%" width="100%" style={{ position: "absolute" }}>
      <Defs>
        <SvgLinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#818CF8" stopOpacity="0.2" />
          <Stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.05" />
        </SvgLinearGradient>
      </Defs>
      <Circle cx="10%" cy="20%" r="300" fill="url(#grad1)" />
      <Circle cx="90%" cy="80%" r="400" fill="#E0E7FF" fillOpacity="0.4" />
    </Svg>
    {isWeb && (
      <View
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "40%",
          height: "100%",
          backgroundColor: "rgba(255,255,255,0.5)",
          borderTopLeftRadius: 60,
          borderBottomLeftRadius: 60,
        }}
      />
    )}
  </View>
);

// --- EXTRACTED COMPONENTS (PREVENTS RE-RENDER ISSUES) ---

const StatBox = ({ item, delay }: any) => (
  <MotiView
    from={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: delay, type: "spring" }}
    className={`flex-1 p-5 rounded-2xl bg-white border border-slate-100 ${
      isLargeScreen ? "mr-4 shadow-sm" : "mb-3 shadow-sm mx-1"
    }`}
    style={{ borderRadius: 16 }}
  >
    <View className="flex-row justify-between items-start">
      <View>
        <Text className="text-3xl font-bold text-slate-800 mb-1">
          {item.value}
        </Text>
        <Text className="text-slate-500 font-medium text-xs uppercase tracking-wider">
          {item.label}
        </Text>
      </View>
      <View className="p-3 rounded-xl" style={{ backgroundColor: item.bg }}>
        <Feather name={item.icon as any} size={24} color={item.color} />
      </View>
    </View>
  </MotiView>
);

const SettingsItem = ({ item, index, isWeb }: any) => (
  <MotiView
    from={{ opacity: 0, translateY: 10 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ delay: 500 + index * 100 }}
  >
    <TouchableOpacity
      onPress={item.action}
      className={`flex-row items-center p-4 mb-3 bg-white rounded-xl border border-slate-100 ${
        isWeb
          ? "hover:bg-slate-50 transition-colors cursor-pointer"
          : "active:bg-slate-50"
      }`}
      style={{ borderRadius: 12 }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: item.color + "15", borderRadius: 20 }}
      >
        <Feather name={item.icon as any} size={18} color={item.color} />
      </View>
      <View className="flex-1">
        <Text className="text-slate-700 font-bold text-base">{item.label}</Text>
        <Text className="text-slate-400 text-xs">{item.sub}</Text>
      </View>
      <Feather name="chevron-right" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  </MotiView>
);

const WebLayout = ({
  userInfo,
  router,
  logout,
  stats,
  menuItems,
  handleSubscription,
}: any) => (
  <View className="flex-row h-full w-full max-w-7xl mx-auto p-8 gap-8">
    {/* LEFT SIDEBAR (Glassy) */}
    <MotiView
      from={{ opacity: 0, translateX: -50 }}
      animate={{ opacity: 1, translateX: 0 }}
      className="w-1/4 h-full bg-white rounded-[40px] shadow-2xl overflow-hidden relative"
      style={{ borderRadius: 40, overflow: "hidden" }}
    >
      {/* Sidebar Background Gradient */}
      <LinearGradient
        colors={["#6366F1", "#4338CA"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 200,
        }}
      />

      {/* Back Navigation Button for Web */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-6 left-6 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30"
        style={{ borderRadius: 999 }}
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>

      <View className="items-center mt-12 px-6">
        <View
          className="p-1 bg-white rounded-full shadow-lg"
          style={{ borderRadius: 999 }}
        >
          <Image
            source={{
              uri:
                "https://api.dicebear.com/9.x/avataaars/png?seed=" +
                userInfo.username,
            }}
            className="w-32 h-32 rounded-full bg-slate-100"
            style={{ borderRadius: 64 }}
          />
        </View>
        <Text className="text-2xl font-bold text-slate-800 mt-4 capitalize">
          {userInfo.username}
        </Text>
        <Text className="text-slate-500 text-sm mb-6">{userInfo.email}</Text>

        <View className="bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
          <Text className="text-indigo-600 font-bold text-xs uppercase tracking-widest">
            {userInfo.role}
          </Text>
        </View>
      </View>

      {/* Sidebar Menu */}
      <View className="mt-12 px-6 space-y-2">
        <TouchableOpacity
          onPress={() => router.push("/(student)/Home")}
          className="flex-row items-center p-3 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <Feather name="home" size={20} color="#64748B" />
          <Text className="ml-4 text-slate-600 font-medium">Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center p-3 rounded-xl bg-indigo-50">
          <Feather name="user" size={20} color="#4F46E5" />
          <Text className="ml-4 text-indigo-700 font-bold">My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={logout}
          className="flex-row items-center p-3 rounded-xl hover:bg-red-50 transition-colors mt-10"
        >
          <Feather name="log-out" size={20} color="#EF4444" />
          <Text className="ml-4 text-red-500 font-medium">Log Out</Text>
        </TouchableOpacity>
      </View>
    </MotiView>

    {/* RIGHT CONTENT PANEL */}
    <ScrollView className="flex-1 h-full" showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View className="flex-row justify-between items-end mb-8">
        <View>
          <Text className="text-slate-400 font-medium mb-1">Overview</Text>
          <Text className="text-4xl font-bold text-slate-800">
            Hello, {userInfo.username} 👋
          </Text>
        </View>
        <TouchableOpacity className="bg-white p-3 rounded-full shadow-sm border border-slate-100">
          <Feather name="bell" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View className="flex-row mb-8">
        {stats.map((item: any, i: number) => (
          <StatBox key={i} item={item} delay={i * 100} />
        ))}
      </View>

      <View className="flex-row gap-8">
        {/* Main Settings Column */}
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-800 mb-4">
            Account Settings
          </Text>
          {menuItems.map((item: any, i: number) => (
            <SettingsItem key={i} item={item} index={i} isWeb={true} />
          ))}
        </View>

        {/* Premium Side Column */}
        <View className="w-[350px]">
          <Text className="text-xl font-bold text-slate-800 mb-4">
            Subscription
          </Text>
          <TouchableOpacity onPress={handleSubscription} activeOpacity={0.9}>
            <LinearGradient
              colors={["#1E293B", "#0F172A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl p-8 relative overflow-hidden shadow-2xl justify-between h-64"
              style={{ borderRadius: 24 }}
            >
              <View className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/30 rounded-full blur-3xl -mr-10 -mt-10" />

              <View>
                <MaterialCommunityIcons
                  name="crown"
                  size={40}
                  color="#FBBF24"
                  style={{ marginBottom: 16 }}
                />
                <Text className="text-white text-2xl font-bold mb-1">
                  Premium Pass
                </Text>
                <Text className="text-indigo-200 text-sm">
                  Unlock Premium at ₹499
                </Text>
              </View>

              <View className="bg-white w-full py-3 rounded-xl items-center mt-6">
                <Text className="text-slate-900 font-bold">Pay Now</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  </View>
);

const MobileLayout = ({
  userInfo,
  router,
  logout,
  stats,
  menuItems,
  handleSubscription,
  insets,
  isWeb,
}: any) => (
  <ScrollView
    contentContainerStyle={{ paddingBottom: 100, paddingTop: insets.top }}
  >
    {/* Mobile Header */}
    <View className="px-6 py-6 flex-row justify-between items-center">
      <TouchableOpacity
        onPress={() => router.back()}
        className="w-10 h-10 rounded-full bg-white border border-slate-100 items-center justify-center"
        style={{ borderRadius: 999 }}
      >
        <Feather name="arrow-left" size={20} color="#1E293B" />
      </TouchableOpacity>
      <Text className="text-lg font-bold text-slate-800">Profile</Text>
      <TouchableOpacity
        onPress={logout}
        className="w-10 h-10 rounded-full bg-red-50 items-center justify-center"
        style={{ borderRadius: 999 }}
      >
        <Feather name="log-out" size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>

    {/* Mobile Profile Card */}
    <View
      className={isWeb ? "items-center mb-8" : "items-center mb-8"}
      style={
        isWeb
          ? {
              backgroundColor: "white",
              borderRadius: 24,
              marginHorizontal: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: "#E2E8F0",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 15,
              elevation: 2,
            }
          : {}
      }
    >
      <View className="relative">
        <Image
          source={{
            uri:
              "https://api.dicebear.com/9.x/avataaars/png?seed=" +
              userInfo.username,
          }}
          className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-sm"
          style={{ borderRadius: 100 }}
        />
        <View className="absolute bottom-0 right-0 bg-indigo-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
          <Feather name="edit-2" size={12} color="white" />
        </View>
      </View>
      <Text className="text-2xl font-bold text-slate-900 mt-4 capitalize">
        {userInfo.username}
      </Text>
      <Text className="text-slate-500">{userInfo.email}</Text>
    </View>

    {/* Stats Grid */}
    <View className="flex-row px-4 mb-8">
      {stats.map((item: any, i: number) => (
        <View
          key={i}
          className="flex-1 bg-white p-3 rounded-2xl items-center mx-1 shadow-sm border border-slate-100"
          style={{ borderRadius: 16 }}
        >
          <View
            className="p-2 rounded-full mb-2"
            style={{ backgroundColor: item.bg, borderRadius: 999 }}
          >
            <Feather name={item.icon as any} size={16} color={item.color} />
          </View>
          <Text className="font-bold text-lg text-slate-800">{item.value}</Text>
          <Text className="text-[10px] uppercase text-slate-400 font-bold">
            {item.label}
          </Text>
        </View>
      ))}
    </View>

    {/* Settings List */}
    <View className="px-6">
      <Text className="text-lg font-bold text-slate-800 mb-4">Settings</Text>
      {menuItems.map((item: any, i: number) => (
        <SettingsItem key={i} item={item} index={i} isWeb={isWeb} />
      ))}
    </View>

    {/* Mobile Premium Card */}
    <View className="px-6 mt-8">
      <TouchableOpacity onPress={handleSubscription} activeOpacity={0.9}>
        <LinearGradient
          colors={["#4F46E5", "#3730A3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-2xl p-6 flex-row items-center justify-between"
          style={{ borderRadius: 20 }}
        >
          <View>
            <Text className="text-white font-bold text-lg">Premium Pass</Text>
            <Text className="text-indigo-200 text-xs">
              Unlock Premium at ₹499
            </Text>
          </View>
          <View
            className="bg-white px-4 py-2 rounded-lg"
            style={{ borderRadius: 8 }}
          >
            <Text className="text-indigo-600 font-bold text-xs">Pay Now</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

const MyProfile = () => {
  const router = useRouter();
  const { logout } = useLms();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const [userInfo, setUserInfo] = useState({
    username: "Student",
    role: "Student",
    email: "",
  });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
    showCancel: false,
    onConfirm: () => {},
  });

  // --- STATIC DATA ---
  const stats = [
    {
      label: "Active Courses",
      value: "04",
      icon: "book-open",
      color: "#6366F1",
      bg: "#E0E7FF",
    },
    {
      label: "Hours Spent",
      value: "28h",
      icon: "clock",
      color: "#10B981",
      bg: "#D1FAE5",
    },
    {
      label: "Certificates",
      value: "02",
      icon: "award",
      color: "#F59E0B",
      bg: "#FEF3C7",
    },
  ];

  const menuItems = [
    {
      id: "security",
      label: "Security",
      sub: "Password & 2FA",
      icon: "shield",
      color: "#6366F1",
      action: () => setPasswordModalVisible(true),
    },
    {
      id: "notif",
      label: "Notifications",
      sub: "Email & Push",
      icon: "bell",
      color: "#EC4899",
      action: () => {},
    },
    {
      id: "billing",
      label: "Billing",
      sub: "History & Plans",
      icon: "credit-card",
      color: "#10B981",
      action: () => {},
    },
    {
      id: "help",
      label: "Support",
      sub: "Help Center",
      icon: "life-buoy",
      color: "#F59E0B",
      action: () => {},
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          const decode: any = jwtDecode(token);
          setUserInfo({
            username: decode.sub || "Student",
            role: decode.role || "Student",
            email: decode.email || "student@example.com",
          });
        }
      } catch (e) {
        console.log("Error loading profile", e);
      }
    };
    fetchUser();
  }, []);

  // --- HELPERS ---
  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" = "success",
    showCancel = false,
    onConfirm = () => {},
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      showCancel,
      onConfirm: () => {
        onConfirm();
        closeAlert();
      },
    });
  };
  const closeAlert = () =>
    setAlertConfig((prev) => ({ ...prev, visible: false }));

  const handleSubscription = async () => {
    const RAZORPAY_KEY_ID = "rzp_test_S1fzAgwuwEllqg";
    const amount = 49900; // 499 INR in paise
    const currency = "INR";
    const baseOptions = {
      description: "Premium Subscription",
      image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      currency,
      key: RAZORPAY_KEY_ID,
      amount,
      name: "LMS Platform",
      prefill: {
        email: userInfo.email || "student@example.com",
        contact: "9999999999",
        name: userInfo.username || "Student",
      },
      theme: { color: "#4F46E5" },
    };

    if (isWeb) {
      const loadScript = (src: string) =>
        new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js",
      );
      if (!res) return showAlert("Error", "Razorpay SDK failed.", "error");
      const paymentObject = new (window as any).Razorpay({
        ...baseOptions,
        handler: (response: any) =>
          showAlert(
            "Success",
            `ID: ${response.razorpay_payment_id}`,
            "success",
          ),
      });
      paymentObject.open();
    } else {
      try {
        const data = await RazorpayCheckout.open(baseOptions);
        showAlert("Success", `ID: ${data.razorpay_payment_id}`, "success");
      } catch (error: any) {
        if (error.code && error.code !== 0)
          showAlert("Failed", error.description, "error");
      }
    }
  };

  const handleChangePassword = async () => {
    if (
      !passData.old.trim() ||
      !passData.new.trim() ||
      !passData.confirm.trim()
    )
      return showAlert("Error", "All fields required.", "error");
    if (passData.new !== passData.confirm)
      return showAlert("Error", "Passwords mismatch.", "error");
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/change-password", {
        oldPassword: passData.old,
        newPassword: passData.new,
        confirmPassword: passData.confirm,
      });
      setPasswordModalVisible(false);
      setPassData({ old: "", new: "", confirm: "" });
      setTimeout(
        () =>
          showAlert("Success", response.data?.message || "Updated!", "success"),
        300,
      );
    } catch (error: any) {
      showAlert("Failed", error.response?.data?.message || "Failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="dark-content" />
      <DashboardBackground isWeb={isWeb} />

      {isWeb && isLargeScreen ? (
        <WebLayout
          userInfo={userInfo}
          router={router}
          logout={logout}
          stats={stats}
          menuItems={menuItems}
          handleSubscription={handleSubscription}
        />
      ) : (
        <MobileLayout
          userInfo={userInfo}
          router={router}
          logout={logout}
          stats={stats}
          menuItems={menuItems}
          handleSubscription={handleSubscription}
          insets={insets}
          isWeb={isWeb}
        />
      )}

      {/* --- MODALS --- */}

      {/* ALERT MODAL */}
      <Modal
        visible={alertConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={closeAlert}
      >
        <View className="flex-1 bg-slate-900/40 justify-center items-center px-4 backdrop-blur-sm">
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-sm rounded-3xl p-6 items-center shadow-2xl"
            style={{ borderRadius: 24 }}
          >
            <View
              className={`w-14 h-14 rounded-full items-center justify-center mb-4 ${
                alertConfig.type === "error" ? "bg-red-50" : "bg-emerald-50"
              }`}
              style={{ borderRadius: 999 }}
            >
              <Feather
                name={alertConfig.type === "error" ? "alert-circle" : "check"}
                size={28}
                color={alertConfig.type === "error" ? "#EF4444" : "#10B981"}
              />
            </View>
            <Text className="text-lg font-bold text-slate-800 mb-2">
              {alertConfig.title}
            </Text>
            <Text className="text-slate-500 text-center mb-6">
              {alertConfig.message}
            </Text>
            <View className="flex-row gap-3 w-full">
              {alertConfig.showCancel && (
                <TouchableOpacity
                  onPress={closeAlert}
                  className="flex-1 py-3 rounded-xl bg-slate-100 items-center"
                  style={{ borderRadius: 12 }}
                >
                  <Text className="font-bold text-slate-600">Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={alertConfig.onConfirm}
                className={`flex-1 py-3 rounded-xl items-center ${
                  alertConfig.type === "error" ? "bg-red-500" : "bg-indigo-600"
                }`}
                style={{ borderRadius: 12 }}
              >
                <Text className="font-bold text-white">
                  {alertConfig.showCancel ? "Confirm" : "Okay"}
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      </Modal>

      {/* PASSWORD MODAL */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-slate-900/40 justify-center items-center backdrop-blur-sm px-4"
        >
          <TouchableWithoutFeedback
            onPress={() => setPasswordModalVisible(false)}
          >
            <View className="absolute inset-0" />
          </TouchableWithoutFeedback>
          <MotiView
            from={{ translateY: 50, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            style={{ borderRadius: 24 }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-slate-800">
                Change Password
              </Text>
              <TouchableOpacity
                onPress={() => setPasswordModalVisible(false)}
                className="p-2 bg-slate-50 rounded-full"
                style={{ borderRadius: 999 }}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              {["old", "new", "confirm"].map((field) => (
                <View key={field}>
                  <Text className="text-xs text-slate-500 font-bold uppercase mb-1 ml-1">
                    {field === "old"
                      ? "Current"
                      : field === "new"
                        ? "New Password"
                        : "Confirm"}
                  </Text>
                  <TextInput
                    secureTextEntry
                    className="bg-slate-50 text-slate-700 p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white"
                    placeholder="••••••••"
                    placeholderTextColor="#CBD5E1"
                    value={(passData as any)[field]}
                    onChangeText={(t) =>
                      setPassData((prev) => ({ ...prev, [field]: t }))
                    }
                    style={{ borderRadius: 12 }}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={isLoading}
              className="bg-indigo-600 mt-8 py-4 rounded-xl items-center shadow-lg shadow-indigo-200"
              style={{ borderRadius: 12 }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Update Security
                </Text>
              )}
            </TouchableOpacity>
          </MotiView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default MyProfile;
