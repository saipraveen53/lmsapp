import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Modal, Platform,
  StatusBar,
  Text, TouchableOpacity, View
} from 'react-native';
import api from '../(utils)/api'; // Ensure this points to your configured axios instance

export default function BulkQuizUpload() {
  const router = useRouter();
  const { courseId, courseName, courseData } = useLocalSearchParams(); 
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Toggle: Grand Test vs Lecture Quiz
  // CHANGED: Default is FALSE (Lecture Quiz) as per request
  const [isGrandTest, setIsGrandTest] = useState(false); 

  // Lecture Selection State
  const [allLectures, setAllLectures] = useState<any[]>([]); 
  const [selectedLecture, setSelectedLecture] = useState<any>(null); 
  const [modalVisible, setModalVisible] = useState(false); 

  // --- 1. PARSE COURSE DATA ON MOUNT ---
  useEffect(() => {
    if (courseData && typeof courseData === 'string') {
        try {
            const parsedCourse = JSON.parse(courseData);
            const flatLectures: any[] = [];
            
            // Loop through sections and extract lectures with Section info
            if (parsedCourse.sections && Array.isArray(parsedCourse.sections)) {
                parsedCourse.sections.forEach((section: any) => {
                    if (section.lectures && Array.isArray(section.lectures)) {
                        section.lectures.forEach((lecture: any) => {
                            flatLectures.push({
                                ...lecture,
                                sectionTitle: section.title, // Keep section name for display
                                sectionId: section.id
                            });
                        });
                    }
                });
            }
            setAllLectures(flatLectures);
        } catch (e) {
            console.log("Error parsing course data", e);
        }
    }
  }, [courseData]);

  // --- 2. CSV PARSING ---
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', 
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const file = result.assets[0];
      setFileName(file.name);
      setIsLoading(true);

      let content = '';
      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        content = await response.text();
      } else {
        content = await FileSystem.readAsStringAsync(file.uri);
      }
      parseCSV(content);

    } catch (err) {
      console.log('File Error:', err);
      Alert.alert('Error', 'Failed to read file.');
      setIsLoading(false);
    }
  };

  const parseCSV = (csvText: string) => {
    try {
      const rows = csvText.split('\n');
      const parsedQuestions: any[] = [];
      rows.forEach((row) => {
        if (!row.trim()) return; 
        const cols = row.split(','); 
        // Basic CSV Parsing (Question, A, B, C, D, CorrectAnswer)
        if (cols.length >= 6) {
          const questionText = cols[0].trim();
          const options = [cols[1].trim(), cols[2].trim(), cols[3].trim(), cols[4].trim()];
          const ansLetter = cols[5].trim().toUpperCase(); 
          let correctOption = options[0]; 
          if (ansLetter === 'B') correctOption = options[1];
          else if (ansLetter === 'C') correctOption = options[2];
          else if (ansLetter === 'D') correctOption = options[3];
          parsedQuestions.push({ questionText, options, correctOption });
        }
      });
      if (parsedQuestions.length === 0) Alert.alert('Error', 'No valid questions found.');
      else setQuestions(parsedQuestions);
    } catch (e) {
      Alert.alert('Error', 'Invalid CSV Format.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. UPLOAD LOGIC ---
  const handleUpload = async () => {
    if (questions.length === 0) {
        Alert.alert("Error", "Please upload a CSV file with questions.");
        return;
    }
    
    // Validation: If Lecture Quiz (!isGrandTest), must select a lecture
    if (!isGrandTest && !selectedLecture) {
      Alert.alert("Error", "Please select a Lecture/Video for the quiz.");
      return;
    }

    setIsLoading(true);
    try {
        const payload = {
            courseId, 
            isGrandTest,
            // If it's a lecture quiz, send the lectureId. 
            lectureId: isGrandTest ? null : selectedLecture.id, 
            moduleName: isGrandTest ? null : selectedLecture.title,
            questions
        };
        
        console.log("Uploading Payload:", payload);
        
        await api.post('/api/quiz/bulk-create', payload); 
        
        Alert.alert('Success', 'Quiz Uploaded Successfully!', [
            { text: 'OK', onPress: () => router.push('/(admin)/Courses') }
        ]);
    } catch (error: any) {
      console.log("Upload Error:", error);
      Alert.alert('Failed', error.response?.data?.message || 'Upload failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <LinearGradient colors={['#4338ca', '#e11d48']} start={{x:0, y:0}} end={{x:1, y:0}} className="pt-12 pb-4 px-4 shadow-sm">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.push('/(admin)/Courses')} className="mr-3 bg-white/20 p-2 rounded-full">
                <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View>
                <Text className="text-lg font-bold text-white">Upload Quiz</Text>
                <Text className="text-indigo-100 text-xs">{courseName || "Select a course"}</Text>
            </View>
        </View>
      </LinearGradient>

      {/* BODY */}
      <View className="flex-1 px-5 pt-6">
        
        {/* Toggle Switch (UPDATED ORDER) */}
        <View className="flex-row bg-white p-1 rounded-xl border border-slate-200 mb-5">
          {/* LEFT: Lecture Quiz (Default) */}
          <TouchableOpacity 
            onPress={() => setIsGrandTest(false)} 
            className={`flex-1 py-2.5 rounded-lg items-center ${!isGrandTest ? 'bg-indigo-600' : ''}`}
          >
             <Text className={`font-bold text-xs ${!isGrandTest ? 'text-white' : 'text-slate-500'}`}>📹 Lecture Quiz</Text>
          </TouchableOpacity>

          {/* RIGHT: Grand Test */}
          <TouchableOpacity 
            onPress={() => setIsGrandTest(true)} 
            className={`flex-1 py-2.5 rounded-lg items-center ${isGrandTest ? 'bg-indigo-600' : ''}`}
          >
             <Text className={`font-bold text-xs ${isGrandTest ? 'text-white' : 'text-slate-500'}`}>🏆 Grand Test</Text>
          </TouchableOpacity>
        </View>

        {/* LECTURE SELECTION (Only if NOT Grand Test) */}
        {!isGrandTest && (
          <View className="mb-5">
              <Text className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">Select Lecture / Video</Text>
              
              <TouchableOpacity 
                onPress={() => setModalVisible(true)}
                className="bg-white border border-slate-300 p-4 rounded-xl flex-row justify-between items-center"
              >
                  {selectedLecture ? (
                      <View>
                          <Text className="text-slate-800 font-bold text-sm">{selectedLecture.title}</Text>
                          <Text className="text-slate-400 text-[10px]">{selectedLecture.sectionTitle} • ID: {selectedLecture.id}</Text>
                      </View>
                  ) : (
                      <Text className="text-slate-400 text-sm">Tap to select a video...</Text>
                  )}
                  <Ionicons name="chevron-down" size={20} color="#94a3b8" />
              </TouchableOpacity>
          </View>
        )}

        {/* FILE UPLOAD AREA */}
        {questions.length === 0 ? (
            <TouchableOpacity onPress={pickDocument} activeOpacity={0.7} className="border-2 border-dashed border-indigo-300 bg-indigo-50/50 rounded-2xl h-40 justify-center items-center mb-4">
                <View className="bg-indigo-100 p-3 rounded-full mb-2"><Ionicons name="cloud-upload" size={24} color="#4338ca" /></View>
                <Text className="text-indigo-900 font-bold">Tap to Upload CSV</Text>
                <Text className="text-indigo-400 text-xs mt-1">{fileName || "Supports .csv"}</Text>
            </TouchableOpacity>
        ) : (
            <View className="flex-1 mb-4">
                 <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-bold text-slate-700">Preview ({questions.length} Qns)</Text>
                    <TouchableOpacity onPress={() => setQuestions([])}><Text className="text-rose-500 text-xs font-bold">Clear File</Text></TouchableOpacity>
                 </View>
                 <FlatList data={questions} keyExtractor={(_, i) => i.toString()} className="bg-white rounded-xl border border-slate-200" contentContainerStyle={{ padding: 10 }} renderItem={({ item, index }) => (
                    <View className="border-b border-slate-100 pb-2 mb-2 last:border-0">
                        <Text className="font-bold text-slate-800 text-sm">{index + 1}. {item.questionText}</Text>
                        <Text className="text-xs text-green-600">Ans: {item.correctOption}</Text>
                    </View>
                 )} />
            </View>
        )}

        {/* SUBMIT BUTTON (Only shows when questions are loaded) */}
        {questions.length > 0 && (
            <TouchableOpacity onPress={handleUpload} disabled={isLoading} className="mb-6">
                <LinearGradient colors={['#10b981', '#059669']} className="p-4 rounded-xl items-center shadow-md">
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold tracking-wider">CONFIRM UPLOAD</Text>}
                </LinearGradient>
            </TouchableOpacity>
        )}
      </View>

      {/* --- LECTURE SELECTION MODAL --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl h-[70%] p-5">
                <View className="flex-row justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <Text className="text-lg font-bold text-slate-800">Select Video</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                        <Ionicons name="close" size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {allLectures.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Text className="text-slate-400">No lectures found in this course.</Text>
                    </View>
                ) : (
                    <FlatList 
                        data={allLectures}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                onPress={() => {
                                    setSelectedLecture(item);
                                    setModalVisible(false);
                                }}
                                className={`p-4 mb-3 rounded-xl border ${selectedLecture?.id === item.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-100'}`}
                            >
                                <View className="flex-row items-center">
                                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${selectedLecture?.id === item.id ? 'bg-indigo-500' : 'bg-slate-100'}`}>
                                        <Ionicons name="play" size={14} color={selectedLecture?.id === item.id ? 'white' : '#94a3b8'} />
                                    </View>
                                    <View>
                                        <Text className={`font-bold text-sm ${selectedLecture?.id === item.id ? 'text-indigo-900' : 'text-slate-700'}`}>{item.title}</Text>
                                        <Text className="text-xs text-slate-400 mt-0.5">{item.sectionTitle} • ID: {item.id}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </View>
      </Modal>

    </View>
  );
}