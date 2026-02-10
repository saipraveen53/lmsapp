import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgGradient,
} from "react-native-svg";
// Note: Ensure this path is correct based on your file structure
import api from "../(utils)/api";
import { useLms } from "../(utils)/LmsContext";
import "../globals.css";

const logoImg = require("../../assets/images/anasol-logo.png");

// --- VECTOR ASSETS (SVGs) ---

// 1. Drawer Header Background (Abstract Waves)
const DrawerHeaderBg = () => (
  <Svg
    width="100%"
    height="100%"
    viewBox="0 0 300 200"
    preserveAspectRatio="xMidYMid slice"
  >
    <Defs>
      <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#4338ca" stopOpacity="1" />
        <Stop offset="1" stopColor="#be123c" stopOpacity="1" />
      </SvgGradient>
    </Defs>
    <Rect width="300" height="200" fill="url(#grad)" />
    <Circle cx="30" cy="30" r="40" fill="white" fillOpacity="0.1" />
    <Circle cx="270" cy="150" r="60" fill="white" fillOpacity="0.1" />
    <Path
      d="M0 150 Q 75 100 150 150 T 300 150 V 200 H 0 Z"
      fill="white"
      fillOpacity="0.1"
    />
  </Svg>
);

// 2. Security Illustration for Password Modal
const SecurityIllustration = () => (
  <Svg width="120" height="120" viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="45" fill="#e0e7ff" />
    <Path
      d="M50 20 L25 30 V50 C25 65 35 80 50 85 C65 80 75 65 75 50 V30 L50 20Z"
      fill="#4338ca"
    />
    <Path
      d="M50 40 V55 M50 65 V65"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <Circle cx="75" cy="25" r="10" fill="#f43f5e" />
    <Path d="M72 25 L78 25 M75 22 V28" stroke="white" strokeWidth="2" />
  </Svg>
);

// --- DRAWER CONTENT ---
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { logout } = useLms();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* Modern Vector Header */}
        <View className="h-56 w-full relative mb-4 overflow-hidden rounded-br-[40px]">
          <View className="absolute inset-0">
            <DrawerHeaderBg />
          </View>
          <View className="absolute inset-0 p-6 justify-center">
            {/* Logo Container - Moved Down with mt-8 */}
            <View className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center mb-3 mt-8 border border-white/30">
              <Image
                source={logoImg}
                style={{
                  width: 35,
                  height: 35,
                  resizeMode: "contain",
                  tintColor: "white",
                }}
              />
            </View>
            <Text className="text-white text-xl font-extrabold tracking-wide">
              Anasol LMS
            </Text>
            <View className="bg-white/20 self-start px-2 py-0.5 rounded-md mt-1">
              <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                Admin Console
              </Text>
            </View>
          </View>
        </View>

        {/* Drawer Items */}
        <View className="px-3">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Logout Button Area */}
      <View className="p-4 border-t border-slate-100 pb-8 bg-slate-50">
        <DrawerItem
          label="Sign Out"
          labelStyle={{
            color: "#e11d48",
            fontWeight: "bold",
            marginLeft: -10,
            fontSize: 15,
          }}
          icon={({ size }) => (
            <View className="bg-rose-100 p-1.5 rounded-lg">
              <Ionicons name="log-out" size={size - 4} color="#e11d48" />
            </View>
          )}
          onPress={handleLogout}
          style={{ borderRadius: 12 }}
        />
        <Text className="text-center text-slate-300 text-[10px] mt-2">
          Version 2.0.1
        </Text>
      </View>
    </View>
  );
};

// --- MAIN LAYOUT ---
export default function AdminLayout() {
  const router = useRouter();
  const { logout } = useLms();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";

  // State for Menus & Modals
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Password Form State
  const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Eye Toggle State
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 1. Handle Password Change API
  const handleChangePassword = async () => {
    // --- Validation: Empty Check ---
    if (
      !passData.old.trim() ||
      !passData.new.trim() ||
      !passData.confirm.trim()
    ) {
      if (Platform.OS === "web") {
        window.alert("All fields are required.");
      } else {
        Alert.alert("Validation Error", "All fields are required.");
      }
      return;
    }

    // --- Validation: Match Check ---
    if (passData.new !== passData.confirm) {
      if (Platform.OS === "web") {
        window.alert("New password and Confirm password do not match.");
      } else {
        Alert.alert(
          "Validation Error",
          "New password and Confirm password do not match.",
        );
      }
      return;
    }

    // --- NEW VALIDATION LOGIC ---
    const hasUpperCase = /[A-Z]/.test(passData.new);
    const hasNumber = /[0-9]/.test(passData.new);
    const hasSpecialChar = /[@$!%*?&]/.test(passData.new);

    if (
      passData.new.length < 8 ||
      !hasUpperCase ||
      !hasNumber ||
      !hasSpecialChar
    ) {
      const msg =
        "Password must contain:\n• At least 8 characters\n• 1 Uppercase letter\n• 1 Number\n• 1 Special Character (@$!%*?&)";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Invalid Password", msg);
      }
      return;
    }
    // -----------------------------------------

    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/change-password", {
        oldPassword: passData.old,
        newPassword: passData.new,
        confirmPassword: passData.confirm,
      });

      const successMsg =
        response.data?.message || "Password Changed Successfully!";
      if (Platform.OS === "web") {
        window.alert(successMsg);
      } else {
        Alert.alert("Success", successMsg);
      }

      setModalVisible(false);
      setPassData({ old: "", new: "", confirm: "" });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Failed to update password. Please try again.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Update Failed", msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openPasswordModal = () => {
    setMenuVisible(false);
    setModalVisible(true);
    setPassData({ old: "", new: "", confirm: "" });
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* DRAWER NAVIGATOR */}
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ navigation }) => ({
          headerBackground: () => (
            <LinearGradient
              colors={["#4338ca", "#6366f1"]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          ),
          headerTintColor: "#fff",
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontWeight: "800",
            fontSize: 18,
            letterSpacing: 0.5,
          },
          drawerActiveTintColor: "#4338ca",
          drawerActiveBackgroundColor: "#e0e7ff",
          drawerInactiveTintColor: "#475569",

          // FIX: Adjusted margin to prevent overlap
          drawerLabelStyle: {
            marginLeft: -10,
            fontWeight: "600",
            fontSize: 14,
          },

          drawerItemStyle: {
            borderRadius: 10,
            marginHorizontal: 8,
            marginVertical: 2,
          },

          // Menu Button
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
              className="bg-white/20 p-2 rounded-full backdrop-blur-sm"
            >
              <Ionicons name="grid-outline" size={20} color="white" />
            </TouchableOpacity>
          ),

          // Profile Button
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setMenuVisible(!menuVisible)}
              style={{ marginRight: 15 }}
            >
              <View className="w-9 h-9 bg-white rounded-full items-center justify-center border-2 border-indigo-200 shadow-sm">
                <Image
                  source={{
                    uri: "https://ui-avatars.com/api/?name=Admin&background=random",
                  }}
                  style={{ width: "100%", height: "100%", borderRadius: 99 }}
                />
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
              </View>
            </TouchableOpacity>
          ),
        })}
      >
        <Drawer.Screen
          name="Dashboard"
          options={{
            drawerLabel: "Dashboard",
            title: "Admin Dashboard",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="grid" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Courses"
          options={{
            drawerLabel: "Courses",
            title: "Manage Courses",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="library" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="BulkQuizUpload"
          options={{ drawerItemStyle: { display: "none" }, headerShown: false }}
        />
        <Drawer.Screen
          name="Students"
          options={{
            drawerLabel: "Students",
            title: "Student Directory",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        {/* NEW MENU ITEMS */}
        <Drawer.Screen
          name="BulkStudentUpload"
          options={{
            drawerLabel: "Bulk Upload",
            title: "Bulk Student Import",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="cloud-upload" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="AddAdmin"
          options={{
            drawerLabel: "Add Admin",
            title: "Create Administrator",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-add" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="CourseDetails"
          options={{ drawerItemStyle: { display: "none" }, headerShown: false }}
        />
        <Drawer.Screen
          name="Courseform"
          options={{ drawerItemStyle: { display: "none" }, headerShown: false }}
        />
      </Drawer>

      {/* --- 1. PROFILE DROPDOWN MENU --- */}
      {menuVisible && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <View
            className="absolute top-16 right-4 bg-white rounded-2xl shadow-2xl border border-slate-100 w-56 overflow-hidden py-1"
            style={{ elevation: 20 }}
          >
            <View className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <Text className="text-sm font-bold text-slate-800">
                Admin Account
              </Text>
              <Text className="text-xs text-slate-500">
                Manage your preferences
              </Text>
            </View>

            <TouchableOpacity
              onPress={openPasswordModal}
              className="flex-row items-center px-4 py-3.5 active:bg-indigo-50"
            >
              <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-3">
                <Ionicons name="key" size={16} color="#475569" />
              </View>
              <Text className="text-slate-600 font-medium text-sm">
                Change Password
              </Text>
            </TouchableOpacity>

            <View className="h-[1px] bg-slate-100 mx-4" />

            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                logout();
              }}
              className="flex-row items-center px-4 py-3.5 active:bg-rose-50"
            >
              <View className="w-8 h-8 rounded-full bg-rose-50 items-center justify-center mr-3">
                <Ionicons name="log-out" size={16} color="#e11d48" />
              </View>
              <Text className="text-rose-600 font-medium text-sm">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* --- 2. CHANGE PASSWORD MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center items-center bg-slate-900/70 px-4 backdrop-blur-sm"
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View className="absolute top-0 bottom-0 left-0 right-0" />
          </TouchableWithoutFeedback>

          <View className="bg-white w-full max-w-sm rounded-[32px] p-0 shadow-2xl overflow-hidden">
            {/* Modal Header Art */}
            <View className="bg-indigo-50 w-full items-center py-8 relative overflow-hidden">
              <View className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-100 rounded-full opacity-50" />
              <View className="absolute -left-10 bottom-0 w-24 h-24 bg-rose-100 rounded-full opacity-50" />
              <SecurityIllustration />
              <Text className="text-xl font-black text-slate-800 mt-4 tracking-tight">
                Update Password
              </Text>
              <Text className="text-xs text-slate-500 font-medium">
                Keep your account secure
              </Text>
            </View>

            <View className="p-6 space-y-4">
              {/* OLD PASS */}
              <View>
                <Text className="text-xs font-bold text-slate-600 mb-1.5 ml-1">
                  Current Password
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-12 focus:border-indigo-500 transition-colors">
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#94a3b8"
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    secureTextEntry={!showOld}
                    value={passData.old}
                    onChangeText={(t) => setPassData({ ...passData, old: t })}
                    placeholder="••••••••"
                    placeholderTextColor="#cbd5e1"
                    className="flex-1 text-slate-800 text-sm h-full"
                    style={{ outlineStyle: "none" } as any}
                  />
                  <TouchableOpacity onPress={() => setShowOld(!showOld)}>
                    <Ionicons
                      name={showOld ? "eye-off" : "eye"}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* NEW PASS */}
              <View>
                <Text className="text-xs font-bold text-slate-600 mb-1.5 ml-1">
                  New Password
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-12">
                  <Ionicons
                    name="key-outline"
                    size={18}
                    color="#94a3b8"
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    secureTextEntry={!showNew}
                    value={passData.new}
                    onChangeText={(t) => setPassData({ ...passData, new: t })}
                    placeholder="Min 8 chars, A-Z, 0-9, @"
                    placeholderTextColor="#cbd5e1"
                    className="flex-1 text-slate-800 text-sm h-full"
                    style={{ outlineStyle: "none" } as any}
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                    <Ionicons
                      name={showNew ? "eye-off" : "eye"}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* CONFIRM PASS */}
              <View>
                <Text className="text-xs font-bold text-slate-600 mb-1.5 ml-1">
                  Confirm Password
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-12 mb-2">
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#94a3b8"
                    style={{ marginRight: 10 }}
                  />
                  <TextInput
                    secureTextEntry={!showConfirm}
                    value={passData.confirm}
                    onChangeText={(t) =>
                      setPassData({ ...passData, confirm: t })
                    }
                    placeholder="Re-enter new password"
                    placeholderTextColor="#cbd5e1"
                    className="flex-1 text-slate-800 text-sm h-full"
                    style={{ outlineStyle: "none" } as any}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(!showConfirm)}
                  >
                    <Ionicons
                      name={showConfirm ? "eye-off" : "eye"}
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row gap-3 pt-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 py-3.5 bg-slate-100 rounded-xl items-center active:bg-slate-200"
                >
                  <Text className="font-bold text-slate-600">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleChangePassword}
                  disabled={isLoading}
                  activeOpacity={0.9}
                  className="flex-1 shadow-lg shadow-indigo-200"
                >
                  <LinearGradient
                    colors={["#4338ca", "#6366f1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="py-3.5 rounded-xl items-center"
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="font-bold text-white tracking-wide">
                        Update
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
