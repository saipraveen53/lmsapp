import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { rootApi } from '../(utils)/axiosInstance';

export default function BulkStudentUpload() {
  const router = useRouter();
  
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- 1. CLEAR FILE FUNCTION ---
  const clearFile = () => {
    setStudents([]);
    setFileName(null);
    setSuccessMsg(null);
  };

  // --- 2. FILE PICKER ---
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', 'text/comma-separated-values', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      
      const file = result.assets[0];
      setFileName(file.name);
      setIsLoading(true);
      setSuccessMsg(null); // Clear previous success msg

      // Read File content
      const response = await fetch(file.uri);
      const content = await response.text();
      
      parseCSV(content);

    } catch (err: any) {
      console.log('File Error:', err);
      Alert.alert('Error', `Failed to read file: ${err.message}`);
      setIsLoading(false);
    }
  };

  // --- 3. CSV PARSER ---
  const parseCSV = (csvText: string) => {
    try {
      const rows = csvText.split(/\r\n|\n/); // Handle both Windows & Mac newlines
      const parsedStudents: any[] = [];
      
      rows.forEach((row) => {
        if (!row.trim()) return; // Skip empty lines
        
        const cols = row.split(','); 
        
        // Ensure at least Name and Email exist
        if (cols.length >= 2) { 
          const student = {
            fullName: cols[0]?.trim() || "",
            email: cols[1]?.trim() || "",
            phoneNumber: cols[2]?.trim() || "",
            panNumber: cols[3]?.trim() || "",
            collegeName: cols[4]?.trim() || "",
            collegeRollNumber: cols[5]?.trim() || "",
            passoutYear: parseInt(cols[6]?.trim()) || new Date().getFullYear(),
          };
          
          if (student.email) {
             parsedStudents.push(student);
          }
        }
      });
      
      if (parsedStudents.length === 0) {
          Alert.alert('Error', 'No valid student data found in CSV.');
          setFileName(null);
      } else {
          setStudents(parsedStudents);
      }
    } catch (e) {
      Alert.alert('Error', 'Invalid CSV Format.');
      setFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. UPLOAD LOGIC ---
  const handleUpload = async () => {
    if (students.length === 0) return;

    setIsLoading(true);
    try {
        // Backend takes time to send emails, so timeout is set to 2 mins
        await rootApi.post('/api/auth/students/bulk', students, {
            timeout: 120000, 
        }); 
        
        // SUCCESS ACTION
        setSuccessMsg("Students Registered Successfully!");
        Alert.alert("Success", "Bulk Upload Completed!");
        
        // Auto Clear File Data
        setStudents([]);
        setFileName(null);

        // --- NEW UPDATE: Auto Hide Success Message after 4 seconds ---
        setTimeout(() => {
          setSuccessMsg(null);
        }, 4000);

    } catch (error: any) {
      console.log("Upload Error:", error);
      
      if (error.code === 'ECONNABORTED') {
          Alert.alert('Timeout', 'The server took too long to respond, but data might be saved. Please check the student list.');
      } else {
          const msg = error.response?.data?.message || 'Upload failed.';
          Alert.alert('Failed', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* BODY */}
      <View style={styles.content}>
        
        {/* PAGE TITLE */}
        <View style={{ marginBottom: 20 }}>
           <Text style={styles.pageTitle}>Bulk Student Upload</Text>
           <Text style={styles.pageSubtitle}>Upload CSV & Create Accounts</Text>
        </View>

        {/* INSTRUCTIONS */}
        <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📝 CSV Columns Order:</Text>
            <Text style={styles.infoText}>
              Name, Email, Phone, PAN, College, Roll No, Year
            </Text>
        </View>

        {/* SUCCESS MESSAGE */}
        {successMsg && (
            <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                <Text style={styles.successText}>{successMsg}</Text>
            </View>
        )}

        {/* FILE UPLOAD & PREVIEW AREA */}
        {students.length === 0 ? (
            // --- UPLOAD STATE ---
            <TouchableOpacity 
                onPress={pickDocument} 
                activeOpacity={0.7} 
                style={styles.uploadBox}
            >
                <View style={styles.iconCircle}>
                    <Ionicons name="cloud-upload-outline" size={30} color="#4338ca" />
                </View>
                <Text style={styles.uploadTitle}>Select CSV File</Text>
                <Text style={styles.uploadSubtitle}>{fileName || "Tap to browse"}</Text>
            </TouchableOpacity>
        ) : (
            // --- PREVIEW STATE ---
            <View style={{ flex: 1 }}>
                 <View style={styles.previewHeader}>
                    <Text style={styles.previewTitle}>Preview ({students.length} Students)</Text>
                    
                    {/* CLEAR BUTTON */}
                    <TouchableOpacity onPress={clearFile} style={styles.clearBtn}>
                        <Ionicons name="trash-outline" size={16} color="white" />
                        <Text style={styles.clearBtnText}>Clear</Text>
                    </TouchableOpacity>
                 </View>
                 
                 <FlatList 
                    data={students} 
                    keyExtractor={(_, i) => i.toString()} 
                    style={styles.listContainer}
                    contentContainerStyle={{ padding: 10 }} 
                    showsVerticalScrollIndicator={true} 
                    renderItem={({ item, index }) => (
                        <View style={styles.listItem}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.studentName}>{index + 1}. {item.fullName}</Text>
                                <Text style={styles.studentYear}>{item.passoutYear}</Text>
                            </View>
                            <Text style={styles.studentDetails}>{item.email} • {item.phoneNumber}</Text>
                            <Text style={styles.studentCollege}>{item.collegeName}</Text>
                        </View>
                    )} 
                 />

                {/* UPLOAD BUTTON (Only visible when file is selected) */}
                <TouchableOpacity onPress={handleUpload} disabled={isLoading} style={styles.submitBtnContainer}>
                    <LinearGradient 
                        colors={['#10b981', '#059669']} 
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.submitBtn}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>CONFIRM UPLOAD</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  content: { flex: 1, padding: 20 },
  
  // Page Title Styles
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 5 },
  pageSubtitle: { fontSize: 13, color: '#64748b' },

  infoBox: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  infoTitle: { fontWeight: 'bold', color: '#334155', marginBottom: 5 },
  infoText: { fontSize: 12, color: '#64748b' },
  successBox: { backgroundColor: '#dcfce7', borderColor: '#86efac', borderWidth: 1, padding: 15, borderRadius: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
  successText: { color: '#15803d', fontWeight: 'bold', marginLeft: 10 },
  
  uploadBox: { borderWidth: 2, borderColor: '#cbd5e1', borderStyle: 'dashed', borderRadius: 20, height: 180, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  iconCircle: { backgroundColor: '#e0e7ff', padding: 15, borderRadius: 50, marginBottom: 10 },
  uploadTitle: { color: '#1e293b', fontWeight: 'bold', fontSize: 16 },
  uploadSubtitle: { color: '#64748b', fontSize: 12, marginTop: 5 },

  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  previewTitle: { fontWeight: 'bold', color: '#334155' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ef4444', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  clearBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  
  listContainer: { flex: 1, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 15 },
  listItem: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  studentName: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  studentYear: { fontSize: 12, color: '#64748b' },
  studentDetails: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  studentCollege: { fontSize: 11, color: '#cbd5e1', marginTop: 1 },

  submitBtnContainer: { marginBottom: 10 },
  submitBtn: { padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#059669', shadowOpacity: 0.3, elevation: 5 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
});