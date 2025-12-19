import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "../globals.css";

type Lecture = {
  title: string;
  description?: string;
  orderIndex?: number;
  durationSeconds?: number;
  isPreview?: boolean;
  videoProvider?: string;
  videoUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
  embedCode?: string;
};

type Section = {
  title: string;
  description?: string;
  orderIndex?: number;
  lectures: Lecture[];
};

type Course = {
  title: string;
  subtitle?: string;
  description?: string;
  price?: number;
  language?: string;
  level?: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  whatYouWillLearn?: string;
  requirements?: string;
  targetAudience?: string;
  categoryId?: number;
  sections?: Section[];
  createdAt?: string;
};

type CourseForm = Omit<Course, "price" | "categoryId"> & {
  price: string;
  categoryId: string;
};

const sampleCourses: Course[] = [
  {
    title: "Spring Boot Masterclass",
    subtitle: "Build Enterprise Applications",
    description: "Complete guide to Spring Boot...",
    price: 99.99,
    language: "English",
    level: "INTERMEDIATE",
    thumbnailUrl: "https://example.com/course.jpg",
    previewVideoUrl: "https://youtube.com/watch?v=abc123",
    whatYouWillLearn: "Spring Boot, REST APIs, Security",
    requirements: "Java basics",
    targetAudience: "Developers",
    categoryId: 1,
    sections: [
      {
        title: "Introduction",
        description: "Getting started",
        orderIndex: 1,
        lectures: [
          {
            title: "What is Spring Boot?",
            description: "Introduction lecture",
            orderIndex: 1,
            durationSeconds: 1200,
            isPreview: true,
            videoProvider: "YOUTUBE",
            videoUrl: "https://youtube.com/watch?v=xyz789",
            videoId: "xyz789",
            thumbnailUrl: "https://img.youtube.com/vi/xyz789/maxresdefault.jpg",
            embedCode: '<iframe src="https://www.youtube.com/embed/xyz789"></iframe>',
          },
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  },
];

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString() +
      " " +
      new Date(iso).toLocaleTimeString()
    : "";

export default function Courses(): JSX.Element {
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const defaultForm: CourseForm = {
    title: "",
    subtitle: "",
    description: "",
    price: "99.99",
    language: "English",
    level: "INTERMEDIATE",
    thumbnailUrl: "https://example.com/course.jpg",
    previewVideoUrl: "https://youtube.com/watch?v=abc123",
    whatYouWillLearn: "Spring Boot, REST APIs, Security",
    requirements: "Java basics",
    targetAudience: "Developers",
    categoryId: "1",
  };

  // form stores simple top-level fields + nested sections stored separately
  const [form, setForm] = useState<Partial<CourseForm>>({ ...defaultForm });
  const [formSections, setFormSections] = useState<Section[]>(
    sampleCourses[0].sections ?? [
      {
        title: "Introduction",
        description: "Getting started",
        orderIndex: 1,
        lectures: [
          {
            title: "What is Spring Boot?",
            description: "Introduction lecture",
            orderIndex: 1,
            durationSeconds: 1200,
            isPreview: true,
            videoProvider: "YOUTUBE",
            videoUrl: "https://youtube.com/watch?v=xyz789",
            videoId: "xyz789",
            thumbnailUrl: "https://img.youtube.com/vi/xyz789/maxresdefault.jpg",
            embedCode: '<iframe src="https://www.youtube.com/embed/xyz789"></iframe>',
          },
        ],
      },
    ]
  );

  const { width } = useWindowDimensions();
  const columns = useMemo(() => {
    if (width >= 1100) return 3;
    if (width >= 720) return 2;
    return 1;
  }, [width]);

  const openCreate = () => {
    setEditingIndex(null);
    setForm({ ...defaultForm });
    setFormSections([
      {
        title: "Introduction",
        description: "Getting started",
        orderIndex: 1,
        lectures: [
          {
            title: "What is Spring Boot?",
            description: "Introduction lecture",
            orderIndex: 1,
            durationSeconds: 1200,
            isPreview: true,
            videoProvider: "YOUTUBE",
            videoUrl: "https://youtube.com/watch?v=xyz789",
            videoId: "xyz789",
            thumbnailUrl: "https://img.youtube.com/vi/xyz789/maxresdefault.jpg",
            embedCode: '<iframe src="https://www.youtube.com/embed/xyz789"></iframe>',
          },
        ],
      },
    ]);
    setModalVisible(true);
  };

  const openEdit = (index: number) => {
    const c = courses[index];
    setEditingIndex(index);
    setForm({
      title: c.title,
      subtitle: c.subtitle,
      description: c.description,
      price: c.price?.toString() ?? "0",
      language: c.language ?? "English",
      level: c.level ?? "INTERMEDIATE",
      thumbnailUrl: c.thumbnailUrl ?? "",
      previewVideoUrl: c.previewVideoUrl ?? "",
      whatYouWillLearn: c.whatYouWillLearn ?? "",
      requirements: c.requirements ?? "",
      targetAudience: c.targetAudience ?? "",
      categoryId: (c.categoryId ?? 0).toString(),
    });
    setFormSections(c.sections ? JSON.parse(JSON.stringify(c.sections)) : []);
    setModalVisible(true);
  };

  const handleDelete = (index: number) => {
    Alert.alert("Delete Course", "Are you sure you want to delete this course?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setCourses((prev) => prev.filter((_, i) => i !== index)),
      },
    ]);
  };

  const handleSave = async () => {
    // Basic validation
    if (!form.title) {
      Alert.alert("Validation", "Please provide the course title.");
      return;
    }

    const payload: Course = {
      title: String(form.title),
      subtitle: String(form.subtitle ?? ""),
      description: String(form.description ?? ""),
      price: parseFloat(String(form.price ?? "0")) || 0,
      language: String(form.language ?? ""),
      level: String(form.level ?? ""),
      thumbnailUrl: String(form.thumbnailUrl ?? ""),
      previewVideoUrl: String(form.previewVideoUrl ?? ""),
      whatYouWillLearn: String(form.whatYouWillLearn ?? ""),
      requirements: String(form.requirements ?? ""),
      targetAudience: String(form.targetAudience ?? ""),
      categoryId: parseInt(String(form.categoryId ?? "0")) || 0,
      sections: (formSections ?? []).map((s) => ({
        title: s.title,
        description: s.description,
        orderIndex: s.orderIndex ? Number(s.orderIndex) : undefined,
        lectures: (s.lectures ?? []).map((l) => ({
          title: l.title,
          description: l.description,
          orderIndex: l.orderIndex ? Number(l.orderIndex) : undefined,
          durationSeconds: l.durationSeconds ? Number(l.durationSeconds) : undefined,
          isPreview: Boolean(l.isPreview),
          videoProvider: l.videoProvider,
          videoUrl: l.videoUrl,
          videoId: l.videoId,
          thumbnailUrl: l.thumbnailUrl,
          embedCode: l.embedCode,
        })),
      })),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://192.168.0.230:8088/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        Alert.alert("Error", `Server responded with ${res.status}: ${text}`);
        return;
      }

      const created = (await res.json()) as Course;

      if (editingIndex !== null) {
        setCourses((prev) => prev.map((p, i) => (i === editingIndex ? created : p)));
      } else {
        setCourses((prev) => [created, ...prev]);
      }

      setModalVisible(false);
      setEditingIndex(null);
      Alert.alert("Success", "Course saved successfully.");
    } catch (err: any) {
      Alert.alert("Network Error", err.message || String(err));
    }
  };

  // Section / Lecture helpers (operate on formSections state)
  const updateSection = (idx: number, patch: Partial<Section>) => {
    setFormSections((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };
  const updateLecture = (sIdx: number, lIdx: number, patch: Partial<Lecture>) => {
    setFormSections((prev) => {
      const copy = [...prev];
      const section = copy[sIdx] ?? { title: "", lectures: [] } as Section;
      const lectures = [...(section.lectures ?? [])];
      lectures[lIdx] = { ...lectures[lIdx], ...patch };
      copy[sIdx] = { ...section, lectures };
      return copy;
    });
  };
  const addSection = () => {
    setFormSections((prev) => [
      ...prev,
      { title: "New Section", description: "", orderIndex: prev.length + 1, lectures: [] },
    ]);
  };
  const addLecture = (sIdx: number) => {
    setFormSections((prev) => {
      const copy = [...prev];
      const section = copy[sIdx] ?? { title: "", lectures: [] } as Section;
      section.lectures = [...(section.lectures ?? []), { title: "New Lecture", orderIndex: (section.lectures?.length ?? 0) + 1 }];
      copy[sIdx] = section;
      return copy;
    });
  };

  // Layout math
  const gap = 16;
  const outerPadding = 16 * 2;
  const cardWidth = Math.max(260, (width - outerPadding - gap * (columns - 1)) / columns);

  return (
    <SafeAreaView className="flex-1 bg-sky-50">
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-sky-700">Courses</Text>
            <Text className="text-sm text-sky-500">Manage course catalogue (full JSON)</Text>
          </View>
          <Pressable onPress={openCreate} className="flex-row items-center bg-sky-600 px-4 py-2 rounded-md shadow" style={{ elevation: 2 }}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text className="text-white font-semibold ml-2">Create Course</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap }} className="justify-start">
            {courses.map((c, idx) => (
              <View key={`${c.title}-${idx}`} className="bg-white rounded-xl p-3 shadow" style={{ width: cardWidth, marginBottom: gap }}>
                <View className="h-40 mb-3 rounded-md overflow-hidden bg-sky-100 items-center justify-center">
                  {c.thumbnailUrl ? (
                    <Image source={{ uri: c.thumbnailUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  ) : (
                    <Text className="text-sky-400 text-6xl">🎓</Text>
                  )}
                </View>

                <Text className="text-lg font-bold text-sky-700">{c.title}</Text>
                <Text className="text-xs text-sky-400 mt-1 mb-2">{c.subtitle}</Text>

                <Text className="text-sm text-sky-600 mb-3" numberOfLines={3}>
                  {c.description}
                </Text>

                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-sm text-sky-500">Price</Text>
                    <Text className="text-md font-semibold text-sky-700">{c.price ? `$${c.price.toFixed(2)}` : "Free"}</Text>
                  </View>
                  <Text className="text-xs text-gray-400">{formatDate(c.createdAt)}</Text>
                </View>

                <View className="flex-row justify-between">
                  <Pressable onPress={() => openEdit(idx)} className="flex-row items-center px-3 py-2 bg-sky-100 rounded-md">
                    <Ionicons name="pencil-outline" size={16} color="#0ea5e9" />
                    <Text className="ml-2 text-sky-700 font-semibold">Edit</Text>
                  </Pressable>

                  <Pressable onPress={() => handleDelete(idx)} className="flex-row items-center px-3 py-2 bg-red-50 rounded-md">
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                    <Text className="ml-2 text-red-600 font-semibold">Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <Modal animationType="slide" visible={modalVisible} transparent>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end bg-black bg-opacity-40">
            <View className="bg-white rounded-t-xl p-4" style={{ maxHeight: "90%" }}>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-sky-700">{editingIndex !== null ? "Edit Course" : "Add Course"}</Text>
                <Pressable onPress={() => { setModalVisible(false); setEditingIndex(null); }}>
                  <Ionicons name="close" size={22} color="#374151" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-xs text-sky-500 mb-1">Title</Text>
                <TextInput value={String(form.title ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, title: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="Spring Boot Masterclass" />

                <Text className="text-xs text-sky-500 mb-1">Subtitle</Text>
                <TextInput value={String(form.subtitle ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, subtitle: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="Build Enterprise Applications" />

                <Text className="text-xs text-sky-500 mb-1">Description</Text>
                <TextInput value={String(form.description ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, description: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="Complete guide..." multiline numberOfLines={3} textAlignVertical="top" />

                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-xs text-sky-500 mb-1">Price (USD)</Text>
                    <TextInput value={String(form.price ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, price: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="99.99" keyboardType={Platform.OS === "web" ? "default" : "numeric"} />
                  </View>
                  <View style={{ width: 120 }}>
                    <Text className="text-xs text-sky-500 mb-1">Category ID</Text>
                    <TextInput value={String(form.categoryId ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, categoryId: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="1" keyboardType={Platform.OS === "web" ? "default" : "numeric"} />
                  </View>
                </View>

                <Text className="text-xs text-sky-500 mb-1">Language</Text>
                <TextInput value={String(form.language ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, language: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="English" />

                <Text className="text-xs text-sky-500 mb-1">Level</Text>
                <TextInput value={String(form.level ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, level: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="INTERMEDIATE" />

                <Text className="text-xs text-sky-500 mb-1">Thumbnail URL</Text>
                <TextInput value={String(form.thumbnailUrl ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, thumbnailUrl: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="https://example.com/course.jpg" />

                <Text className="text-xs text-sky-500 mb-1">Preview Video URL</Text>
                <TextInput value={String(form.previewVideoUrl ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, previewVideoUrl: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="https://youtube.com/watch?v=abc123" />

                <Text className="text-xs text-sky-500 mb-1">What You Will Learn</Text>
                <TextInput value={String(form.whatYouWillLearn ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, whatYouWillLearn: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="Spring Boot, REST APIs, Security" />

                <Text className="text-xs text-sky-500 mb-1">Requirements</Text>
                <TextInput value={String(form.requirements ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, requirements: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="Java basics" />

                <Text className="text-xs text-sky-500 mb-1">Target Audience</Text>
                <TextInput value={String(form.targetAudience ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, targetAudience: v }))} className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50" placeholder="Developers" />

                {/* Sections editor (supports multiple sections and lectures) */}
                <View className="mt-3 mb-2">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-semibold text-sky-700">Sections & Lectures</Text>
                    <Pressable onPress={addSection} className="px-3 py-1 bg-sky-600 rounded-md">
                      <Text className="text-white">Add Section</Text>
                    </Pressable>
                  </View>

                  {formSections.map((s, sIdx) => (
                    <View key={`sec-${sIdx}`} className="mb-4 p-3 bg-gray-50 rounded-md">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-semibold text-sky-700">Section {sIdx + 1}</Text>
                        <Text className="text-xs text-gray-400">order: {s.orderIndex ?? sIdx + 1}</Text>
                      </View>

                      <Text className="text-xs text-sky-500 mb-1">Title</Text>
                      <TextInput value={String(s.title ?? "")} onChangeText={(v) => updateSection(sIdx, { title: v })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-white" />

                      <Text className="text-xs text-sky-500 mb-1">Description</Text>
                      <TextInput value={String(s.description ?? "")} onChangeText={(v) => updateSection(sIdx, { description: v })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-white" />

                      <Text className="text-xs text-sky-500 mb-1">Order Index</Text>
                      <TextInput value={String(s.orderIndex ?? "")} onChangeText={(v) => updateSection(sIdx, { orderIndex: Number(v) || 0 })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-white" keyboardType={Platform.OS === "web" ? "default" : "numeric"} />

                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm font-medium">Lectures ({s.lectures?.length ?? 0})</Text>
                        <Pressable onPress={() => addLecture(sIdx)} className="px-2 py-1 bg-sky-600 rounded-md">
                          <Text className="text-white text-xs">Add Lecture</Text>
                        </Pressable>
                      </View>

                      {(s.lectures ?? []).map((l, lIdx) => (
                        <View key={`lec-${sIdx}-${lIdx}`} className="mb-3 p-2 bg-white rounded-md">
                          <Text className="text-xs text-sky-500 mb-1">Lecture Title</Text>
                          <TextInput value={String(l.title ?? "")} onChangeText={(v) => updateLecture(sIdx, lIdx, { title: v })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-gray-50" />

                          <Text className="text-xs text-sky-500 mb-1">Description</Text>
                          <TextInput value={String(l.description ?? "")} onChangeText={(v) => updateLecture(sIdx, lIdx, { description: v })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-gray-50" />

                          <Text className="text-xs text-sky-500 mb-1">Order Index</Text>
                          <TextInput value={String(l.orderIndex ?? "")} onChangeText={(v) => updateLecture(sIdx, lIdx, { orderIndex: Number(v) || 0 })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-gray-50" keyboardType={Platform.OS === "web" ? "default" : "numeric"} />

                          <Text className="text-xs text-sky-500 mb-1">Duration (seconds)</Text>
                          <TextInput value={String(l.durationSeconds ?? "")} onChangeText={(v) => updateLecture(sIdx, lIdx, { durationSeconds: Number(v) || 0 })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-gray-50" keyboardType={Platform.OS === "web" ? "default" : "numeric"} />

                          <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-xs text-sky-500">Is Preview</Text>
                            <Switch value={Boolean(l.isPreview)} onValueChange={(v) => updateLecture(sIdx, lIdx, { isPreview: v })} trackColor={{ true: "#bae6fd", false: "#e5e7eb" }} thumbColor={l.isPreview ? "#0ea5e9" : undefined} />
                          </View>

                          <Text className="text-xs text-sky-500 mb-1">Video Provider</Text>
                          <TextInput value={String(l.videoProvider ?? "")} onChangeText={(v) => updateLecture(sIdx, lIdx, { videoProvider: v })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-gray-50" placeholder="YOUTUBE" />

                          <Text className="text-xs text-sky-500 mb-1">Video URL</Text>
                          <TextInput value={String(l.videoUrl ?? "")} onChangeText={(v) => updateLecture(sIdx, lIdx, { videoUrl: v })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-gray-50" placeholder="https://youtube.com/watch?v=xyz789" />

                          <Text className="text-xs text-sky-500 mb-1">Video ID</Text>
                          <TextInput value={String(l.videoId ?? "")} onChangeText={(v) => updateLecture(sIdx, lIdx, { videoId: v })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-gray-50" placeholder="xyz789" />

                          <Text className="text-xs text-sky-500 mb-1">Lecture Thumbnail URL</Text>
                          <TextInput value={String(l.thumbnailUrl ?? "")} onChangeText={(v) => updateLecture(sIdx, lIdx, { thumbnailUrl: v })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-gray-50" placeholder="https://img.youtube.com/vi/xyz789/maxresdefault.jpg" />

                          <Text className="text-xs text-sky-500 mb-1">Embed Code</Text>
                          <TextInput value={String(l.embedCode ?? "")} onChangeText={(v) => updateLecture(sIdx, lIdx, { embedCode: v })} className="border border-sky-100 rounded-md px-3 py-2 mb-2 bg-gray-50" placeholder='<iframe src="..."></iframe>' />
                        </View>
                      ))}
                    </View>
                  ))}
                </View>

                <View className="flex-row justify-end mt-4 mb-6">
                  <Pressable onPress={() => { setModalVisible(false); setEditingIndex(null); }} className="px-4 py-2 rounded-md mr-2 bg-gray-100">
                    <Text className="text-sky-700 font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleSave} className="px-4 py-2 rounded-md bg-sky-600">
                    <Text className="text-white font-semibold">{editingIndex !== null ? "Save" : "Create"}</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}