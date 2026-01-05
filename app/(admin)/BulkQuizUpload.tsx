import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Modal,
  StatusBar,
  Text, TouchableOpacity, View
} from 'react-native';
import { CourseApi, QuizApi } from '../(utils)/axiosInstance';

export default function BulkQuizUpload() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Safe extraction of params
  const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;
  const courseName = Array.isArray(params.courseName) ? params.courseName[0] : params.courseName;

  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For upload process
  const [fileName, setFileName] = useState<string | null>(null);
  
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isGrandTest, setIsGrandTest] = useState(false); 

  // Lecture Selection State
  const [allLectures, setAllLectures] = useState<any[]>([]); 
  const [selectedLecture, setSelectedLecture] = useState<any>(null); 
  const [modalVisible, setModalVisible] = useState(false); 
  
  // Loading state for fetching lectures
  const [isLoadingLectures, setIsLoadingLectures] = useState(false);

  // --- 1. FETCH COURSE DETAILS (ONLY BACKEND) ---
  useEffect(() => {
    setSuccessMsg(null);
    setQuestions([]);
    setFileName(null);
    setSelectedLecture(null);
    setIsGrandTest(false);

    const fetchDetails = async () => {
        if (!courseId) return;

        setIsLoadingLectures(true);
        try {
            console.log(`Fetching details for Course ID: ${courseId}`);
            
            // Fetch Course Details from Backend
            const response = await CourseApi.get(`/api/courses/${courseId}`);
            const courseData = response.data?.data || response.data;

            // Process Backend Lectures directly
            if (courseData) {
                processBackendLectures(courseData);
            }

        } catch (error: any) {
            console.log("Error fetching details:", error);
            Alert.alert("Error", "Failed to load course details.");
        } finally {
            setIsLoadingLectures(false); 
        }
    };

    fetchDetails();
  }, [courseId]);

  // --- 2. PROCESS LECTURES FROM BACKEND RESPONSE ---
  const processBackendLectures = (data: any) => {
      let flatLectures: any[] = [];

      // Scenario A: Direct Lectures Array
      if (data.lectures && Array.isArray(data.lectures)) {
          flatLectures = data.lectures.map((lecture: any) => ({
              id: lecture.id, // Numeric DB ID
              title: lecture.title,
              sectionTitle: "Course Lecture",
              videoGuid: lecture.videoGuid
          }));
      } 
      // Scenario B: Sections
      else if (data.sections && Array.isArray(data.sections)) {
          data.sections.forEach((section: any) => {
              if (section.lectures && Array.isArray(section.lectures)) {
                  section.lectures.forEach((lecture: any) => {
                      flatLectures.push({
                          id: lecture.id,
                          title: lecture.title,
                          sectionTitle: section.title, 
                          sectionId: section.id
                      });
                  });
              }
          });
      }

      console.log(`Loaded ${flatLectures.length} lectures from Backend.`);
      setAllLectures(flatLectures);
  };

  // --- 3. CSV PARSING ---
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
      setSuccessMsg(null);

      const response = await fetch(file.uri);
      const content = await response.text();
      
      parseCSV(content);

    } catch (err: any) {
      Alert.alert('Error', `Failed to read file: ${err.message}`);
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
      
      if (parsedQuestions.length === 0) {
          Alert.alert('Error', 'No valid questions found in CSV.');
      } else {
          setQuestions(parsedQuestions);
      }
    } catch (e) {
      Alert.alert('Error', 'Invalid CSV Format.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. UPLOAD LOGIC ---
  const handleUpload = async () => {
    if (questions.length === 0) {
        Alert.alert("Error", "Please upload a CSV file.");
        return;
    }
    
    if (!isGrandTest && !selectedLecture) {
      Alert.alert("Error", "Please select a Lecture/Video first.");
      return;
    }

    setIsLoading(true);
    try {
        const mappedQuestions = questions.map(q => {
            const correctIndex = q.options.indexOf(q.correctOption);
            const validIndex = correctIndex !== -1 ? correctIndex : 0;
            return {
                questionText: q.questionText,
                questionType: "MCQ", 
                marks: 1, 
                options: q.options,
                correctOptionIndexes: [validIndex] 
            };
        });

        const totalMarks = mappedQuestions.reduce((sum, q) => sum + q.marks, 0);

        const quizDTO = {
            courseId: Number(courseId),
            quizType: isGrandTest ? "GRAND" : "LECTURE",
            lectureId: isGrandTest ? null : selectedLecture.id, 
            totalMarks: totalMarks,
            questions: mappedQuestions
        };
        
        console.log("Uploading Quiz Payload:", JSON.stringify(quizDTO, null, 2));

        await QuizApi.post('/api/quizzes/bulk', [ quizDTO ]); 
        
        // Reset Form
        setQuestions([]); 
        setFileName(null);
        setSelectedLecture(null);
        
        // Show Success Message
        setSuccessMsg("Quiz Uploaded Successfully!");

        // 🔥 FIX: Clear message after 4 seconds (Don't navigate back)
        setTimeout(() => {
            setSuccessMsg(null);
        }, 4000);

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
            <TouchableOpacity onPress={() => router.back()} className="mr-3 bg-white/20 p-2 rounded-full">
                <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <View>
                <Text className="text-lg font-bold text-white">Upload Quiz</Text>
                <Text className="text-indigo-100 text-xs">{courseName || "Course ID: " + courseId}</Text>
            </View>
        </View>
      </LinearGradient>

      {/* BODY */}
      <View className="flex-1 px-5 pt-6">
        
        {/* SUCCESS BANNER (Conditionally Rendered) */}
        {successMsg && (
            <View className="bg-green-100 border border-green-400 p-4 rounded-xl mb-4 flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                <View className="ml-3">
                    <Text className="text-green-800 font-bold text-base">Success!</Text>
                    <Text className="text-green-700 text-xs">{successMsg}</Text>
                </View>
            </View>
        )}

        {/* QUIZ TYPE TOGGLE */}
        <View className="flex-row bg-white p-1 rounded-xl border border-slate-200 mb-5">
          <TouchableOpacity 
            onPress={() => setIsGrandTest(false)} 
            className={`flex-1 py-2.5 rounded-lg items-center ${!isGrandTest ? 'bg-indigo-600' : ''}`}
          >
             <Text className={`font-bold text-xs ${!isGrandTest ? 'text-white' : 'text-slate-500'}`}>道 Lecture Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsGrandTest(true)} 
            className={`flex-1 py-2.5 rounded-lg items-center ${isGrandTest ? 'bg-indigo-600' : ''}`}
          >
             <Text className={`font-bold text-xs ${isGrandTest ? 'text-white' : 'text-slate-500'}`}>醇 Grand Test</Text>
          </TouchableOpacity>
        </View>

        {/* LECTURE SELECTION */}
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
                          <Text className="text-slate-400 text-[10px]">ID: {selectedLecture.id}</Text>
                      </View>
                  ) : (
                      <Text className="text-slate-400 text-sm">Tap to select a video...</Text>
                  )}
                  <Ionicons name="chevron-down" size={20} color="#94a3b8" />
              </TouchableOpacity>
          </View>
        )}

        {/* UPLOAD BOX */}
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

        {/* SUBMIT BUTTON */}
        {questions.length > 0 && (
            <TouchableOpacity onPress={handleUpload} disabled={isLoading} className="mb-6">
                <LinearGradient colors={['#10b981', '#059669']} className="p-4 rounded-xl items-center shadow-md">
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold tracking-wider">CONFIRM UPLOAD</Text>}
                </LinearGradient>
            </TouchableOpacity>
        )}
      </View>

      {/* --- VIDEO SELECTION MODAL --- */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl h-[70%] p-5">
                <View className="flex-row justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <Text className="text-lg font-bold text-slate-800">Select Video</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-slate-100 p-2 rounded-full">
                        <Ionicons name="close" size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* MODAL CONTENT LOGIC */}
                {isLoadingLectures ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#4338ca" />
                        <Text className="text-slate-400 mt-2">Loading lectures...</Text>
                    </View>
                ) : allLectures.length === 0 ? (
                    <View className="flex-1 justify-center items-center">
                        <Ionicons name="videocam-off" size={40} color="#cbd5e1" />
                        <Text className="text-slate-500 mt-2 font-bold">No Lectures Found</Text>
                        <Text className="text-slate-400 text-xs text-center px-8 mt-1">
                            This course seems to have no lectures added in the backend.
                        </Text>
                        <TouchableOpacity 
                            onPress={() => setModalVisible(false)} 
                            className="mt-4 bg-indigo-100 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-indigo-600 font-bold">Close</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList 
                        data={allLectures}
                        keyExtractor={(item) => String(item.id)}
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
                                    <View className="flex-1">
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