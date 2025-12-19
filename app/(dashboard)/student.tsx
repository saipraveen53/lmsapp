import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useLms } from '../(utils)/LmsContext';

const StudentDashboard = () => {
  const { user, logout } = useLms();
  const attendance = user?.attendance || 0;
  const canTakeTest = attendance >= 25;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-orange-500 p-6 pt-12 flex-row justify-between items-center shadow-lg">
        <View>
           <Text className="text-white font-bold text-xl">My Dashboard</Text>
           <Text className="text-orange-100 text-sm">{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} className="bg-white px-4 py-2 rounded-lg">
           <Text className="text-orange-600 font-bold text-xs">LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4 space-y-4">
        
        {/* Stats Grid */}
        <View className="flex-row space-x-4">
           {/* Attendance */}
           <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
              <Text className="text-gray-400 text-xs font-bold uppercase">Attendance</Text>
              <Text className="text-2xl font-bold text-gray-800">{attendance} <Text className="text-sm text-gray-400">/ 30</Text></Text>
           </View>
           
           {/* Quiz */}
           <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500">
              <Text className="text-gray-400 text-xs font-bold uppercase">Next Quiz</Text>
              <Text className="text-lg font-bold text-gray-800">Class 21</Text>
           </View>
        </View>

        {/* Grand Test Status */}
        <View className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${canTakeTest ? 'border-green-500' : 'border-red-500'}`}>
           <Text className="text-gray-500 text-xs font-bold uppercase">Grand Test Eligibility</Text>
           <Text className="text-lg font-medium mt-1">
             {canTakeTest ? "You are eligible for the Grand Test!" : "Need 25+ Attendance to unlock."}
           </Text>
           <TouchableOpacity 
             disabled={!canTakeTest}
             className={`mt-3 py-3 rounded-lg items-center ${canTakeTest ? 'bg-green-500' : 'bg-gray-300'}`}
           >
              <Text className="text-white font-bold">START TEST</Text>
           </TouchableOpacity>
        </View>

        {/* Video Player Placeholder */}
        <View className="bg-black h-48 rounded-xl items-center justify-center mt-4">
           <Text className="text-white font-medium">Video Player Component</Text>
        </View>

      </ScrollView>
    </View>
  );
};

export default StudentDashboard;