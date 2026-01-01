import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
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
import api from '../(utils)/api';

const logoImg = require('../../assets/images/anasol-logo.png');

export default function ChangePassword() {
  if (Platform.OS === 'web') {
    return <ChangePasswordWeb />;
  } else {
    return <ChangePasswordMobile />;
  }
}

// ---------------- SHARED LOGIC ----------------
const useChangePassword = () => {
  const router = useRouter();
  const { logout } = useLms();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // DISABLE BACK BUTTON (Android)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const onBackPress = () => {
      Alert.alert("Action Required", "You must change your password to continue.");
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, []);

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      const msg = "Please fill all fields";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }
    if (newPassword !== confirmPassword) {
      const msg = "Passwords do not match";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }
    if (newPassword.length < 8) {
      const msg = "Password must be at least 8 characters long";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/auth/change-password', {
         oldPassword: "FIRST_TIME_LOGIN_DUMMY_PASS", 
         newPassword: newPassword,
         confirmPassword: confirmPassword
      });

      const successMsg = "Password Updated Successfully! Please Login again.";

      // --- [FIX] WEB REDIRECT LOGIC ---
      if (Platform.OS === 'web') {
          window.alert(successMsg);
          logout(); // Directly call logout for web
      } else {
          Alert.alert("Success", successMsg, [
            { text: "OK", onPress: () => logout() }
          ]);
      }

    } catch (error: any) {
      console.log("Change Password Error:", error);
      const msg = error.response?.data?.message || 'Failed to update password';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    isLoading,
    showPassword, setShowPassword,
    showConfirm, setShowConfirm,
    handleChangePassword
  };
};

// ---------------- MOBILE UI (Matches ForgotPassword) ----------------
const ChangePasswordMobile = () => {
  const logic = useChangePassword();

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header Gradient */}
      <View style={{ height: '30%', overflow: 'hidden' }}>
        <LinearGradient
          colors={['#e11d48', '#4338ca', '#f97316']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 }}
        >
           <View style={{ backgroundColor: 'white', borderRadius: 40, padding: 10, elevation: 5 }}>
              <Image source={logoImg} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
           </View>
           <Text style={{ fontSize: 22, fontWeight: '800', color: 'white', marginTop: 10, letterSpacing: 1 }}>
             SETUP PASSWORD
           </Text>
           <Text style={{ color: '#e0e7ff', fontSize: 12 }}>Secure your account to proceed</Text>
        </LinearGradient>
      </View>

      {/* Body Content */}
      <View style={styles.bodyContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>Create a strong password for your first login.</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>NEW PASSWORD</Text>
            <View style={[styles.input, styles.passwordContainer]}>
              <TextInput style={{ flex: 1, color: '#334155' }} placeholder="Enter new password" placeholderTextColor="#cbd5e1"
                secureTextEntry={!logic.showPassword} value={logic.newPassword} onChangeText={logic.setNewPassword} 
              />
              <TouchableOpacity onPress={() => logic.setShowPassword(!logic.showPassword)}>
                <Ionicons name={logic.showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <View style={[styles.input, styles.passwordContainer]}>
              <TextInput style={{ flex: 1, color: '#334155' }} placeholder="Confirm new password" placeholderTextColor="#cbd5e1"
                secureTextEntry={!logic.showConfirm} value={logic.confirmPassword} onChangeText={logic.setConfirmPassword} 
              />
              <TouchableOpacity onPress={() => logic.setShowConfirm(!logic.showConfirm)}>
                <Ionicons name={logic.showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={{color: '#94a3b8', fontSize: 11, marginBottom: 25}}>
            • Minimum 8 characters{"\n"}
            • Must contain uppercase, lowercase & number
          </Text>

          <TouchableOpacity onPress={logic.handleChangePassword} disabled={logic.isLoading} activeOpacity={0.8}>
            <LinearGradient colors={['#e11d48', '#4338ca']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
              {logic.isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>UPDATE PASSWORD</Text>}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
};

// ---------------- WEB UI (Matches ForgotPassword Web) ----------------
const ChangePasswordWeb = () => {
  const logic = useChangePassword();

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f3f4f6' }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
    >
      <View style={styles.webCard}>
        <LinearGradient colors={['#e11d48', '#4338ca', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 8, width: '100%' }} />

        <View style={{ padding: 40, alignItems: 'center' }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
             <Image source={logoImg} style={{ width: 60, height: 60, resizeMode: 'contain', marginBottom: 10 }} />
             <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b' }}>Setup New Password</Text>
             <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 5 }}>
               For security, please update your password before proceeding.
             </Text>
          </View>

          <View style={{ width: '100%' }}>
             <Text style={styles.webLabel}>New Password</Text>
             <View style={styles.webInputContainer}>
               <TextInput 
                 secureTextEntry={!logic.showPassword}
                 placeholder="Enter new password"
                 value={logic.newPassword}
                 onChangeText={logic.setNewPassword}
                 style={[{ outlineStyle: 'none', flex: 1, fontSize: 14 } as any]}
               />
               <TouchableOpacity onPress={() => logic.setShowPassword(!logic.showPassword)}>
                 <Ionicons name={logic.showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
               </TouchableOpacity>
             </View>

             <Text style={styles.webLabel}>Confirm Password</Text>
             <View style={styles.webInputContainer}>
               <TextInput 
                 secureTextEntry={!logic.showConfirm}
                 placeholder="Confirm new password"
                 value={logic.confirmPassword}
                 onChangeText={logic.setConfirmPassword}
                 style={[{ outlineStyle: 'none', flex: 1, fontSize: 14 } as any]}
               />
               <TouchableOpacity onPress={() => logic.setShowConfirm(!logic.showConfirm)}>
                 <Ionicons name={logic.showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
               </TouchableOpacity>
             </View>

             <TouchableOpacity onPress={logic.handleChangePassword} disabled={logic.isLoading} style={styles.webButton}>
                {logic.isLoading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>UPDATE PASSWORD</Text>
                )}
             </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Mobile Styles
  bodyContainer: {
    flex: 1, backgroundColor: 'white', marginTop: -30,
    borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 25, paddingTop: 30
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  subtitle: { color: '#64748b', marginBottom: 25, fontSize: 13 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: 5, marginLeft: 2 },
  input: {
    backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12,
    borderWidth: 1, borderColor: '#e2e8f0', color: '#334155', fontSize: 14,
  },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 0, height: 50 },
  button: { borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 10, elevation: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },

  // Web Styles
  webCard: {
    backgroundColor: 'white', borderRadius: 15, shadowColor: '#000', 
    shadowOpacity: 0.1, shadowRadius: 10, width: '100%', maxWidth: 450, overflow: 'hidden'
  },
  webLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569', marginBottom: 5 },
  webInputContainer: {
    width: '100%', padding: 12, borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 8, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  webButton: {
    backgroundColor: '#e11d48', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%', marginTop: 10
  }
});