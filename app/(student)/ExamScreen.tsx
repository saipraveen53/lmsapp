import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Use QuizApi for submission
import { QuizApi } from '../(utils)/axiosInstance';

export default function ExamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); 
  const { quizId, quizType, quizData: quizDataString } = params;

  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Timer State (30 Minutes = 1800 Seconds)
  const [timeLeft, setTimeLeft] = useState(1800); 
  
  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  // --- 1. PARSE DATA ---
  useEffect(() => {
    if (quizDataString) {
        try {
            const parsedData = JSON.parse(quizDataString as string);
            setQuizData(parsedData);
        } catch (e) {
            // Web Alert Handling
            if (Platform.OS === 'web') {
                window.alert("Error: Failed to load quiz data");
            } else {
                Alert.alert("Error", "Failed to load quiz data");
            }
            router.back();
        } finally {
            setLoading(false);
        }
    } else {
        setLoading(false);
        if (Platform.OS === 'web') {
            window.alert("Error: No quiz data found");
        } else {
            Alert.alert("Error", "No quiz data found");
        }
        router.back();
    }
  }, [quizDataString]);

  // --- 2. TIMER LOGIC ---
  useEffect(() => {
    if (loading || isSubmitted) return;

    const timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => {
            if (prevTime <= 1) {
                clearInterval(timerInterval);
                handleSubmit(true); // Auto Submit
                return 0;
            }
            return prevTime - 1;
        });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [loading, isSubmitted]);

  // --- 3. PREVENT BACK (MOBILE ONLY) ---
  useEffect(() => {
    // BackHandler is not supported on Web, so we skip it
    if (Platform.OS === 'web') return;

    const backAction = () => {
      if (!isSubmitted) {
        Alert.alert("Hold on!", "Are you sure you want to quit the exam?", [
          { text: "Cancel", onPress: () => null, style: "cancel" },
          { text: "YES", onPress: () => router.back() }
        ]);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [isSubmitted]);

  // Format Time (MM:SS)
  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQIndex]: optionIndex });
  };

  // --- UPDATED: HANDLE SUBMIT WITH WEB/MOBILE CONDITIONS ---
  const handleSubmit = (autoSubmit = false) => {
    if (isSubmitted) return;

    if (autoSubmit) {
        // Auto Submit Alert
        if (Platform.OS === 'web') {
            window.alert("Time's Up! Auto-submitting your exam.");
        } else {
            Alert.alert("Time's Up!", "Auto-submitting your exam.");
        }
        submitToBackend();
    } else {
        // Manual Submit Confirmation
        if (Platform.OS === 'web') {
            // WEB: Use native browser confirm dialog
            const confirm = window.confirm("Are you sure you want to submit?");
            if (confirm) {
                submitToBackend();
            }
        } else {
            // MOBILE: Use React Native Alert
            Alert.alert("Submit Exam", "Are you sure you want to submit?", [
                { text: "Cancel", style: "cancel" },
                { text: "Submit", onPress: submitToBackend }
            ]);
        }
    }
  };

  // --- SUBMIT TO BACKEND ---
  const submitToBackend = async () => {
      if (!quizData) return;
      setSubmitting(true);

      try {
          const answersPayload = Object.keys(selectedAnswers).map(index => {
              const qIndex = Number(index);
              const question = quizData.questions[qIndex];
              return {
                  questionId: question.questionId, 
                  selectedOptionIndexes: [selectedAnswers[qIndex]]
              };
          });

          const payload = {
              quizId: Number(quizId),
              answers: answersPayload
          };

          console.log("Submitting Payload:", JSON.stringify(payload));

          const response = await QuizApi.post('/api/quizzes/submit', payload);
          
          if (response.data) {
              setResultData(response.data);
              setIsSubmitted(true);
              
              const { obtainedMarks, totalMarks, passed } = response.data;
              const percentage = (obtainedMarks / totalMarks) * 100;
              const message = passed ? "Congratulations! 🎉" : "Keep Trying!";
              const scoreMsg = `You scored ${obtainedMarks} / ${totalMarks} (${percentage.toFixed(1)}%)`;

              // --- UPDATED: RESULT ALERT FOR WEB/MOBILE ---
              if (Platform.OS === 'web') {
                  // WEB: Use confirm to give option to close or stay
                  const close = window.confirm(`${message}\n${scoreMsg}\n\nClick OK to Close, Cancel to View Result.`);
                  if (close) {
                      router.back();
                  }
              } else {
                  // MOBILE: Use Alert with custom buttons
                  Alert.alert(
                      message, 
                      scoreMsg,
                      [
                          { text: "View Result", onPress: () => {} }, 
                          { text: "Close", onPress: () => router.back() }
                      ]
                  );
              }
          }

      } catch (error: any) {
          console.log("Submit Error:", error);
          const errMsg = "Failed to submit exam. Please try again.";
          if (Platform.OS === 'web') {
              window.alert(errMsg);
          } else {
              Alert.alert("Error", errMsg);
          }
      } finally {
          setSubmitting(false);
      }
  };

  if (loading || !quizData) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fff'}}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const currentQ = quizData.questions[currentQIndex];
  const totalQ = quizData.questions.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={{ padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>
                  {quizType === 'GRAND' ? '🏆 Grand Test' : '📝 Lecture Quiz'}
              </Text>
              <Text style={{ fontSize: 12, color: '#64748b' }}>
                  Question {currentQIndex + 1} of {totalQ}
              </Text>
          </View>
          
          {/* TIMER DISPLAY */}
          <View style={{ 
              backgroundColor: timeLeft < 60 ? '#fef2f2' : '#e0e7ff', 
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
              borderWidth: 1, borderColor: timeLeft < 60 ? '#fee2e2' : '#e0e7ff'
          }}>
              <Text style={{ 
                  color: timeLeft < 60 ? '#dc2626' : '#4338ca', 
                  fontWeight: 'bold', fontSize: 14 
              }}>
                  ⏱ {formatTime(timeLeft)}
              </Text>
          </View>
      </View>

      {/* QUESTION BODY */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 20, lineHeight: 28 }}>
              {currentQ.questionText}
          </Text>

          {currentQ.options.map((opt: string, idx: number) => {
              const isSelected = selectedAnswers[currentQIndex] === idx;
              let borderColor = isSelected ? '#4f46e5' : '#e2e8f0';
              let bgColor = isSelected ? '#eff6ff' : '#fff';

              // Visual Feedback AFTER Submission
              if (isSubmitted) {
                  const isCorrect = currentQ.correctOptionIndexes.includes(idx);
                  if (isCorrect) {
                      borderColor = '#10b981'; // Green
                      bgColor = '#ecfdf5';
                  } else if (isSelected && !isCorrect) {
                      borderColor = '#ef4444'; // Red
                      bgColor = '#fef2f2';
                  }
              }

              return (
                  <TouchableOpacity 
                    key={idx} 
                    activeOpacity={0.8}
                    disabled={isSubmitted || submitting}
                    onPress={() => handleOptionSelect(idx)}
                    style={{ 
                        flexDirection: 'row', alignItems: 'center', 
                        padding: 15, marginBottom: 12, borderRadius: 12, borderWidth: 2,
                        backgroundColor: bgColor,
                        borderColor: borderColor
                    }}
                  >
                      <View style={{ 
                          width: 24, height: 24, borderRadius: 12, borderWidth: 2, 
                          borderColor: isSelected ? (isSubmitted ? borderColor : '#4f46e5') : '#cbd5e1',
                          justifyContent: 'center', alignItems: 'center', marginRight: 12
                      }}>
                          {isSelected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: isSubmitted ? borderColor : '#4f46e5' }} />}
                      </View>
                      <Text style={{ fontSize: 15, color: '#475569', fontWeight: isSelected ? '600' : '400' }}>
                          {opt}
                      </Text>
                  </TouchableOpacity>
              );
          })}
      </ScrollView>

      {/* FOOTER */}
      <View style={{ padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            disabled={currentQIndex === 0 || submitting}
            onPress={() => setCurrentQIndex(prev => prev - 1)}
            style={{ paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, backgroundColor: currentQIndex === 0 ? '#f1f5f9' : '#fff', borderWidth: 1, borderColor: '#e2e8f0' }}
          >
              <Text style={{ color: currentQIndex === 0 ? '#cbd5e1' : '#64748b', fontWeight: 'bold' }}>Previous</Text>
          </TouchableOpacity>

          {!isSubmitted && currentQIndex === totalQ - 1 ? (
              <TouchableOpacity 
                onPress={() => handleSubmit(false)}
                disabled={submitting}
                style={{ paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, backgroundColor: '#10b981', flexDirection:'row', alignItems:'center' }}
              >
                  {submitting ? <ActivityIndicator size="small" color="white" style={{marginRight:5}}/> : null}
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit Exam</Text>
              </TouchableOpacity>
          ) : (
              <TouchableOpacity 
                disabled={currentQIndex === totalQ - 1 || submitting}
                onPress={() => setCurrentQIndex(prev => prev + 1)}
                style={{ 
                    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, 
                    backgroundColor: currentQIndex === totalQ - 1 ? '#e2e8f0' : '#4f46e5' 
                }}
              >
                  <Text style={{ color: currentQIndex === totalQ - 1 ? '#94a3b8' : '#fff', fontWeight: 'bold' }}>
                      {isSubmitted ? (currentQIndex === totalQ - 1 ? 'Finished' : 'Next') : 'Next Question'}
                  </Text>
              </TouchableOpacity>
          )}
      </View>
    </SafeAreaView>
  );
}