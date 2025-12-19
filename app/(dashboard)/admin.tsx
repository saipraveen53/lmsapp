import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLms } from '../(utils)/LmsContext';

const AdminDashboard = () => {
  const { user, logout } = useLms();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 p-6 pt-12 flex-row justify-between items-center shadow-lg">
        <View>
           <Text className="text-white font-bold text-xl">Admin Panel</Text>
           <Text className="text-blue-200 text-sm">Welcome, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} className="bg-red-500 px-4 py-2 rounded-lg">
           <Text className="text-white font-bold text-xs">LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
         {/* Post Class Card */}
         <View className="bg-white p-5 rounded-xl shadow-sm mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Post New Class</Text>
            
            <View className="h-12 bg-gray-50 border border-gray-200 rounded-lg justify-center px-3 mb-3">
               <Text className="text-gray-500">Java Full Stack</Text>
            </View>
            <View className="h-12 bg-gray-50 border border-gray-200 rounded-lg justify-center px-3 mb-3">
               <Text className="text-gray-400">Video Title...</Text>
            </View>
            
            <TouchableOpacity className="bg-blue-600 py-3 rounded-lg items-center">
               <Text className="text-white font-bold">Publish Class</Text>
            </TouchableOpacity>
         </View>

         {/* Student List (Converted Table to Cards) */}
         <Text className="text-lg font-bold text-gray-800 mb-2">Student Tracker</Text>
         <View className="bg-white p-4 rounded-xl shadow-sm flex-row justify-between items-center border-l-4 border-green-500">
             <View>
               <Text className="font-bold text-base">Suresh Kumar</Text>
               <Text className="text-gray-500 text-xs">Attendance: 26/30</Text>
             </View>
             <View className="bg-green-100 px-2 py-1 rounded">
               <Text className="text-green-700 text-xs font-bold">Eligible</Text>
             </View>
         </View>

      </ScrollView>
    </View>
  );
};

export default AdminDashboard;