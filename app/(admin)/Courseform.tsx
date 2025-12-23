import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import { FieldArray, Formik } from "formik";
import React from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, useWindowDimensions, View } from "react-native";
import * as Yup from "yup";

// --- Validation Schema ---
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
      orderIndex: Yup.number().min(1).required("Order required"),
      lectures: Yup.array().of(
        Yup.object().shape({
          title: Yup.string().required("Lecture title required"),
          description: Yup.string().required("Lecture description required"),
          durationSeconds: Yup.number().min(1).required("Duration required"),
          isPreview: Yup.boolean(),
          orderIndex: Yup.number().min(1).required("Order required"),
          videoLibraryId: Yup.number().required("Video Library ID required"),
          videoGuid: Yup.string().required("Video GUID required"),
        })
      )
    })
  )
});

const initialValues = {
  title: "",
  subtitle: "",
  description: "",
  price: 0,
  language: "",
  level: "",
  libraryId: "",
  thumbnailUrl: "",
  previewVideoUrl: "",
  whatYouWillLearn: "",
  requirements: "",
  targetAudience: "",
  categoryId: 0,
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

export default function CourseForm() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  // --- Add Video Helper ---
  const addVideo = async (lecture, setFieldValue, sectionIdx, lectureIdx) => {
    try {
      const res = await axios.post("http://192.168.0.249:8088/api/videos/link", lecture);
      setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].videoLibraryId`, res.data.videoLibraryId);
      setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].videoGuid`, res.data.videoGuid);
      Alert.alert("Success", "Video linked successfully!");
    } catch (err) {
      Alert.alert("Error", "Failed to link video.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: isDesktop ? 40 : 16, maxWidth: 900, alignSelf: "center" }}>
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 24, alignSelf: "flex-start" }}
        >
          <Ionicons name="arrow-back" size={22} color="#4338ca" />
          <Text style={{ marginLeft: 8, color: "#4338ca", fontWeight: "bold", fontSize: 16 }}>Back to Courses</Text>
        </Pressable>

        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0f172a", marginBottom: 24 }}>Create New Course</Text>

        <Formik
          initialValues={initialValues}
          validationSchema={CourseSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              await axios.post("http://192.168.0.249:8088/api/courses", values);
              Alert.alert("Success", "Course created successfully!");
              resetForm();
              router.back();
            } catch (err) {
              Alert.alert("Error", "Failed to create course.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting }) => (
            <View>
              {/* --- Main Fields --- */}
              <View style={isDesktop ? { flexDirection: "row", gap: 32 } : {}}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    placeholder="Title *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.title}
                    onChangeText={handleChange("title")}
                    onBlur={handleBlur("title")}
                  />
                  {touched.title && errors.title && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.title}</Text>}

                  <TextInput
                    placeholder="Subtitle *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.subtitle}
                    onChangeText={handleChange("subtitle")}
                    onBlur={handleBlur("subtitle")}
                  />
                  {touched.subtitle && errors.subtitle && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.subtitle}</Text>}

                  <TextInput
                    placeholder="Description *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.description}
                    onChangeText={handleChange("description")}
                    onBlur={handleBlur("description")}
                    multiline
                  />
                  {touched.description && errors.description && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.description}</Text>}

                  <TextInput
                    placeholder="Price *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.price?.toString()}
                    onChangeText={text => setFieldValue("price", text === "" ? 0 : Number(text))}
                    onBlur={handleBlur("price")}
                    keyboardType="numeric"
                  />
                  {touched.price && errors.price && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.price}</Text>}

                  <TextInput
                    placeholder="Language *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.language}
                    onChangeText={handleChange("language")}
                    onBlur={handleBlur("language")}
                  />
                  {touched.language && errors.language && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.language}</Text>}

                  <TextInput
                    placeholder="Level *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.level}
                    onChangeText={handleChange("level")}
                    onBlur={handleBlur("level")}
                  />
                  {touched.level && errors.level && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.level}</Text>}

                  <TextInput
                    placeholder="Thumbnail URL *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.thumbnailUrl}
                    onChangeText={handleChange("thumbnailUrl")}
                    onBlur={handleBlur("thumbnailUrl")}
                  />
                  {touched.thumbnailUrl && errors.thumbnailUrl && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.thumbnailUrl}</Text>}

                  <TextInput
                    placeholder="Preview Video URL"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.previewVideoUrl}
                    onChangeText={handleChange("previewVideoUrl")}
                    onBlur={handleBlur("previewVideoUrl")}
                  />
                  {touched.previewVideoUrl && errors.previewVideoUrl && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.previewVideoUrl}</Text>}

                  <TextInput
                    placeholder="What You Will Learn *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.whatYouWillLearn}
                    onChangeText={handleChange("whatYouWillLearn")}
                    onBlur={handleBlur("whatYouWillLearn")}
                  />
                  {touched.whatYouWillLearn && errors.whatYouWillLearn && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.whatYouWillLearn}</Text>}

                  <TextInput
                    placeholder="Requirements *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.requirements}
                    onChangeText={handleChange("requirements")}
                    onBlur={handleBlur("requirements")}
                  />
                  {touched.requirements && errors.requirements && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.requirements}</Text>}

                  <TextInput
                    placeholder="Target Audience *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.targetAudience}
                    onChangeText={handleChange("targetAudience")}
                    onBlur={handleBlur("targetAudience")}
                  />
                  {touched.targetAudience && errors.targetAudience && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.targetAudience}</Text>}

                  <TextInput
                    placeholder="Category ID *"
                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                    value={values.categoryId?.toString()}
                    onChangeText={text => setFieldValue("categoryId", text === "" ? 0 : Number(text))}
                    onBlur={handleBlur("categoryId")}
                    keyboardType="numeric"
                  />
                  {touched.categoryId && errors.categoryId && <Text style={{ color: "#e11d48", fontSize: 12, marginBottom: 8 }}>{errors.categoryId}</Text>}

                  {/* Switches for isFree and isPublished */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 8 }}>
                    <Pressable onPress={() => setFieldValue("isFree", !values.isFree)} style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name={values.isFree ? "checkbox" : "square-outline"} size={20} color="#4f46e5" />
                      <Text style={{ marginLeft: 8, color: "#334155" }}>Free</Text>
                    </Pressable>
                    <Pressable onPress={() => setFieldValue("isPublished", !values.isPublished)} style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name={values.isPublished ? "checkbox" : "square-outline"} size={20} color="#4f46e5" />
                      <Text style={{ marginLeft: 8, color: "#334155" }}>Published</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* --- Sections & Lectures --- */}
              <FieldArray name="sections">
                {({ push, remove }) => (
                  <View style={{ marginTop: 32 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 16 }}>Sections</Text>
                    {values.sections.map((section, sectionIdx) => (
                      <View key={sectionIdx} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <Text style={{ fontWeight: "bold", color: "#4338ca" }}>Section {sectionIdx + 1}</Text>
                          {values.sections.length > 1 && (
                            <Pressable onPress={() => remove(sectionIdx)}>
                              <Ionicons name="trash-outline" size={18} color="#e11d48" />
                            </Pressable>
                          )}
                        </View>
                        <TextInput
                          placeholder="Section Title *"
                          style={{ backgroundColor: "#f1f5f9", borderRadius: 8, padding: 8, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                          value={section.title}
                          onChangeText={text => setFieldValue(`sections[${sectionIdx}].title`, text)}
                        />
                        <TextInput
                          placeholder="Section Description *"
                          style={{ backgroundColor: "#f1f5f9", borderRadius: 8, padding: 8, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                          value={section.description}
                          onChangeText={text => setFieldValue(`sections[${sectionIdx}].description`, text)}
                        />
                        <TextInput
                          placeholder="Order Index *"
                          style={{ backgroundColor: "#f1f5f9", borderRadius: 8, padding: 8, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}
                          value={section.orderIndex?.toString()}
                          onChangeText={text => setFieldValue(`sections[${sectionIdx}].orderIndex`, text === "" ? 1 : Number(text))}
                          keyboardType="numeric"
                        />

                        {/* Lectures */}
                        <FieldArray name={`sections[${sectionIdx}].lectures`}>
                          {({ push: pushLecture, remove: removeLecture }) => (
                            <View>
                              <Text style={{ fontWeight: "bold", color: "#334155", marginTop: 8, marginBottom: 8 }}>Lectures</Text>
                              {section.lectures.map((lecture, lectureIdx) => (
                                <View key={lectureIdx} style={{ backgroundColor: "#eef2ff", borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#c7d2fe" }}>
                                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                    <Text style={{ fontWeight: "bold", fontSize: 12, color: "#3730a3" }}>Lecture {lectureIdx + 1}</Text>
                                    <Pressable onPress={() => removeLecture(lectureIdx)}>
                                      <Ionicons name="trash-outline" size={16} color="#e11d48" />
                                    </Pressable>
                                  </View>
                                  <TextInput
                                    placeholder="Lecture Title *"
                                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 8, marginBottom: 4, borderWidth: 1, borderColor: "#e2e8f0" }}
                                    value={lecture.title}
                                    onChangeText={text => setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].title`, text)}
                                  />
                                  <TextInput
                                    placeholder="Lecture Description *"
                                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 8, marginBottom: 4, borderWidth: 1, borderColor: "#e2e8f0" }}
                                    value={lecture.description}
                                    onChangeText={text => setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].description`, text)}
                                  />
                                  <TextInput
                                    placeholder="Duration (seconds) *"
                                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 8, marginBottom: 4, borderWidth: 1, borderColor: "#e2e8f0" }}
                                    value={lecture.durationSeconds?.toString() || ""}
                                    onChangeText={text => setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].durationSeconds`, text === "" ? 0 : Number(text))}
                                    keyboardType="numeric"
                                  />
                                  <TextInput
                                    placeholder="Order Index *"
                                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 8, marginBottom: 4, borderWidth: 1, borderColor: "#e2e8f0" }}
                                    value={lecture.orderIndex?.toString() || ""}
                                    onChangeText={text => setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].orderIndex`, text === "" ? 1 : Number(text))}
                                    keyboardType="numeric"
                                  />
                                  <Pressable
                                    onPress={() => setFieldValue(`sections[${sectionIdx}].lectures[${lectureIdx}].isPreview`, !lecture.isPreview)}
                                    style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
                                  >
                                    <Ionicons name={lecture.isPreview ? "checkbox" : "square-outline"} size={18} color="#4f46e5" />
                                    <Text style={{ marginLeft: 8, color: "#334155" }}>Preview</Text>
                                  </Pressable>
                                  {/* Video Library ID and GUID (auto-filled after video link) */}
                                  <TextInput
                                    placeholder="Video Library ID (auto)"
                                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 8, marginBottom: 4, borderWidth: 1, borderColor: "#e2e8f0" }}
                                    value={lecture.videoLibraryId?.toString() || ""}
                                    editable={false}
                                  />
                                  <TextInput
                                    placeholder="Video GUID (auto)"
                                    style={{ backgroundColor: "#fff", borderRadius: 8, padding: 8, marginBottom: 4, borderWidth: 1, borderColor: "#e2e8f0" }}
                                    value={lecture.videoGuid || ""}
                                    editable={false}
                                  />
                                  {/* Add Video Button */}
                                  <Pressable
                                    onPress={() => addVideo(lecture, setFieldValue, sectionIdx, lectureIdx)}
                                    style={{ marginTop: 8, backgroundColor: "#4f46e5", borderRadius: 8, paddingVertical: 8, alignItems: "center" }}
                                  >
                                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>Link Video</Text>
                                  </Pressable>
                                </View>
                              ))}
                              <Pressable
                                onPress={() => pushLecture({
                                  title: "",
                                  description: "",
                                  durationSeconds: 0,
                                  isPreview: false,
                                  orderIndex: section.lectures.length + 1,
                                  videoLibraryId: 0,
                                  videoGuid: ""
                                })}
                                style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
                              >
                                <Ionicons name="add-circle-outline" size={18} color="#4f46e5" />
                                <Text style={{ marginLeft: 8, color: "#4338ca", fontWeight: "bold", fontSize: 12 }}>Add Lecture</Text>
                              </Pressable>
                            </View>
                          )}
                        </FieldArray>
                      </View>
                    ))}
                    <Pressable
                      onPress={() => push({
                        title: "",
                        description: "",
                        orderIndex: values.sections.length + 1,
                        lectures: []
                      })}
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons name="add-circle-outline" size={20} color="#4f46e5" />
                      <Text style={{ marginLeft: 8, color: "#4338ca", fontWeight: "bold", fontSize: 16 }}>Add Section</Text>
                    </Pressable>
                  </View>
                )}
              </FieldArray>

              {/* --- Submit Button --- */}
              <Pressable
                onPress={() => handleSubmit()}
                disabled={isSubmitting}
                style={{ marginTop: 32, backgroundColor: "#4f46e5", borderRadius: 16, paddingVertical: 16, alignItems: "center", opacity: isSubmitting ? 0.7 : 1 }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>Create Course</Text>
              </Pressable>
            </View>
          )}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
}