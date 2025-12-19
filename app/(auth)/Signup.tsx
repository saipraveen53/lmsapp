import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useLms } from '../(utils)/LmsContext';

const logoImg = require('../../assets/images/anasol-logo.png');

export default function SignupScreen() {
  if (Platform.OS === 'web') {
    return <WebRegister />;
  } else {
    return <MobileRegister />;
  }
}

// ---------------- MOBILE REGISTER (Uses Alerts) ----------------
const MobileRegister = () => {
  const { register, isLoading } = useLms();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', phoneNumber: '',
    panNumber: '', collegeName: '', collegeRollNumber: '', passoutYear: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (Object.values(formData).some(val => val === '')) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }
    const result = await register(formData);
    
    if (result.success) {
      Alert.alert("Success", result.message, [{ text: 'OK', onPress: () => router.back() }]);
    } else {
      Alert.alert("Registration Failed", result.message || "Unknown error");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ height: '25%', overflow: 'hidden' }}>
        <LinearGradient
          colors={['#e11d48', '#4338ca', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 }}
        >
           <View style={{ backgroundColor: 'white', borderRadius: 40, padding: 8, elevation: 5 }}>
              <Image source={logoImg} style={{ width: 45, height: 45, resizeMode: 'contain' }} />
           </View>
           <Text style={{ fontSize: 20, fontWeight: '800', color: 'white', marginTop: 10, letterSpacing: 1 }}>CREATE ACCOUNT</Text>
           <Text style={{ color: '#e0e7ff', fontSize: 11 }}>Join Anasol LMS Today</Text>
        </LinearGradient>
      </View>

      <View style={{ 
        flex: 1, backgroundColor: 'white', marginTop: -25, 
        borderTopLeftRadius: 30, borderTopRightRadius: 30, 
        paddingHorizontal: 25, paddingTop: 30
      }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.inputGroup}><Text style={styles.label}>FULL NAME</Text><TextInput style={styles.input} placeholder="Enter full name" placeholderTextColor="#cbd5e1" onChangeText={(t) => setFormData({...formData, fullName: t})} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>USERNAME</Text><TextInput style={styles.input} placeholder="Choose a username" placeholderTextColor="#cbd5e1" onChangeText={(t) => setFormData({...formData, username: t})} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>EMAIL</Text><TextInput style={styles.input} placeholder="example@email.com" placeholderTextColor="#cbd5e1" keyboardType="email-address" autoCapitalize="none" onChangeText={(t) => setFormData({...formData, email: t})} /></View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 0, height: 50 }]}>
              <TextInput style={{ flex: 1, height: '100%', color: '#334155' }} placeholder="Create password" placeholderTextColor="#cbd5e1" secureTextEntry={!showPassword} onChangeText={(t) => setFormData({...formData, password: t})} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" /></TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
             <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>PHONE NO</Text><TextInput style={styles.input} placeholder="9876543210" placeholderTextColor="#cbd5e1" keyboardType="phone-pad" maxLength={10} onChangeText={(t) => setFormData({...formData, phoneNumber: t})} /></View>
             <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>PAN NUMBER</Text><TextInput style={styles.input} placeholder="ABCDE1234F" placeholderTextColor="#cbd5e1" autoCapitalize="characters" maxLength={10} onChangeText={(t) => setFormData({...formData, panNumber: t})} /></View>
          </View>

          <View style={styles.inputGroup}><Text style={styles.label}>COLLEGE NAME</Text><TextInput style={styles.input} placeholder="Enter College Name" placeholderTextColor="#cbd5e1" onChangeText={(t) => setFormData({...formData, collegeName: t})} /></View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>ROLL NO / ID</Text><TextInput style={styles.input} placeholder="College ID" placeholderTextColor="#cbd5e1" onChangeText={(t) => setFormData({...formData, collegeRollNumber: t})} /></View>
            <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.label}>PASSOUT YEAR</Text><TextInput style={styles.input} placeholder="Ex: 2024" placeholderTextColor="#cbd5e1" keyboardType="numeric" maxLength={4} onChangeText={(t) => setFormData({...formData, passoutYear: t})} /></View>
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={isLoading} activeOpacity={0.8}>
            <LinearGradient colors={['#e11d48', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
              {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>REGISTER NOW</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Already registered? </Text>
            <TouchableOpacity onPress={() => router.back()}><Text style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: 13 }}>Login now</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// ---------------- WEB REGISTER (Inline Errors) ----------------
const WebRegister = () => {
  const { register, isLoading } = useLms();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', phoneNumber: '',
    panNumber: '', collegeName: '', collegeRollNumber: '', passoutYear: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    if (Object.values(formData).some(val => val === '')) {
      setErrorMessage("Please fill all required fields.");
      return;
    }
    
    const result = await register(formData);
    if (result.success) {
      alert(result.message); // Success alert is okay on web, or redirect immediately
      router.push('/');
    } else {
      setErrorMessage(result.message || "Registration Failed");
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f3f4f6' }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
      showsVerticalScrollIndicator={true}
    >
      <View className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden relative my-5">
        <LinearGradient colors={['#e11d48', '#4338ca', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 10, width: '100%' }} />
        <View className="p-8 md:p-10">
            <View className="items-center mb-8">
                <Image source={logoImg} style={{ width: 60, height: 60, resizeMode: 'contain', marginBottom: 8 }} />
                <Text className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Create Student Account</Text>
                <Text className="text-gray-500 text-sm mt-1">Join Anasol LMS today.</Text>
            </View>

            <View className="flex-row flex-wrap -mx-3">
                <View className="w-1/2 px-3 mb-4"><Text className="text-xs font-bold text-gray-600 uppercase mb-1">Full Name</Text><TextInput className="w-full p-3 border border-gray-300 rounded-lg outline-none" placeholder="Enter full name" onChangeText={(t) => setFormData({...formData, fullName: t})} style={{ outlineStyle: 'none' } as any} /></View>
                <View className="w-1/2 px-3 mb-4"><Text className="text-xs font-bold text-gray-600 uppercase mb-1">Username</Text><TextInput className="w-full p-3 border border-gray-300 rounded-lg outline-none" placeholder="Choose a username" onChangeText={(t) => setFormData({...formData, username: t})} style={{ outlineStyle: 'none' } as any} /></View>
                <View className="w-1/2 px-3 mb-4"><Text className="text-xs font-bold text-gray-600 uppercase mb-1">Email</Text><TextInput className="w-full p-3 border border-gray-300 rounded-lg outline-none" placeholder="example@email.com" onChangeText={(t) => setFormData({...formData, email: t})} style={{ outlineStyle: 'none' } as any} /></View>
                <View className="w-1/2 px-3 mb-4"><Text className="text-xs font-bold text-gray-600 uppercase mb-1">Phone Number</Text><TextInput className="w-full p-3 border border-gray-300 rounded-lg outline-none" placeholder="9876543210" maxLength={10} onChangeText={(t) => setFormData({...formData, phoneNumber: t})} style={{ outlineStyle: 'none' } as any} /></View>
                
                <View className="w-1/2 px-3 mb-4">
                    <Text className="text-xs font-bold text-gray-600 uppercase mb-1">Password</Text>
                    <View className="relative">
                      <TextInput className="w-full p-3 border border-gray-300 rounded-lg outline-none pr-10" placeholder="Create password" secureTextEntry={!showPassword} onChangeText={(t) => setFormData({...formData, password: t})} style={{ outlineStyle: 'none' } as any} />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: 12 }}><Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" /></TouchableOpacity>
                    </View>
                </View>

                <View className="w-1/2 px-3 mb-4"><Text className="text-xs font-bold text-gray-600 uppercase mb-1">PAN Number</Text><TextInput className="w-full p-3 border border-gray-300 rounded-lg outline-none" placeholder="ABCDE1234F" autoCapitalize="characters" maxLength={10} onChangeText={(t) => setFormData({...formData, panNumber: t})} style={{ outlineStyle: 'none' } as any} /></View>
                <View className="w-full px-3 mb-4"><Text className="text-xs font-bold text-gray-600 uppercase mb-1">College Name</Text><TextInput className="w-full p-3 border border-gray-300 rounded-lg outline-none" placeholder="Enter College Name" onChangeText={(t) => setFormData({...formData, collegeName: t})} style={{ outlineStyle: 'none' } as any} /></View>
                <View className="w-1/2 px-3 mb-4"><Text className="text-xs font-bold text-gray-600 uppercase mb-1">Roll No / ID</Text><TextInput className="w-full p-3 border border-gray-300 rounded-lg outline-none" placeholder="College ID" onChangeText={(t) => setFormData({...formData, collegeRollNumber: t})} style={{ outlineStyle: 'none' } as any} /></View>
                <View className="w-1/2 px-3 mb-4"><Text className="text-xs font-bold text-gray-600 uppercase mb-1">Passout Year</Text><TextInput className="w-full p-3 border border-gray-300 rounded-lg outline-none" placeholder="Ex: 2024" maxLength={4} onChangeText={(t) => setFormData({...formData, passoutYear: t})} style={{ outlineStyle: 'none' } as any} /></View>

                <View className="w-full px-3 mt-4">
                    <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
                        <LinearGradient colors={['#e11d48', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="w-full p-4 rounded-lg items-center shadow-lg hover:-translate-y-1 transition-all">
                             <Text className="text-white font-bold text-lg">REGISTER NOW</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    
                    {/* INLINE ERROR MESSAGE - Only for Web */}
                    {errorMessage ? (
                        <Text className="text-red-500 text-sm text-center mt-3 font-medium">{errorMessage}</Text>
                    ) : null}
                </View>
            </View>

            <View className="mt-6 flex-row justify-center">
                <Text className="text-sm text-gray-600">Already registered? </Text>
                <TouchableOpacity onPress={() => router.push('/')}><Text className="text-indigo-700 font-bold ml-1 underline">Login now</Text></TouchableOpacity>
            </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 5, marginLeft: 2 },
  input: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#e2e8f0', color: '#334155', fontSize: 14 },
  button: { borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 20, shadowColor: '#f97316', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }
});