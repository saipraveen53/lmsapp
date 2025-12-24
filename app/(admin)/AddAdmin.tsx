import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { rootApi } from '../(utils)/axiosInstance';

export default function AddAdmin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Password Visibility State
  const [showPassword, setShowPassword] = useState(false);
  
  // Focus State
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleCreateAdmin = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Backend expects 'username', so we send fullName as username
      const payload = {
        username: fullName.trim(), 
        email: email,
        password: password
      };

      const response = await rootApi.post('/api/auth/admin/create', payload);

      if (response.status === 200) {
        Alert.alert('Success', 'New Admin created successfully!');
        // Reset form
        setFullName('');
        setEmail('');
        setPassword('');
        router.push('/(admin)/Dashboard'); // Redirect to dashboard
      }
    } catch (error: any) {
      console.error('Create Admin Error:', error);
      const msg = error.response?.data?.message || 'Failed to create admin.';
      Alert.alert('Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper styles for inputs
  const getInputContainerStyle = (inputName: string) => {
    if (focusedInput === inputName) {
      return [styles.inputContainer, styles.inputContainerFocused];
    }
    return styles.inputContainer;
  };

  const getIconColor = (inputName: string) => {
    return focusedInput === inputName ? '#4338ca' : '#94a3b8';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Title Section (Optional: Since header has title, this acts as page heading) */}
        <View style={{ marginBottom: 20 }}>
           <Text style={styles.pageTitle}>Create New Admin</Text>
           <Text style={styles.pageSubtitle}>Enter details to grant administrative access</Text>
        </View>

        <View style={styles.card}>
          
          {/* Full Name Field */}
          <Text style={styles.label}>Full Name</Text>
          <View style={getInputContainerStyle('fullName')}>
            <Ionicons name="person-outline" size={20} color={getIconColor('fullName')} />
            <TextInput 
              style={styles.input} 
              placeholder="Enter Full Name"
              placeholderTextColor="#cbd5e1"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              onFocus={() => setFocusedInput('fullName')}
              onBlur={() => setFocusedInput(null)}
              {...({ style: { outlineStyle: 'none', flex: 1, marginLeft: 10, color: '#334155', fontSize: 15 } } as any)} 
            />
          </View>

          {/* Email Field */}
          <Text style={styles.label}>Email Address</Text>
          <View style={getInputContainerStyle('email')}>
            <Ionicons name="mail-outline" size={20} color={getIconColor('email')} />
            <TextInput 
              style={styles.input} 
              placeholder="admin@anasol.com"
              placeholderTextColor="#cbd5e1"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              {...({ style: { outlineStyle: 'none', flex: 1, marginLeft: 10, color: '#334155', fontSize: 15 } } as any)}
            />
          </View>

          {/* Password Field */}
          <Text style={styles.label}>Password</Text>
          <View style={getInputContainerStyle('password')}>
            <Ionicons name="lock-closed-outline" size={20} color={getIconColor('password')} />
            <TextInput 
              style={styles.input} 
              placeholder="Strong Password"
              placeholderTextColor="#cbd5e1"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              {...({ style: { outlineStyle: 'none', flex: 1, marginLeft: 10, color: '#334155', fontSize: 15 } } as any)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 5 }}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#94a3b8" 
                />
            </TouchableOpacity>
          </View>

          {/* Info Note */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#64748b" />
            <Text style={styles.note}>
               This admin will have full control to manage students, courses, and settings.
            </Text>
          </View>

          {/* Create Button */}
          <TouchableOpacity onPress={handleCreateAdmin} disabled={isLoading} activeOpacity={0.8} style={styles.submitBtnContainer}>
            <LinearGradient
              colors={['#e11d48', '#4338ca']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>CREATE ADMIN</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  content: { padding: 20 },
  
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  pageSubtitle: { fontSize: 13, color: '#64748b' },

  card: { backgroundColor: 'white', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 4 },

  // Input Styles
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8, marginTop: 18 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  inputContainerFocused: { borderColor: '#4338ca', backgroundColor: '#eef2ff', borderWidth: 1.5 },
  input: { flex: 1, marginLeft: 10, color: '#334155', fontSize: 14 },
  
  // Info Box
  infoBox: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, marginTop: 25, alignItems: 'center' },
  note: { color: '#64748b', fontSize: 12, marginLeft: 10, flex: 1, lineHeight: 18 },
  
  // Button
  submitBtnContainer: { marginTop: 25, shadowColor: '#4338ca', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  button: { borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
});