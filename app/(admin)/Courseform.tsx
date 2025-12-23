import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { FieldArray, Formik } from "formik";
import React from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    View,
    useWindowDimensions
} from "react-native";
import * as Yup from "yup";

// --- VALIDATION SCHEMA ---
const CourseSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  subtitle: Yup.string().required("Subtitle is required"),
  description: Yup.string().required("Description is required"),
  price: Yup.number().min(0, "Price must be positive").required("Price is required"),
  language: Yup.string().required("Language is required"),
  level: Yup.string().required("Level is required"),
  thumbnailUrl: Yup.string().url("Must be a valid URL").required("Thumbnail URL is required"),
  previewVideoUrl: Yup.string().url("Must be a valid URL").nullable(),
  whatYouWillLearn: Yup.string().required("Learning outcomes required"),
  requirements: Yup.string().required("Requirements required"),
  targetAudience: Yup.string().required("Target audience required"),
  categoryId: Yup.number().required("Category is required"),
  sections: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required("Section title required"),
      description: Yup.string().required("Section description required"),
      orderIndex: Yup.number().required("Order required"),
      lectures: Yup.array().of(
        Yup.object().shape({
          title: Yup.string().required("Lecture title required"),
          description: Yup.string().required("Lecture description required"),
          durationSeconds: Yup.number().min(1, "Duration must be > 0").required("Duration required"),
          orderIndex: Yup.number().required("Order required"),
          // videoLibraryId & videoGuid are populated via API, but we validate them to ensure video is linked
          videoLibraryId: Yup.number().required("Video not linked"),
          videoGuid: Yup.string().required("Video not linked"),
        })
      )
    })
  )
});

// --- INITIAL VALUES ---
const initialValues = {
  title: "",
  subtitle: "",
  description: "",
  price: 0,
  language: "English",
  level: "Beginner",
  libraryId: "lib_default", // Default or generated
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
      title: "",
      description: "",
      orderIndex: 1,
      lectures: []
    }
  ]
};

// --- API CONFIG ---
// Note: Using the IP provided in the files. 
// If you meant 196.168... please update, but 192.168... is standard for local networks.
const API_BASE_URL = "http://192.168.0.249:8088/api"; 

export default function CourseForm() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // --- VIDEO LINKING HANDLER ---
  const handleLinkVideo = async (lecture: any, setFieldValue: any, sectionIdx: number, lectureIdx: number) => {
    if (!lecture.title || !lecture.durationSeconds) {
      Alert.alert("Validation", "Please enter Lecture Title and Duration before linking.");
      return;
    }

    try {
      // Sending payload as requested
      const payload = {
        ...lecture,
        // If courseId is needed by the backend for linking but the course isn't created yet,
        // you might need to send 0 or a temp ID. 
        courseId: 0, 
      };

      const res = await axios.post(`${API_BASE_URL}/videos/link`, payload);
      
      if (res.data) {
        setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].videoLibraryId`, res.data.videoLibraryId);
        setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].videoGuid`, res.data.videoGuid);
        Alert.alert("Success", "Video Linked Successfully!");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to link video. Check server connection.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* HEADER */}
      <View className="bg-white px-6 py-4 border-b border-slate-200 flex-row items-center justify-between shadow-sm z-10">
        <Pressable 
            onPress={() => router.push("/(admin)/Courses")}
            className="flex-row items-center bg-slate-100 px-3 py-2 rounded-lg active:bg-slate-200"
        >
          <Ionicons name="arrow-back" size={20} color="#475569" />
          <Text className="ml-2 font-bold text-slate-700">Back to Courses</Text>
        </Pressable>
        <Text className="text-xl font-extrabold text-slate-800">Create New Course</Text>
        <View style={{ width: 100 }} /> 
      </View>

      <ScrollView contentContainerStyle={{ padding: isDesktop ? 40 : 20, paddingBottom: 100 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={CourseSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              console.log("Submitting Course:", values);
              await axios.post(`${API_BASE_URL}/courses`, values);
              Alert.alert("Success", "Course created successfully!", [
                { text: "OK", onPress: () => router.push("/(admin)/Courses") }
              ]);
              resetForm();
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to create course. Please try again.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting }) => (
            <View className={`mx-auto ${isDesktop ? 'max-w-5xl w-full' : 'w-full'}`}>
              
              {/* --- 1. BASIC INFORMATION --- */}
              <View className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <Text className="text-lg font-bold text-slate-800 mb-4 flex-row items-center">
                    <Ionicons name="information-circle" size={20} color="#4f46e5" /> Basic Information
                </Text>

                <View className="flex-row flex-wrap gap-4">
                  <FormField label="Course Title *" placeholder="e.g. Spring Boot Masterclass" value={values.title} onChangeText={handleChange("title")} onBlur={handleBlur("title")} error={touched.title && errors.title} width={isDesktop ? "48%" : "100%"} />
                  <FormField label="Subtitle *" placeholder="e.g. Build Enterprise Applications" value={values.subtitle} onChangeText={handleChange("subtitle")} onBlur={handleBlur("subtitle")} error={touched.subtitle && errors.subtitle} width={isDesktop ? "48%" : "100%"} />
                  
                  <FormField label="Description *" placeholder="Detailed course description..." value={values.description} onChangeText={handleChange("description")} onBlur={handleBlur("description")} error={touched.description && errors.description} multiline width="100%" height={100} />
                  
                  <FormField label="Price ($) *" placeholder="99.99" value={values.price?.toString()} onChangeText={(t) => setFieldValue("price", t === "" ? "" : Number(t))} onBlur={handleBlur("price")} error={touched.price && errors.price} keyboardType="numeric" width={isDesktop ? "23%" : "48%"} />
                  <FormField label="Category ID *" placeholder="1" value={values.categoryId?.toString()} onChangeText={(t) => setFieldValue("categoryId", t === "" ? "" : Number(t))} onBlur={handleBlur("categoryId")} error={touched.categoryId && errors.categoryId} keyboardType="numeric" width={isDesktop ? "23%" : "48%"} />
                  <FormField label="Language *" placeholder="English" value={values.language} onChangeText={handleChange("language")} onBlur={handleBlur("language")} error={touched.language && errors.language} width={isDesktop ? "23%" : "48%"} />
                  <FormField label="Level *" placeholder="Beginner/Intermediate" value={values.level} onChangeText={handleChange("level")} onBlur={handleBlur("level")} error={touched.level && errors.level} width={isDesktop ? "23%" : "48%"} />
                </View>

                {/* Toggles */}
                <View className="flex-row mt-4 gap-6">
                  <Toggle label="Is Free?" value={values.isFree} onChange={() => setFieldValue("isFree", !values.isFree)} />
                  <Toggle label="Published?" value={values.isPublished} onChange={() => setFieldValue("isPublished", !values.isPublished)} />
                </View>
              </View>

              {/* --- 2. MEDIA & DETAILS --- */}
              <View className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <Text className="text-lg font-bold text-slate-800 mb-4 flex-row items-center">
                    <Ionicons name="image" size={20} color="#ec4899" /> Media & Content
                </Text>
                <View className="flex-row flex-wrap gap-4">
                  <FormField label="Thumbnail URL *" placeholder="https://..." value={values.thumbnailUrl} onChangeText={handleChange("thumbnailUrl")} onBlur={handleBlur("thumbnailUrl")} error={touched.thumbnailUrl && errors.thumbnailUrl} width={isDesktop ? "48%" : "100%"} />
                  <FormField label="Preview Video URL" placeholder="https://..." value={values.previewVideoUrl} onChangeText={handleChange("previewVideoUrl")} onBlur={handleBlur("previewVideoUrl")} error={touched.previewVideoUrl && errors.previewVideoUrl} width={isDesktop ? "48%" : "100%"} />
                  
                  <FormField label="What You Will Learn *" placeholder="Bullet points..." value={values.whatYouWillLearn} onChangeText={handleChange("whatYouWillLearn")} onBlur={handleBlur("whatYouWillLearn")} error={touched.whatYouWillLearn && errors.whatYouWillLearn} multiline width="100%" />
                  <FormField label="Requirements *" placeholder="Prerequisites..." value={values.requirements} onChangeText={handleChange("requirements")} onBlur={handleBlur("requirements")} error={touched.requirements && errors.requirements} width={isDesktop ? "48%" : "100%"} />
                  <FormField label="Target Audience *" placeholder="Who is this for?" value={values.targetAudience} onChangeText={handleChange("targetAudience")} onBlur={handleBlur("targetAudience")} error={touched.targetAudience && errors.targetAudience} width={isDesktop ? "48%" : "100%"} />
                </View>
              </View>

              {/* --- 3. CURRICULUM (SECTIONS & LECTURES) --- */}
              <View className="mb-6">
                <Text className="text-2xl font-bold text-slate-800 mb-4">Curriculum</Text>
                
                <FieldArray name="sections">
                  {({ push, remove }) => (
                    <View>
                      {values.sections.map((section, sectionIdx) => (
                        <View key={sectionIdx} className="bg-white rounded-2xl border border-slate-300 shadow-sm mb-6 overflow-hidden">
                          {/* Section Header */}
                          <View className="bg-slate-50 p-4 border-b border-slate-200 flex-row justify-between items-center">
                            <Text className="font-bold text-indigo-700 text-lg">Section {sectionIdx + 1}</Text>
                            <Pressable onPress={() => remove(sectionIdx)} className="bg-rose-100 p-2 rounded-full">
                                <Ionicons name="trash-outline" size={18} color="#e11d48" />
                            </Pressable>
                          </View>

                          <View className="p-4">
                            <View className="flex-row flex-wrap gap-4 mb-4">
                                <FormField label="Section Title" value={section.title} onChangeText={(t) => setFieldValue(`sections[${sectionIdx}].title`, t)} placeholder="Intro to Spring" width={isDesktop ? "60%" : "100%"} />
                                <FormField label="Order" value={section.orderIndex.toString()} onChangeText={(t) => setFieldValue(`sections[${sectionIdx}].orderIndex`, Number(t))} keyboardType="numeric" width={isDesktop ? "15%" : "48%"} />
                            </View>
                            <FormField label="Description" value={section.description} onChangeText={(t) => setFieldValue(`sections[${sectionIdx}].description`, t)} placeholder="Section summary..." width="100%" />

                            {/* Lectures List */}
                            <Text className="font-bold text-slate-700 mt-6 mb-3">Lectures</Text>
                            <FieldArray name={`sections[${sectionIdx}].lectures`}>
                              {({ push: pushLecture, remove: removeLecture }) => (
                                <View>
                                  {section.lectures.map((lecture, lectureIdx) => (
                                    <View key={lectureIdx} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mb-3">
                                        <View className="flex-row justify-between mb-3">
                                            <Text className="font-bold text-indigo-900 text-xs uppercase tracking-wide">Lecture {lectureIdx + 1}</Text>
                                            <Pressable onPress={() => removeLecture(lectureIdx)}>
                                                <Ionicons name="close-circle" size={20} color="#94a3b8" />
                                            </Pressable>
                                        </View>
                                        
                                        <View className="flex-row flex-wrap gap-3">
                                            <FormField label="Title" value={lecture.title} onChangeText={(t) => setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].title`, t)} width={isDesktop ? "40%" : "100%"} bg="bg-white" />
                                            <FormField label="Duration (Sec)" value={lecture.durationSeconds.toString()} onChangeText={(t) => setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].durationSeconds`, Number(t))} keyboardType="numeric" width={isDesktop ? "15%" : "48%"} bg="bg-white" />
                                            <FormField label="Order" value={lecture.orderIndex.toString()} onChangeText={(t) => setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].orderIndex`, Number(t))} keyboardType="numeric" width={isDesktop ? "15%" : "48%"} bg="bg-white" />
                                            
                                            {/* Preview Toggle */}
                                            <Pressable 
                                                onPress={() => setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].isPreview`, !lecture.isPreview)}
                                                className={`h-12 flex-row items-center px-3 rounded-lg border mt-6 ${lecture.isPreview ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}
                                            >
                                                <Ionicons name={lecture.isPreview ? "checkbox" : "square-outline"} size={20} color={lecture.isPreview ? "#10b981" : "#cbd5e1"} />
                                                <Text className="ml-2 text-xs font-bold text-slate-600">Preview?</Text>
                                            </Pressable>
                                        </View>

                                        <FormField label="Description" value={lecture.description} onChangeText={(t) => setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].description`, t)} width="100%" bg="bg-white" />

                                        {/* Video Link Status & Button */}
                                        <View className="flex-row items-center justify-between mt-4 bg-white p-3 rounded-lg border border-slate-200">
                                            <View>
                                                <Text className="text-[10px] font-bold text-slate-400 uppercase">Video Connection</Text>
                                                {lecture.videoGuid ? (
                                                    <View className="flex-row items-center mt-1">
                                                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                                        <Text className="text-xs text-emerald-600 font-bold ml-1">Linked (ID: {lecture.videoLibraryId})</Text>
                                                    </View>
                                                ) : (
                                                    <View className="flex-row items-center mt-1">
                                                        <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                                                        <Text className="text-xs text-amber-600 font-bold ml-1">Not Linked</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Pressable 
                                                onPress={() => handleLinkVideo(lecture, setFieldValue, sectionIdx, lectureIdx)}
                                                className="bg-indigo-600 px-4 py-2 rounded-lg shadow-sm active:opacity-90"
                                            >
                                                <Text className="text-white text-xs font-bold">
                                                    {lecture.videoGuid ? "Re-Link Video" : "Link Video"}
                                                </Text>
                                            </Pressable>
                                        </View>
                                        {/* Validation Error for Video */}
                                        {/* You can access nested errors here if needed */}
                                    </View>
                                  ))}
                                  
                                  {/* Add Lecture Button */}
                                  <Pressable
                                    onPress={() => pushLecture({
                                      title: "", description: "", durationSeconds: 0, isPreview: false,
                                      orderIndex: section.lectures.length + 1, videoLibraryId: 0, videoGuid: ""
                                    })}
                                    className="flex-row items-center justify-center p-3 border border-dashed border-indigo-300 rounded-xl bg-indigo-50 active:bg-indigo-100"
                                  >
                                    <Ionicons name="add" size={18} color="#4338ca" />
                                    <Text className="text-indigo-700 font-bold ml-2 text-sm">Add Lecture</Text>
                                  </Pressable>
                                </View>
                              )}
                            </FieldArray>
                          </View>
                        </View>
                      ))}

                      {/* Add Section Button */}
                      <Pressable
                        onPress={() => push({ title: "", description: "", orderIndex: values.sections.length + 1, lectures: [] })}
                        className="flex-row items-center justify-center p-4 bg-slate-800 rounded-xl shadow-lg active:bg-slate-900"
                      >
                        <Ionicons name="add-circle" size={24} color="white" />
                        <Text className="text-white font-bold ml-2 text-base">Add New Section</Text>
                      </Pressable>
                    </View>
                  )}
                </FieldArray>
              </View>

              {/* --- SUBMIT BUTTON --- */}
              <View className="mb-20">
                  <Pressable
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl items-center shadow-md flex-row justify-center ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                  >
                    {isSubmitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-done" size={24} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">Create Course</Text>
                        </>
                    )}
                  </Pressable>
              </View>

            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- REUSABLE COMPONENTS ---

const FormField = ({ label, value, onChangeText, onBlur, placeholder, error, multiline, keyboardType, width = "100%", height, bg = "bg-slate-50" }: any) => (
  <View style={{ width: width, marginBottom: 12 }}>
    <Text className="text-xs font-bold text-slate-500 mb-1.5 ml-1 uppercase">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
      placeholderTextColor="#94a3b8"
      className={`${bg} border ${error ? 'border-rose-300' : 'border-slate-200'} text-slate-800 text-sm rounded-xl px-3 py-3 ${multiline ? 'text-top' : ''}`}
      style={height ? { height } : {}}
    />
    {error && <Text className="text-rose-500 text-[10px] font-bold mt-1 ml-1">{error}</Text>}
  </View>
);

const Toggle = ({ label, value, onChange }: any) => (
  <Pressable onPress={onChange} className="flex-row items-center bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm">
    <Ionicons name={value ? "checkbox" : "square-outline"} size={22} color={value ? "#4f46e5" : "#cbd5e1"} />
    <Text className={`ml-2 font-bold ${value ? 'text-indigo-700' : 'text-slate-500'}`}>{label}</Text>
  </Pressable>
);