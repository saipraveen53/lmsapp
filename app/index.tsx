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
import { useLms } from './(utils)/LmsContext';

const logoImg = require('../assets/images/anasol-logo.png');

export default function LoginScreen() {
  if (Platform.OS === 'web') {
    return <WebLogin />;
  } else {
    return <MobileLogin />;
  }
}

// ---------------- MOBILE LOGIN (Uses Alerts) ----------------
const MobileLogin = () => {
  const { login, isLoading } = useLms();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill all fields");
    
    const result = await login(email, password);
    if (!result.success) {
      Alert.alert("Login Failed", result.message || "Unknown Error");
    } else {
      Alert.alert("Success", "Login Successful!");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ height: '40%', overflow: 'hidden' }}>
        <LinearGradient
          colors={['#e11d48', '#4338ca', '#f97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 30 }}
        >
           <View style={{ backgroundColor: 'white', borderRadius: 60, padding: 15, elevation: 10 }}>
              <Image source={logoImg} style={{ width: 90, height: 90, resizeMode: 'contain' }} />
           </View>
           <Text style={{ fontSize: 30, fontWeight: '900', color: 'white', marginTop: 15, letterSpacing: 1 }}>
             ANASOL LMS
           </Text>
           <Text style={{ color: '#e0e7ff', fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 }}>
             Empowering students with top-notch technical training.
           </Text>
        </LinearGradient>
      </View>

      <View style={{ 
        flex: 1, backgroundColor: 'white', marginTop: -40, 
        borderTopLeftRadius: 30, borderTopRightRadius: 30, 
        paddingHorizontal: 25, paddingTop: 30
      }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 }}>Welcome Back!</Text>
          <Text style={{ color: '#64748b', marginBottom: 25, fontSize: 13 }}>Please login to continue.</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={18} color="#94a3b8" style={{ marginRight: 10 }} />
            <TextInput 
              style={styles.input} placeholder="Email Address" placeholderTextColor="#cbd5e1"
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color="#94a3b8" style={{ marginRight: 10 }} />
            <TextInput 
              style={styles.input} placeholder="Password" placeholderTextColor="#cbd5e1"
              value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
               <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link - Mobile */}
          <TouchableOpacity 
            style={{ alignSelf: 'flex-end', marginBottom: 20 }} 
            onPress={() => router.push('/(auth)/ForgotPassword')}
          >
            <Text style={{ color: '#4f46e5', fontWeight: '600', fontSize: 13 }}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} disabled={isLoading} activeOpacity={0.8}>
            <LinearGradient
              colors={['#e11d48', '#4338ca']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: 10, paddingVertical: 14, alignItems: 'center', shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 }}
            >
              {isLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>LOGIN</Text>}
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={{ marginTop: 'auto', paddingTop: 30, paddingBottom: 10 }}>
            <Text style={{ textAlign: 'center', color: '#94a3b8', fontSize: 10 }}>© 2025 Anasol Consultancy Services Pvt Ltd.</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// ---------------- WEB LOGIN (Inline Errors) ----------------
const WebLogin = () => {
  const { login, isLoading } = useLms();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  // Web specific error state
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage(''); // Clear previous errors
    if (!email || !password) {
      setErrorMessage("Please fill all fields.");
      return;
    }
    
    const result = await login(email, password);
    if (!result.success) {
      setErrorMessage(result.message || "Login failed.");
    }
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center items-center p-4">
      <View className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex-row overflow-hidden min-h-[550px]">
        <LinearGradient
          colors={['#e11d48', '#4338ca', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          className="w-1/2 p-10 justify-center items-center relative"
        >
          <View className="bg-white p-6 rounded-full shadow-2xl mb-6 items-center justify-center">
             <Image source={logoImg} style={{ width: 80, height: 80 }} resizeMode="contain" />
          </View>
          <Text className="text-4xl font-extrabold text-white tracking-wide uppercase text-center drop-shadow-md">Anasol LMS</Text>
          <Text className="text-indigo-100 text-sm font-medium tracking-wide text-center mt-2 max-w-xs leading-relaxed">Empowering students with top-notch technical training.</Text>
          <Text className="absolute bottom-6 text-indigo-200 text-[10px] font-medium tracking-wider opacity-80">© 2025 Anasol Consultancy Services Pvt Ltd.</Text>
        </LinearGradient>

        <View className="w-1/2 p-12 bg-white justify-center">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-800">Welcome Back!</Text>
            <Text className="text-gray-500 mt-2">Please login to access your dashboard.</Text>
          </View>
          <View className="space-y-6">
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2">Email Address</Text>
              <View className={`flex-row items-center border rounded-lg px-3 py-3 transition-all ${focusedInput === 'email' ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-gray-300 bg-gray-50'}`}>
                <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? '#4f46e5' : '#9CA3AF'} />
                <TextInput 
                  className="flex-1 ml-3 text-gray-800 text-base" placeholder="Enter your email"
                  value={email} onChangeText={setEmail}
                  onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)}
                  style={{ outlineStyle: 'none' } as any}
                />
              </View>
            </View>
            <View>
              <Text className="text-sm font-bold text-gray-700 mb-2">Password</Text>
              <View className={`flex-row items-center border rounded-lg px-3 py-3 transition-all ${focusedInput === 'password' ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-gray-300 bg-gray-50'}`}>
                <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#4f46e5' : '#9CA3AF'} />
                <TextInput 
                  className="flex-1 ml-3 text-gray-800 text-base" placeholder="••••••••"
                  value={password} onChangeText={setPassword} secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)}
                  style={{ outlineStyle: 'none' } as any}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link - Web */}
            <TouchableOpacity 
              style={{ alignSelf: 'flex-end' }}
              onPress={() => router.push('/(auth)/ForgotPassword')}
            >
              <Text className="text-indigo-600 font-bold text-sm">Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
              <LinearGradient colors={['#e11d48', '#4338ca']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="rounded-lg shadow-lg py-4 items-center">
                <Text className="text-white font-bold text-lg">{isLoading ? "LOGGING IN..." : "LOGIN NOW"}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* ERROR MESSAGE - Only for Web */}
            {errorMessage ? (
              <Text className="text-red-500 text-sm text-center mt-2 font-medium">{errorMessage}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9',
    borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10,
    marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0'
  },
  input: { flex: 1, color: '#334155', fontSize: 14 }
});