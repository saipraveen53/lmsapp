import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Image, Text, View } from 'react-native';
import "../globals.css";

const logoImg = require('../../assets/images/anasol-logo.png');

const CustomDrawerContent = (props: DrawerContentComponentProps): React.ReactElement => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/');
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View className="bg-sky-600 w-full p-6 pt-16 items-center justify-center mb-6">
          <View className="h-24 w-24 bg-white rounded-full items-center justify-center mb-3 shadow-md border-4 border-sky-300">
            <Image source={logoImg} style={{ width: 56, height: 56, resizeMode: 'contain' }} />
          </View>
          <Text className="text-white text-2xl font-bold text-center">Anasol LMS</Text>
          <Text className="text-sky-100 text-sm font-medium text-center opacity-90">Admin Portal</Text>
        </View>

        <View className="px-2">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View className="p-4 border-t border-gray-200 pb-8">
        <DrawerItem
          label="Logout"
          labelStyle={{ color: '#dc2626', fontWeight: 'bold', marginLeft: -10, fontSize: 15 }}
          icon={({ color, size }: { color: string; size?: number }) => (
            <Ionicons name="log-out-outline" size={size ?? 24} color="#dc2626" />
          )}
          onPress={handleLogout}
          style={{ borderRadius: 12, backgroundColor: '#fef2f2' }}
        />
        <Text className="text-gray-400 text-xs text-center mt-4">App Version 1.0.0</Text>
      </View>
    </View>
  );
};

const SameDrawerLayout = (): React.ReactElement => {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#0ea5e9' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveTintColor: '#0ea5e9',
        drawerActiveBackgroundColor: '#eff6ff',
        drawerInactiveTintColor: '#374151',
        drawerLabelStyle: { marginLeft: -10, fontWeight: '600', fontSize: 15 },
        drawerType: 'front',
        drawerStyle: { width: 280 },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Overview',
          drawerIcon: ({ color, size }: { color: string; size?: number }) => (
            <Ionicons name="grid-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Courses"
        options={{
          drawerLabel: 'Courses',
          title: 'Courses',
          drawerIcon: ({ color, size }: { color: string; size?: number }) => (
            <Ionicons name="book-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Students"
        options={{
          drawerLabel: 'Students',
          title: 'Students',
          drawerIcon: ({ color, size }: { color: string; size?: number }) => (
            <Ionicons name="people-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Drawer>
  );
};

export default SameDrawerLayout;