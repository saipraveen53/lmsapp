import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator, Alert, FlatList, Platform,
    StatusBar,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';

export default function BulkQuizUpload() {
  const router = useRouter();
  const { courseId, courseName } = useLocalSearchParams(); 
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isGrandTest, setIsGrandTest] = useState(true); 
  const [moduleName, setModuleName] = useState(""); 

  // --- CSV PARSING & UPLOAD LOGIC (Same as before) ---
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

  const handleUpload = async () => {
    if (questions.length === 0) return;
    if (!isGrandTest && !moduleName) {
      Alert.alert("Error", "Please enter Module Name");
      return;
    }
    setIsLoading(true);
    try {
        const payload = {
            courseId, isGrandTest,
            moduleName: isGrandTest ? null : moduleName,
            questions
        };
        // await api.post('/api/quiz/bulk-create', payload); 
        setTimeout(() => {
            Alert.alert('Success', 'Quiz Uploaded!', [
                // FIX: Navigate explicitly to Courses page
                { text: 'OK', onPress: () => router.push('/(admin)/Courses') }
            ]);
            setIsLoading(false);
        }, 1000);
    } catch (error) {
      Alert.alert('Failed', 'Upload failed.');
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <LinearGradient colors={['#4338ca', '#e11d48']} start={{x:0, y:0}} end={{x:1, y:0}} className="pt-12 pb-4 px-4 shadow-sm">
        <View className="flex-row items-center">
            {/* FIX: Back button goes to Courses explicitly */}
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
        <View className="flex-row bg-white p-1 rounded-xl border border-slate-200 mb-5">
          <TouchableOpacity onPress={() => setIsGrandTest(true)} className={`flex-1 py-2.5 rounded-lg items-center ${isGrandTest ? 'bg-indigo-600' : ''}`}>
             <Text className={`font-bold text-xs ${isGrandTest ? 'text-white' : 'text-slate-500'}`}>🏆 Grand Test</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsGrandTest(false)} className={`flex-1 py-2.5 rounded-lg items-center ${!isGrandTest ? 'bg-indigo-600' : ''}`}>
             <Text className={`font-bold text-xs ${!isGrandTest ? 'text-white' : 'text-slate-500'}`}>📚 Module Quiz</Text>
          </TouchableOpacity>
        </View>

        {!isGrandTest && (
          <View className="mb-5">
              <Text className="text-[10px] font-bold text-slate-400 mb-1 ml-1 uppercase">Module Name</Text>
              <TextInput value={moduleName} onChangeText={setModuleName} placeholder="e.g. Module 1" className="bg-white border border-slate-300 p-3 rounded-xl text-slate-800 text-sm" />
          </View>
        )}

        {questions.length === 0 ? (
            <TouchableOpacity onPress={pickDocument} activeOpacity={0.7} className="border-2 border-dashed border-indigo-300 bg-indigo-50/50 rounded-2xl h-40 justify-center items-center mb-4">
                <View className="bg-indigo-100 p-3 rounded-full mb-2"><Ionicons name="cloud-upload" size={24} color="#4338ca" /></View>
                <Text className="text-indigo-900 font-bold">Tap to Upload CSV</Text>
                <Text className="text-indigo-400 text-xs mt-1">{fileName || "Supports .csv"}</Text>
            </TouchableOpacity>
        ) : (
            <View className="flex-1 mb-4">
                 <View className="flex-row justify-between items-center mb-2">
                    <Text className="font-bold text-slate-700">Preview ({questions.length})</Text>
                    <TouchableOpacity onPress={() => setQuestions([])}><Text className="text-rose-500 text-xs font-bold">Clear</Text></TouchableOpacity>
                 </View>
                 <FlatList data={questions} keyExtractor={(_, i) => i.toString()} className="bg-white rounded-xl border border-slate-200" contentContainerStyle={{ padding: 10 }} renderItem={({ item, index }) => (
                    <View className="border-b border-slate-100 pb-2 mb-2 last:border-0">
                        <Text className="font-bold text-slate-800 text-sm">{index + 1}. {item.questionText}</Text>
                        <Text className="text-xs text-green-600">Ans: {item.correctOption}</Text>
                    </View>
                 )} />
            </View>
        )}

        {questions.length > 0 && (
            <TouchableOpacity onPress={handleUpload} disabled={isLoading} className="mb-6">
                <LinearGradient colors={['#10b981', '#059669']} className="p-4 rounded-xl items-center shadow-md">
                    {isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">CONFIRM UPLOAD</Text>}
                </LinearGradient>
            </TouchableOpacity>
        )}
      </View>
    </View>
  );
}