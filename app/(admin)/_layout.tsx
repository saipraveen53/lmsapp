import { Ionicons } from '@expo/vector-icons';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useState } from 'react';
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
  View
} from 'react-native';
import api from '../(utils)/api';
import { useLms } from '../(utils)/LmsContext'; // Import useLms
import "../globals.css";

const logoImg = require('../../assets/images/anasol-logo.png');

// --- DRAWER CONTENT ---
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { logout } = useLms(); // Get logout function from Context

  const handleLogout = async () => {
    await logout(); // Calls API and clears correct token
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <LinearGradient colors={['#4338ca', '#e11d48']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="w-full p-6 pt-16 items-center justify-center mb-6">
          <View className="h-20 w-20 bg-white rounded-full items-center justify-center mb-3 shadow-lg">
             <Image source={logoImg} style={{ width: 45, height: 45, resizeMode: 'contain' }} />
          </View>
          <Text className="text-white text-xl font-bold tracking-wider">Anasol LMS</Text>
          <Text className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest opacity-90 mt-1">Admin Console</Text>
        </LinearGradient>
        <View className="px-2"><DrawerItemList {...props} /></View>
      </DrawerContentScrollView>
      <View className="p-4 border-t border-gray-100 pb-8">
        <DrawerItem 
            label="Sign Out" 
            labelStyle={{ color: '#e11d48', fontWeight: 'bold', marginLeft: -10 }} 
            icon={({ size }) => <Ionicons name="log-out-outline" size={size} color="#e11d48" />} 
            onPress={handleLogout} 
            style={{ borderRadius: 12, backgroundColor: '#fff1f2' }} 
        />
      </View>
    </View>
  );
};

// --- MAIN LAYOUT ---
export default function AdminLayout() {
  const router = useRouter();
  const { logout } = useLms(); // Get logout function from Context
  
  // State for Menus & Modals
  const [menuVisible, setMenuVisible] = useState(false); 
  const [modalVisible, setModalVisible] = useState(false); 
  
  // Password Form State
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Eye Toggle State
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 1. Handle Password Change API
  const handleChangePassword = async () => {
    // --- VALIDATION 1: Empty Fields ---
    if (!passData.old.trim() || !passData.new.trim() || !passData.confirm.trim()) {
        Alert.alert("Validation Error", "All fields are required.");
        return;
    }

    // --- VALIDATION 2: Mismatch ---
    if (passData.new !== passData.confirm) {
        Alert.alert("Validation Error", "New password and Confirm password do not match.");
        return;
    }
    
    setIsLoading(true);
    try {
        console.log("Sending API Request with Payload:", {
           oldPassword: passData.old, 
           newPassword: passData.new,
           confirmPassword: passData.confirm 
        });
        
        // --- ACTUAL API CALL (Updated Payload) ---
        const response = await api.post('/api/auth/change-password', { 
           oldPassword: passData.old, 
           newPassword: passData.new,
           confirmPassword: passData.confirm 
        });
        
        console.log("API Success:", response.data);
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

  const openPasswordModal = () => {
    setMenuVisible(false);
    setModalVisible(true);
    // Reset fields when opening
    setPassData({ old: '', new: '', confirm: '' });
    setShowOld(false); setShowNew(false); setShowConfirm(false);
  };

  return (
    <View style={{ flex: 1 }}>
      
      {/* DRAWER NAVIGATOR */}
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerBackground: () => (<LinearGradient colors={['#4338ca', '#e11d48']} style={{flex:1}} start={{x:0, y:0}} end={{x:1, y:0}} />),
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          drawerActiveTintColor: '#4338ca',
          drawerActiveBackgroundColor: '#e0e7ff',
          drawerInactiveTintColor: '#64748b',
          drawerLabelStyle: { marginLeft: -10, fontWeight: '600', fontSize: 15 },
          
          headerRight: () => (
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={{ marginRight: 15 }}>
               <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center border border-white/30">
                  <Ionicons name="person" size={18} color="white" />
               </View>
            </TouchableOpacity>
          ),
        }}
      >
        <Drawer.Screen name="Dashboard" options={{ drawerLabel: 'Dashboard', title: 'Dashboard', drawerIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
        <Drawer.Screen name="Courses" options={{ drawerLabel: 'Courses', title: 'Courses', drawerIcon: ({ color, size }) => <Ionicons name="library-outline" size={size} color={color} /> }} />
        <Drawer.Screen name="BulkQuizUpload" options={{ drawerItemStyle: { display: 'none' }, headerShown: false }} />
        <Drawer.Screen name="Students" options={{ drawerLabel: 'Students', title: 'Students', drawerIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      </Drawer>

      {/* --- 1. PROFILE DROPDOWN MENU --- */}
      {menuVisible && (
        <TouchableOpacity 
           activeOpacity={1} 
           onPress={() => setMenuVisible(false)} 
           style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 50 }}
        >
            <View className="absolute top-14 right-4 bg-white rounded-xl shadow-xl border border-gray-100 w-48 overflow-hidden py-2" style={{ elevation: 10 }}>
                <Text className="px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-100 mb-1">Account Options</Text>
                
                <TouchableOpacity onPress={openPasswordModal} className="flex-row items-center px-4 py-3 active:bg-gray-50">
                    <Ionicons name="key-outline" size={18} color="#4b5563" />
                    <Text className="ml-3 text-gray-700 font-medium">Change Password</Text>
                </TouchableOpacity>

                {/* LOGOUT BUTTON - Updated to use Context */}
                <TouchableOpacity 
                    onPress={() => { setMenuVisible(false); logout(); }} 
                    className="flex-row items-center px-4 py-3 active:bg-gray-50 border-t border-gray-50"
                >
                    <Ionicons name="log-out-outline" size={18} color="#e11d48" />
                    <Text className="ml-3 text-rose-600 font-medium">Logout</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      )}

      {/* --- 2. CHANGE PASSWORD MODAL --- */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
         <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-center items-center bg-black/60 px-4">
             <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                 <View className="absolute top-0 bottom-0 left-0 right-0" />
             </TouchableWithoutFeedback>

             <View className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                 
                 {/* Header */}
                 <View className="items-center mb-6">
                     <View className="w-14 h-14 bg-indigo-50 rounded-full items-center justify-center mb-2">
                         <Ionicons name="lock-closed" size={24} color="#4338ca" />
                     </View>
                     <Text className="text-xl font-bold text-gray-800">Change Password</Text>
                     <Text className="text-xs text-gray-400">Secure your admin account</Text>
                 </View>

                 {/* Inputs */}
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

                 {/* Buttons */}
                 <View className="flex-row gap-3">
                     <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 py-3 bg-gray-100 rounded-xl items-center">
                         <Text className="font-bold text-gray-600">Cancel</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity 
                        onPress={handleChangePassword} 
                        disabled={isLoading} 
                        activeOpacity={0.8}
                        className="flex-1"
                     >
                         <LinearGradient colors={['#4338ca', '#e11d48']} className="py-3 rounded-xl items-center">
                            {isLoading ? <ActivityIndicator color="white" size="small" /> : <Text className="font-bold text-white">Update</Text>}
                         </LinearGradient>
                     </TouchableOpacity>
                 </View>

             </View>
         </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}