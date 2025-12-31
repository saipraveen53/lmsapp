import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions
} from "react-native";
import { rootApi } from "../(utils)/axiosInstance";

// --- TYPES ---
interface Lecture {
  title: string;
  videoUrl: string;
  duration: number;
}

interface Section {
  title: string;
  description: string;
  orderIndex: number;
  lectures: Lecture[];
}

interface CourseData {
  title: string;
  subtitle: string;
  description: string;
  price: string;
  language: string;
  level: string;
  libraryId: string;
  thumbnailUrl: string;
  previewVideoUrl: string;
  whatYouWillLearn: string;
  requirements: string;
  targetAudience: string;
  categoryId: number;
  isFree: boolean;
  isPublished: boolean;
  sections: Section[];
}

// --- INITIAL STATE ---
const INITIAL_STATE: CourseData = {
  title: "",
  subtitle: "",
  description: "",
  price: "0",
  language: "English",
  level: "INTERMEDIATE",
  libraryId: "",
  thumbnailUrl: "",
  previewVideoUrl: "",
  whatYouWillLearn: "",
  requirements: "",
  targetAudience: "",
  categoryId: 1,
  isFree: false,
  isPublished: false,
  sections: [
    {
      title: "Introduction",
      description: "Getting started",
      orderIndex: 1,
      lectures: [],
    },
  ],
};

// --- FIX: InputField MOVED OUTSIDE THE COMPONENT ---
const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  error,
  keyboardType = "default",
}: any) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontSize: 12, fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: 6, marginLeft: 4 }}>
      {label}
    </Text>
    <TextInput
      style={[
        {
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: error ? "#ef4444" : "#e5e7eb",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: multiline ? 12 : 10,
          fontSize: 16,
          color: "#1e293b",
          minHeight: multiline ? 96 : undefined,
          textAlignVertical: multiline ? "top" : "auto",
        },
      ]}
      value={value}
      onChangeText={onChange} // Ensure this prop name matches correctly
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      multiline={multiline}
      keyboardType={keyboardType}
    />
    {error && (
      <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4, marginLeft: 4 }}>{error}</Text>
    )}
  </View>
);

export default function CourseForm() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitMessageType, setSubmitMessageType] = useState<"success" | "error" | null>(null);
  const [form, setForm] = useState<CourseData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseData, string>>>({});

  // --- HANDLERS ---

  const updateField = (key: keyof CourseData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const addSection = () => {
    setForm((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: "",
          description: "",
          orderIndex: prev.sections.length + 1,
          lectures: [],
        },
      ],
    }));
  };

  const removeSection = (index: number) => {
    const updated = form.sections.filter((_, i) => i !== index);
    const reIndexed = updated.map((s, i) => ({ ...s, orderIndex: i + 1 }));
    setForm((prev) => ({ ...prev, sections: reIndexed }));
  };

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const updated = [...form.sections];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, sections: updated }));
  };

  const addLecture = (sectionIndex: number) => {
    const updatedSections = [...form.sections];
    updatedSections[sectionIndex].lectures.push({
      title: "",
      videoUrl: "",
      duration: 0,
    });
    setForm((prev) => ({ ...prev, sections: updatedSections }));
  };

  const removeLecture = (sectionIndex: number, lectureIndex: number) => {
    const updatedSections = [...form.sections];
    updatedSections[sectionIndex].lectures = updatedSections[sectionIndex].lectures.filter(
      (_, i) => i !== lectureIndex
    );
    setForm((prev) => ({ ...prev, sections: updatedSections }));
  };

  const updateLecture = (
    sectionIndex: number,
    lectureIndex: number,
    field: keyof Lecture,
    value: any
  ) => {
    const updatedSections = [...form.sections];
    updatedSections[sectionIndex].lectures[lectureIndex] = {
      ...updatedSections[sectionIndex].lectures[lectureIndex],
      [field]: value,
    };
    setForm((prev) => ({ ...prev, sections: updatedSections }));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (parseFloat(form.price) < 0) newErrors.price = "Price cannot be negative";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

   const handleSubmit = async () => {
    setSubmitMessage(null);
    setSubmitMessageType(null);

    if (!validate()) {
      setSubmitMessage("Please check the highlighted fields.");
      setSubmitMessageType("error");
      Alert.alert("Validation Error", "Please check the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price) || 0,
      };

      const response = await rootApi.post("http://192.168.0.105:8088/api/courses", payload);

      if (response.status === 200 || response.status === 201) {
        setSubmitMessage("Course created successfully!");
        setSubmitMessageType("success");
        Alert.alert("Success", "Course created successfully!", [
          { text: "OK", onPress: () => router.push("/(admin)/Courses") },
        ]);
      } else {
        setSubmitMessage("Failed to create course. Please try again.");
        setSubmitMessageType("error");
      }
    } catch (error: any) {
      console.error(error);
      setSubmitMessage(error.response?.data?.message || "Failed to create course.");
      setSubmitMessageType("error");
      Alert.alert("Error", error.response?.data?.message || "Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        
        {/* --- HEADER --- */}
        <LinearGradient
            colors={['#4338ca', '#e11d48']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: '100%',
              paddingHorizontal: 24,
              paddingVertical: 20,
              paddingTop: 48,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              flexDirection: 'row',
              zIndex: 10,
            }}
          >
            <Pressable
              onPress={() => router.push("/(admin)/Courses")}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                backgroundColor: 'rgba(255,255,255,0.15)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.2)',
                marginRight: 'auto',
              }}
            >
              <Ionicons name="arrow-back" size={18} color="#fff" />
              {/*<Text style={{ marginLeft: 8, fontWeight: 'bold', color: '#fff' }}>Back</Text>*/}
            </Pressable>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'left' }} className=" ml-4">
              Create New Course
            </Text>
            <View style={{ width: 48 }} />
          </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          {/* --- 1. BASIC INFORMATION --- */}
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
            <View className="flex-row items-center mb-5 border-b border-slate-50 pb-3">
               <View className="bg-indigo-50 p-2 rounded-lg mr-3"><Ionicons name="information-circle" size={20} color="#4f46e5" /></View>
               <Text className="text-lg font-bold text-slate-800">Basic Information</Text>
            </View>

            <InputField label="Course Title *" value={form.title} onChange={(t: string) => updateField("title", t)} error={errors.title} />
            <InputField label="Subtitle" value={form.subtitle} onChange={(t: string) => updateField("subtitle", t)} />
            <InputField label="Description *" value={form.description} onChange={(t: string) => updateField("description", t)} multiline />
            
            <View className={isDesktop ? "flex-row gap-4" : "flex-col"}>
               <View className="flex-1">
                 <InputField label="Price ($)" value={form.price} onChange={(t: string) => updateField("price", t)} keyboardType="numeric" error={errors.price} />
               </View>
               <View className="flex-1">
                 <InputField label="Language" value={form.language} onChange={(t: string) => updateField("language", t)} />
               </View>
            </View>

            {/* Level Selector */}
            <Text className="text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Difficulty Level</Text>
            <View className="flex-row gap-2 mb-4">
              {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((lvl) => (
                <Pressable
                  key={lvl}
                  onPress={() => updateField("level", lvl)}
                  className={`flex-1 py-3 rounded-xl border items-center justify-center ${
                    form.level === lvl ? "bg-indigo-600 border-indigo-600" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Text className={`text-xs font-bold ${form.level === lvl ? "text-white" : "text-slate-500"}`}>{lvl}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* --- 2. CURRICULUM (SECTIONS) --- */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
               <Text className="text-xl font-bold text-slate-800">Curriculum</Text>
               <Pressable onPress={addSection} className="flex-row items-center bg-indigo-600 px-4 py-2 rounded-xl shadow-md shadow-indigo-200">
                  <Ionicons name="add" size={18} color="white" />
                  <Text className="text-white font-bold ml-1 text-xs">Add Section</Text>
               </Pressable>
            </View>

            {form.sections.map((section, sIndex) => (
              <View key={sIndex} className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-5 shadow-sm">
                
                {/* Section Header */}
                <View className="bg-slate-50 p-4 border-b border-slate-100 flex-row justify-between items-start">
                  <View className="flex-1 mr-4">
                     <TextInput 
                        placeholder="Section Title (e.g., Introduction)" 
                        value={section.title} 
                        onChangeText={(t) => updateSection(sIndex, "title", t)}
                        className="font-bold text-slate-800 text-base bg-white border border-slate-200 rounded-lg px-3 py-2 mb-2"
                     />
                     <TextInput 
                        placeholder="Short Description" 
                        value={section.description} 
                        onChangeText={(t) => updateSection(sIndex, "description", t)}
                        className="text-xs text-slate-500 bg-white border border-slate-100 rounded-lg px-3 py-1.5"
                     />
                  </View>
                  <Pressable onPress={() => removeSection(sIndex)} className="p-2 bg-rose-50 rounded-lg">
                     <Ionicons name="trash-outline" size={18} color="#e11d48" />
                  </Pressable>
                </View>

                {/* Lectures List */}
                <View className="p-4 bg-slate-50/30">
                  {section.lectures.map((lecture, lIndex) => (
                    <View key={lIndex} className="flex-row items-center mb-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-3">
                        <Text className="text-indigo-600 font-bold text-xs">{lIndex + 1}</Text>
                      </View>
                      <View className="flex-1 mr-2 gap-2">
                        <TextInput 
                          placeholder="Lecture Title" 
                          value={lecture.title} 
                          onChangeText={(t) => updateLecture(sIndex, lIndex, "title", t)}
                          className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-1"
                        />
                         <TextInput 
                          placeholder="Video URL" 
                          value={lecture.videoUrl} 
                          onChangeText={(t) => updateLecture(sIndex, lIndex, "videoUrl", t)}
                          className="text-xs text-slate-400"
                        />
                      </View>
                      <Pressable onPress={() => removeLecture(sIndex, lIndex)} className="p-2">
                         <Ionicons name="close-circle-outline" size={20} color="#cbd5e1" />
                      </Pressable>
                    </View>
                  ))}

                  <Pressable onPress={() => addLecture(sIndex)} className="flex-row items-center justify-center py-3 border border-dashed border-indigo-300 rounded-xl bg-indigo-50/50 mt-2">
                     <Ionicons name="videocam-outline" size={16} color="#4f46e5" />
                     <Text className="text-indigo-600 font-bold text-xs ml-2">Add Lecture</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          {/* --- 3. DETAILS & SETTINGS --- */}
          <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
            <View className="flex-row items-center mb-5 border-b border-slate-50 pb-3">
               <View className="bg-orange-50 p-2 rounded-lg mr-3"><Ionicons name="settings-outline" size={20} color="#f97316" /></View>
               <Text className="text-lg font-bold text-slate-800">Details & Settings</Text>
            </View>

            <InputField label="What You Will Learn" value={form.whatYouWillLearn} onChange={(t: string) => updateField("whatYouWillLearn", t)} multiline />
            <InputField label="Requirements" value={form.requirements} onChange={(t: string) => updateField("requirements", t)} />
            <InputField label="Target Audience" value={form.targetAudience} onChange={(t: string) => updateField("targetAudience", t)} />
            
            <View className="h-[1px] bg-slate-100 my-4" />
            
            <InputField label="Thumbnail URL" value={form.thumbnailUrl} onChange={(t: string) => updateField("thumbnailUrl", t)} placeholder="https://..." />
            <InputField label="Preview Video URL" value={form.previewVideoUrl} onChange={(t: string) => updateField("previewVideoUrl", t)} placeholder="https://..." />
            <InputField label="Library ID (Internal)" value={form.libraryId} onChange={(t: string) => updateField("libraryId", t)} />
            
            <View className="mt-4 gap-4">
              <View className="flex-row items-center justify-between bg-slate-50 p-3 rounded-xl">
                 <Text className="font-bold text-slate-600 ml-2">Is this a Free Course?</Text>
                 <Switch 
                   trackColor={{ false: "#cbd5e1", true: "#10b981" }}
                   thumbColor={"#fff"}
                   value={form.isFree} 
                   onValueChange={(v) => updateField("isFree", v)} 
                 />
              </View>
              <View className="flex-row items-center justify-between bg-slate-50 p-3 rounded-xl">
                 <Text className="font-bold text-slate-600 ml-2">Publish Immediately?</Text>
                 <Switch 
                   trackColor={{ false: "#cbd5e1", true: "#4f46e5" }}
                   thumbColor={"#fff"}
                   value={form.isPublished} 
                   onValueChange={(v) => updateField("isPublished", v)} 
                 />
              </View>
            </View>
          </View>

          {/* --- SUBMIT BUTTON --- */}
          <Pressable 
            onPress={handleSubmit} 
            disabled={loading}
            style={{
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: "center",
              shadowColor: "#6366f1",
              shadowOpacity: 0.2,
              shadowRadius: 8,
              backgroundColor: loading ? "#818cf8" : "#4f46e5",
              marginBottom: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18, letterSpacing: 1 }}>
                Create Course
              </Text>
            )}
          </Pressable>

          {/* --- SUBMIT MESSAGE --- */}
          {submitMessage && (
            <View style={{ marginTop: 8, alignItems: "center" }}>
              <Text style={{
                color: submitMessageType === "success" ? "#16a34a" : "#dc2626",
                fontWeight: "bold",
                fontSize: 16,
              }}>
                {submitMessage}
              </Text>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}