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
import api from '../(utils)/api';

const logoImg = require('../../assets/images/anasol-logo.png');

export default function ForgotPasswordScreen() {
  if (Platform.OS === 'web') {
    return <ForgotPasswordWeb />;
  } else {
    return <ForgotPasswordMobile />;
  }
}

const useForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Data State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Backend Token State
  const [otpToken, setOtpToken] = useState(''); 

  // Password Visibility
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Helper for Alerts
  const alertUser = (title: string, msg: string) => {
    if (Platform.OS === 'web') alert(msg);
    else Alert.alert(title, msg);
  };

  // STEP 1: Send OTP to Email
  const handleSendOtp = async () => {
    if (!email) return alertUser("Error", "Please enter your registered email.");
    
    setIsLoading(true);
    try {
      const res = await api.put('/api/auth/forgot-password', null, {
        params: { email: email }
      });
      
      const token = res.data.otpToken; 
      if (token) {
        setOtpToken(token);
        alertUser("Success", `OTP sent to ${email}`);
        setStep(2); 
      } else {
        if (res.data.token) setOtpToken(res.data.token);
        setStep(2);
      }
    } catch (error: any) {
      console.log("OTP Send Error:", error);
      alertUser("Failed", error.response?.data?.message || "Could not send OTP. Check email.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Enter OTP 
  const handleVerifyOtp = async () => {
    if (!otp) return alertUser("Error", "Please enter the OTP.");
    setStep(3); 
  };

  // STEP 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) return alertUser("Error", "Please fill all fields.");
    if (newPassword !== confirmPassword) return alertUser("Error", "Passwords do not match.");
    
    setIsLoading(true);
    try {
      await api.post('/api/auth/reset-password', 
        {
          otp: otp,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        },
        {
          headers: { 'X_OTP_Token': otpToken }
        }
      );
      
      alertUser("Success", "Password Reset Successful! Please Login.");
      router.replace('/'); 
    } catch (error: any) {
      console.log("Reset Error:", error.response?.data);
      const msg = error.response?.data?.message || "Password reset failed.";
      alertUser("Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    step, setStep, isLoading,
    email, setEmail,
    otp, setOtp,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    showNewPass, setShowNewPass,
    showConfirmPass, setShowConfirmPass,
    handleSendOtp, handleVerifyOtp, handleResetPassword, router
  };
};

const ForgotPasswordMobile = () => {
  const logic = useForgotPassword();

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={{ height: '30%', overflow: 'hidden' }}>
        <LinearGradient
          colors={['#e11d48', '#4338ca', '#f97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 20 }}
        >
           <View style={{ backgroundColor: 'white', borderRadius: 40, padding: 10, elevation: 5 }}>
              <Image source={logoImg} style={{ width: 50, height: 50, resizeMode: 'contain' }} />
           </View>
           <Text style={{ fontSize: 22, fontWeight: '800', color: 'white', marginTop: 10, letterSpacing: 1 }}>
             FORGOT PASSWORD
           </Text>
           <Text style={{ color: '#e0e7ff', fontSize: 12 }}>Recover your account access</Text>
        </LinearGradient>
      </View>

      {/* Body */}
      <View style={styles.bodyContainer}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* STEP 1: EMAIL */}
          {logic.step === 1 && (
            <>
              <Text style={styles.title}>Enter Email</Text>
              <Text style={styles.subtitle}>We will send an OTP to your registered email.</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <TextInput style={styles.input} placeholder="example@email.com" placeholderTextColor="#cbd5e1"
                  keyboardType="email-address" autoCapitalize="none"
                  value={logic.email} onChangeText={logic.setEmail} 
                />
              </View>
              <ActionButton title="SEND OTP" onPress={logic.handleSendOtp} isLoading={logic.isLoading} />
            </>
          )}

          {/* STEP 2: OTP */}
          {logic.step === 2 && (
            <>
              <Text style={styles.title}>Enter OTP</Text>
              <Text style={styles.subtitle}>Enter the code sent to {logic.email}</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>OTP CODE</Text>
                <TextInput style={styles.input} placeholder="Enter OTP" placeholderTextColor="#cbd5e1"
                  keyboardType="number-pad"
                  value={logic.otp} onChangeText={logic.setOtp} 
                />
              </View>
              <ActionButton title="VERIFY OTP" onPress={logic.handleVerifyOtp} isLoading={logic.isLoading} />
              <TouchableOpacity onPress={() => logic.setStep(1)} style={{marginTop: 15, alignSelf: 'center'}}>
                 <Text style={{color: '#64748b'}}>Change Email</Text>
              </TouchableOpacity>
            </>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {logic.step === 3 && (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Create a strong new password.</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NEW PASSWORD</Text>
                <View style={[styles.input, styles.passwordContainer]}>
                  <TextInput style={{ flex: 1, color: '#334155' }} placeholder="New Password" placeholderTextColor="#cbd5e1"
                    secureTextEntry={!logic.showNewPass} value={logic.newPassword} onChangeText={logic.setNewPassword} 
                  />
                  <TouchableOpacity onPress={() => logic.setShowNewPass(!logic.showNewPass)}>
                    <Ionicons name={logic.showNewPass ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CONFIRM PASSWORD</Text>
                <View style={[styles.input, styles.passwordContainer]}>
                  <TextInput style={{ flex: 1, color: '#334155' }} placeholder="Confirm Password" placeholderTextColor="#cbd5e1"
                    secureTextEntry={!logic.showConfirmPass} value={logic.confirmPassword} onChangeText={logic.setConfirmPassword} 
                  />
                  <TouchableOpacity onPress={() => logic.setShowConfirmPass(!logic.showConfirmPass)}>
                    <Ionicons name={logic.showConfirmPass ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <ActionButton title="RESET PASSWORD" onPress={logic.handleResetPassword} isLoading={logic.isLoading} />
            </>
          )}

          {/* Back to Login */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 30 }}>
            <TouchableOpacity onPress={() => logic.router.replace('/')}>
              <Text style={{ color: '#4f46e5', fontWeight: 'bold', fontSize: 14 }}>Back to Login</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </View>
    </View>
  );
};

const ForgotPasswordWeb = () => {
  const logic = useForgotPassword();

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: '#f3f4f6' }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
    >
      <View style={styles.webCard}>
        <LinearGradient colors={['#e11d48', '#4338ca', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 8, width: '100%' }} />

        <View style={{ padding: 40 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
             <Image source={logoImg} style={{ width: 60, height: 60, resizeMode: 'contain', marginBottom: 10 }} />
             <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b' }}>Forgot Password</Text>
             <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 5 }}>
               {logic.step === 1 ? "Enter your email to receive OTP" : logic.step === 2 ? "Enter the OTP sent to your email" : "Set your new password"}
             </Text>
          </View>

          {/* STEP 1 */}
          {logic.step === 1 && (
            <View style={{ marginBottom: 20 }}>
               <Text style={styles.webLabel}>Email Address</Text>
               <TextInput 
                 style={styles.webInput} 
                 placeholder="example@email.com" 
                 value={logic.email} 
                 onChangeText={logic.setEmail} 
                 // @ts-ignore
                 style={[{ outlineStyle: 'none' } as any, styles.webInput]}
               />
               <WebButton title="SEND OTP" onPress={logic.handleSendOtp} isLoading={logic.isLoading} />
            </View>
          )}

          {/* STEP 2 */}
          {logic.step === 2 && (
            <View style={{ marginBottom: 20 }}>
               <Text style={styles.webLabel}>OTP Code</Text>
               <TextInput 
                 style={styles.webInput} 
                 placeholder="Enter OTP" 
                 value={logic.otp} 
                 onChangeText={logic.setOtp} 
                 // @ts-ignore
                 style={[{ outlineStyle: 'none' } as any, styles.webInput]}
               />
               <WebButton title="VERIFY OTP" onPress={logic.handleVerifyOtp} isLoading={logic.isLoading} />
               <TouchableOpacity onPress={() => logic.setStep(1)} style={{ marginTop: 10, alignSelf: 'center' }}>
                 <Text style={{ color: '#6366f1', fontSize: 12 }}>Wrong Email?</Text>
               </TouchableOpacity>
            </View>
          )}

          {/* STEP 3 */}
          {logic.step === 3 && (
            <View style={{ marginBottom: 20 }}>
               <Text style={styles.webLabel}>New Password</Text>
               <View style={styles.webInputContainer}>
                 <TextInput 
                   secureTextEntry={!logic.showNewPass}
                   placeholder="New Password"
                   value={logic.newPassword}
                   onChangeText={logic.setNewPassword}
                   // @ts-ignore
                   style={[{ outlineStyle: 'none', flex: 1 } as any]}
                 />
                 <TouchableOpacity onPress={() => logic.setShowNewPass(!logic.showNewPass)}>
                   <Ionicons name={logic.showNewPass ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                 </TouchableOpacity>
               </View>

               <Text style={styles.webLabel}>Confirm Password</Text>
               <View style={[styles.webInputContainer, { marginBottom: 20 }]}>
                 <TextInput 
                   secureTextEntry={!logic.showConfirmPass}
                   placeholder="Confirm Password"
                   value={logic.confirmPassword}
                   onChangeText={logic.setConfirmPassword}
                   // @ts-ignore
                   style={[{ outlineStyle: 'none', flex: 1 } as any]}
                 />
                 <TouchableOpacity onPress={() => logic.setShowConfirmPass(!logic.showConfirmPass)}>
                   <Ionicons name={logic.showConfirmPass ? "eye-off-outline" : "eye-outline"} size={20} color="#94a3b8" />
                 </TouchableOpacity>
               </View>

               <WebButton title="RESET PASSWORD" onPress={logic.handleResetPassword} isLoading={logic.isLoading} />
            </View>
          )}

          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <TouchableOpacity onPress={() => logic.router.replace('/')}>
               <Text style={{ color: '#e11d48', fontWeight: 'bold' }}>Back to Login</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </ScrollView>
  );
};


const ActionButton = ({ title, onPress, isLoading }: any) => (
  <TouchableOpacity onPress={onPress} disabled={isLoading} activeOpacity={0.8}>
    <LinearGradient colors={['#e11d48', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
      {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{title}</Text>}
    </LinearGradient>
  </TouchableOpacity>
);

const WebButton = ({ title, onPress, isLoading }: any) => (
  <TouchableOpacity onPress={onPress} disabled={isLoading} style={styles.webButton}>
     {isLoading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>{title}</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
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
  
  // Web Specific
  webCard: {
    backgroundColor: 'white', borderRadius: 15, shadowColor: '#000', 
    shadowOpacity: 0.1, shadowRadius: 10, width: '100%', maxWidth: 450, overflow: 'hidden'
  },
  webLabel: { fontSize: 12, fontWeight: 'bold', color: '#475569', marginBottom: 5 },
  webInput: { 
    width: '100%', padding: 12, borderWidth: 1, borderColor: '#e2e8f0', 
    borderRadius: 8, marginBottom: 15, fontSize: 14 
  },
  webInputContainer: {
    width: '100%', padding: 12, borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 8, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  webButton: {
    backgroundColor: '#e11d48', padding: 12, borderRadius: 8, alignItems: 'center', width: '100%'
  }
});