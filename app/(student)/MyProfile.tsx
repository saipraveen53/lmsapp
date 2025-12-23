import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform, // <--- 1. Import Platform here
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MyProfile = () => {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({
        username: "Student",
        role: "Student",
        email: ""
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem("accessToken");
                if (token) {
                    const decode: any = jwtDecode(token);
                    setUserInfo({
                        username: decode.sub || "Student",
                        role: decode.role || "Student",
                        email: decode.email || ""
                    });
                }
            } catch (e) {
                console.log("Error loading profile", e);
            }
        };
        fetchUser();
    }, []);

    // 2. Separate logic for actual logout action (Reusable)
    const performLogout = async () => {
        try {
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("userRole");
            router.replace("/"); // Go to Login Screen
        } catch (error) {
            console.log("Logout failed", error);
        }
    };

    // 3. Modified Handle Logout for Web & Mobile
    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            // Web browser specific confirmation
            const confirm = window.confirm("Are you sure you want to log out?");
            if (confirm) {
                await performLogout();
            }
        } else {
            // Mobile (Android/iOS) Native Alert
            Alert.alert(
                "Confirm Logout",
                "Are you sure you want to log out?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Logout",
                        style: "destructive",
                        onPress: performLogout // Calls the function above
                    }
                ]
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

            {/* HEADER */}
            <View className="flex-row items-center justify-between p-5 bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">My Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>

                {/* PROFILE CARD */}
                <View className="bg-white p-6 rounded-3xl shadow-sm items-center mb-6">
                    <View className="relative mb-4">
                        <Image
                            source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
                            className="w-28 h-28 rounded-full border-4 border-indigo-50"
                        />
                        <View className="absolute bottom-0 right-0 bg-indigo-500 p-2 rounded-full border-2 border-white">
                            <Ionicons name="camera" size={14} color="white" />
                        </View>
                    </View>

                    <Text className="text-2xl font-bold text-gray-900 capitalize">{userInfo.username}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{userInfo.role}</Text>
                </View>

                {/* DETAILS SECTION */}
                <View className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
                    <View className="p-4 border-b border-gray-100 flex-row items-center">
                        <Ionicons name="person-outline" size={20} color="#64748b" />
                        <Text className="ml-3 text-gray-700 font-medium flex-1">Username</Text>
                        <Text className="text-gray-900 font-bold capitalize">{userInfo.username}</Text>
                    </View>
                    <View className="p-4 border-b border-gray-100 flex-row items-center">
                        <Ionicons name="mail-outline" size={20} color="#64748b" />
                        <Text className="ml-3 text-gray-700 font-medium flex-1">Email</Text>
                        <Text className="text-gray-900 font-bold">{userInfo.email || "Not Available"}</Text>
                    </View>
                    <View className="p-4 flex-row items-center">
                        <Ionicons name="shield-checkmark-outline" size={20} color="#64748b" />
                        <Text className="ml-3 text-gray-700 font-medium flex-1">Status</Text>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-green-700 text-xs font-bold">Active</Text>
                        </View>
                    </View>
                </View>

                {/* SETTINGS OPTIONS (Dummy) */}
                <View className="bg-white rounded-2xl shadow-sm mb-8">
                    <TouchableOpacity className="p-4 border-b border-gray-100 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="settings-outline" size={20} color="#4f46e5" />
                            <Text className="ml-3 text-gray-700 font-medium">Account Settings</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-4 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="notifications-outline" size={20} color="#f59e0b" />
                            <Text className="ml-3 text-gray-700 font-medium">Notifications</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                </View>

                {/* LOGOUT BUTTON */}
                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-50 p-4 rounded-xl flex-row justify-center items-center border border-red-100"
                >
                    <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                    <Text className="text-red-600 font-bold ml-2 text-lg">Log Out</Text>
                </TouchableOpacity>

                <Text className="text-center text-gray-400 text-xs mt-6">App Version 1.0.0</Text>

            </ScrollView>
        </SafeAreaView>
    );
};

export default MyProfile;