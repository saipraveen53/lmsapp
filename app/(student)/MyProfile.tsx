import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../(utils)/api'; // Make sure api is imported

const MyProfile = () => {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({
        username: "Student",
        role: "Student",
        email: ""
    });

    // --- PASSWORD CHANGE STATE ---
    const [modalVisible, setModalVisible] = useState(false);
    const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
    const [isLoading, setIsLoading] = useState(false);
    // Visibility Toggles
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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

    // --- CHANGE PASSWORD LOGIC ---
    const handleChangePassword = async () => {
        // Validation
        if (!passData.old.trim() || !passData.new.trim() || !passData.confirm.trim()) {
            Alert.alert("Validation Error", "All fields are required.");
            return;
        }
        if (passData.new !== passData.confirm) {
            Alert.alert("Validation Error", "New password and Confirm password do not match.");
            return;
        }

        setIsLoading(true);
        try {
            // Using the same endpoint as Admin
            const response = await api.post('/api/auth/change-password', { 
               oldPassword: passData.old, 
               newPassword: passData.new,
               confirmPassword: passData.confirm 
            });
            
            Alert.alert("Success", response.data?.message || "Password Changed Successfully!");
            
            // Reset & Close
            setModalVisible(false);
            setPassData({ old: '', new: '', confirm: '' });
        } catch (error: any) {
            console.log("Change Pass Error:", error.response?.data);
            const msg = error.response?.data?.message || "Failed to update password. Please try again.";
            Alert.alert("Update Failed", msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Separate logic for actual logout action (Reusable)
    const performLogout = async () => {
        try {
            await AsyncStorage.removeItem("accessToken");
            await AsyncStorage.removeItem("userRole");
            router.replace("/"); // Go to Login Screen
        } catch (error) {
            console.log("Logout failed", error);
        }
    };

    // Modified Handle Logout for Web & Mobile
    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            const confirm = window.confirm("Are you sure you want to log out?");
            if (confirm) {
                await performLogout();
            }
        } else {
            Alert.alert(
                "Confirm Logout",
                "Are you sure you want to log out?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Logout",
                        style: "destructive",
                        onPress: performLogout
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

                {/* SETTINGS OPTIONS */}
                <View className="bg-white rounded-2xl shadow-sm mb-8">
                    {/* Updated to Trigger Modal */}
                    <TouchableOpacity 
                        onPress={() => setModalVisible(true)}
                        className="p-4 border-b border-gray-100 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="key-outline" size={20} color="#4f46e5" />
                            <Text className="ml-3 text-gray-700 font-medium">Change Password</Text>
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

            {/* --- CHANGE PASSWORD MODAL --- */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-center items-center bg-black/60 px-4">
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View className="absolute top-0 bottom-0 left-0 right-0" />
                    </TouchableWithoutFeedback>

                    <View className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                        
                        <View className="items-center mb-6">
                            <View className="w-14 h-14 bg-indigo-50 rounded-full items-center justify-center mb-2">
                                <Ionicons name="lock-closed" size={24} color="#4338ca" />
                            </View>
                            <Text className="text-xl font-bold text-gray-800">Change Password</Text>
                            <Text className="text-xs text-gray-400">Secure your account</Text>
                        </View>

                        <View className="space-y-4">
                            {/* OLD PASS */}
                            <View>
                                <Text className="text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Old Password</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-12">
                                    <TextInput 
                                        secureTextEntry={!showOld}
                                        value={passData.old}
                                        onChangeText={(t) => setPassData({...passData, old: t})}
                                        placeholder="Enter old password"
                                        className="flex-1 text-gray-800 text-sm h-full"
                                        style={{ outlineStyle: 'none' } as any}
                                    />
                                    <TouchableOpacity onPress={() => setShowOld(!showOld)} style={{ padding: 5 }}>
                                        <Ionicons name={showOld ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* NEW PASS */}
                            <View>
                                <Text className="text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">New Password</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-12">
                                    <TextInput 
                                        secureTextEntry={!showNew}
                                        value={passData.new}
                                        onChangeText={(t) => setPassData({...passData, new: t})}
                                        placeholder="Enter new password"
                                        className="flex-1 text-gray-800 text-sm h-full"
                                        style={{ outlineStyle: 'none' } as any}
                                    />
                                    <TouchableOpacity onPress={() => setShowNew(!showNew)} style={{ padding: 5 }}>
                                        <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* CONFIRM PASS */}
                            <View>
                                <Text className="text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Confirm Password</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-12 mb-4">
                                    <TextInput 
                                        secureTextEntry={!showConfirm}
                                        value={passData.confirm}
                                        onChangeText={(t) => setPassData({...passData, confirm: t})}
                                        placeholder="Confirm new password"
                                        className="flex-1 text-gray-800 text-sm h-full"
                                        style={{ outlineStyle: 'none' } as any}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={{ padding: 5 }}>
                                        <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 py-3 bg-gray-100 rounded-xl items-center">
                                <Text className="font-bold text-gray-600">Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                onPress={handleChangePassword} 
                                disabled={isLoading} 
                                activeOpacity={0.8}
                                className="flex-1 bg-indigo-600 rounded-xl items-center justify-center py-3"
                            >
                                {isLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="font-bold text-white">Update</Text>}
                            </TouchableOpacity>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
};

export default MyProfile;