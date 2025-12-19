import React, { useEffect, useMemo, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "../globals.css";

type Course = {
  courseId: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  price?: number;
  isPaid: boolean;
  status: "active" | "inactive";
  createdAt: string;
};

// Helper type for the form to handle text inputs (specifically price) as strings before saving
type CourseForm = Omit<Course, "price"> & { price: string };

const sampleCourses: Course[] = [
  {
    courseId: "C001",
    name: "Intro to React",
    description: "Basics of React and component-driven UI.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60",
    price: 0,
    isPaid: false,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    courseId: "C002",
    name: "Advanced TypeScript",
    description: "Types, generics, advanced patterns and tooling.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60",
    price: 49,
    isPaid: true,
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString() +
      " " +
      new Date(iso).toLocaleTimeString()
    : "";

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Initialize form with Partial values
  const [form, setForm] = useState<Partial<CourseForm>>({});
  
  const { width } = useWindowDimensions();

  // Responsive columns
  const columns = useMemo(() => {
    if (width >= 1100) return 3;
    if (width >= 720) return 2;
    return 1;
  }, [width]);

  const openCreate = () => {
    setEditingCourse(null);
    setForm({
      courseId: `C${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      description: "",
      thumbnailUrl: "",
      price: "0", // Initialize as string
      isPaid: false,
      status: "active",
    });
    setModalVisible(true);
  };

  const openEdit = (c: Course) => {
    setEditingCourse(c);
    setForm({
      ...c,
      price: c.price?.toString() || "0", // Convert number to string for editing
    });
    setModalVisible(true);
  };

  const handleDelete = (courseId: string) => {
    Alert.alert(
      "Delete Course",
      "Are you sure you want to delete this course?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            setCourses((prev) => prev.filter((p) => p.courseId !== courseId)),
        },
      ]
    );
  };

  const handleSave = () => {
    // Validation
    if (!form.courseId || !form.name) {
      Alert.alert("Validation", "Please provide Course ID and Name.");
      return;
    }

    const payload: Course = {
      courseId: String(form.courseId),
      name: String(form.name),
      description: String(form.description ?? ""),
      thumbnailUrl: String(form.thumbnailUrl ?? ""),
      // Convert string back to number for storage
      price: parseFloat(form.price || "0"),
      isPaid: Boolean(form.isPaid),
      status: (form.status as "active" | "inactive") ?? "active",
      createdAt: editingCourse
        ? editingCourse.createdAt
        : new Date().toISOString(),
    };

    if (editingCourse) {
      setCourses((prev) =>
        prev.map((p) =>
          p.courseId === editingCourse.courseId ? payload : p
        )
      );
    } else {
      setCourses((prev) => [payload, ...prev]);
    }
    setModalVisible(false);
    setEditingCourse(null);
  };

  // Card layout calculation
  const gap = 16;
  const outerPadding = 16 * 2;
  const cardWidth = Math.max(
    260,
    (width - outerPadding - gap * (columns - 1)) / columns
  );

  return (
    <SafeAreaView className="flex-1 bg-sky-50">
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-sky-700">Courses</Text>
            <Text className="text-sm text-sky-500">
              Manage your course catalogue
            </Text>
          </View>
          <Pressable
            onPress={openCreate}
            className="flex-row items-center bg-sky-600 px-4 py-2 rounded-md shadow"
            style={{ elevation: 2 }}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text className="text-white font-semibold ml-2">Create Course</Text>
          </Pressable>
        </View>

        {/* Grid */}
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap }}
            className="justify-start"
          >
            {courses.map((c) => (
              <View
                key={c.courseId}
                className="bg-white rounded-xl p-3 shadow"
                style={{ width: cardWidth, marginBottom: gap }}
              >
                <View className="h-40 mb-3 rounded-md overflow-hidden bg-sky-100 items-center justify-center">
                  {c.thumbnailUrl ? (
                    <Image
                      source={{ uri: c.thumbnailUrl }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-sky-400 text-6xl">🎓</Text>
                  )}
                </View>

                <Text className="text-lg font-bold text-sky-700">{c.name}</Text>
                <Text className="text-xs text-sky-400 mt-1 mb-2">
                  {c.courseId} • {c.status}
                </Text>
                
                {/* Fixed: Used prop instead of invalid class for line clamping */}
                <Text 
                  className="text-sm text-sky-600 mb-3" 
                  numberOfLines={3}
                >
                  {c.description}
                </Text>

                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-sm text-sky-500">Price</Text>
                    <Text className="text-md font-semibold text-sky-700">
                      {c.isPaid ? `$${(c.price ?? 0).toFixed(2)}` : "Free"}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-400">
                    {formatDate(c.createdAt)}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Pressable
                    onPress={() => openEdit(c)}
                    className="flex-row items-center px-3 py-2 bg-sky-100 rounded-md"
                  >
                    <Ionicons name="pencil-outline" size={16} color="#0ea5e9" />
                    <Text className="ml-2 text-sky-700 font-semibold">
                      Edit
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleDelete(c.courseId)}
                    className="flex-row items-center px-3 py-2 bg-red-50 rounded-md"
                  >
                    <Ionicons name="trash-outline" size={16} color="#dc2626" />
                    <Text className="ml-2 text-red-600 font-semibold">
                      Delete
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Modal Form */}
        <Modal animationType="slide" visible={modalVisible} transparent>
          {/* KeyboardAvoidingView fixes keyboard covering input fields */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-end bg-black bg-opacity-40"
          >
            <View
              className="bg-white rounded-t-xl p-4"
              style={{ maxHeight: "90%" }}
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-bold text-sky-700">
                  {editingCourse ? "Edit Course" : "Add Course"}
                </Text>
                <Pressable
                  onPress={() => {
                    setModalVisible(false);
                    setEditingCourse(null);
                  }}
                >
                  <Ionicons name="close" size={22} color="#374151" />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-xs text-sky-500 mb-1">Course ID</Text>
                <TextInput
                  value={form.courseId}
                  onChangeText={(v) => setForm((s) => ({ ...s, courseId: v }))}
                  className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50"
                  placeholder="C001"
                />

                <Text className="text-xs text-sky-500 mb-1">Name</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(v) => setForm((s) => ({ ...s, name: v }))}
                  className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50"
                  placeholder="Course name"
                />

                <Text className="text-xs text-sky-500 mb-1">Description</Text>
                <TextInput
                  value={form.description}
                  onChangeText={(v) =>
                    setForm((s) => ({ ...s, description: v }))
                  }
                  className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50"
                  placeholder="Short description"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <Text className="text-xs text-sky-500 mb-1">
                  Thumbnail URL
                </Text>
                <TextInput
                  value={form.thumbnailUrl}
                  onChangeText={(v) =>
                    setForm((s) => ({ ...s, thumbnailUrl: v }))
                  }
                  className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50"
                  placeholder="https://..."
                />

                <Text className="text-xs text-sky-500 mb-1">Price</Text>
                <TextInput
                  value={form.price}
                  // Fixed: We store string directly so user can type decimals (e.g. "10.")
                  onChangeText={(v) => setForm((s) => ({ ...s, price: v }))}
                  className="border border-sky-100 rounded-md px-3 py-2 mb-3 bg-gray-50"
                  placeholder="0"
                  keyboardType="numeric"
                />

                <View className="flex-row items-center justify-between mb-3">
                  <View>
                    <Text className="text-xs text-sky-500">Paid</Text>
                    <Pressable
                      onPress={() =>
                        setForm((s) => ({
                          ...s,
                          isPaid: !Boolean(s?.isPaid),
                        }))
                      }
                      className={`mt-1 px-3 py-2 rounded-md ${
                        form.isPaid ? "bg-sky-600" : "bg-sky-100"
                      }`}
                    >
                      <Text
                        className={`${
                          form.isPaid ? "text-white" : "text-sky-700"
                        }`}
                      >
                        {form.isPaid ? "Paid" : "Free"}
                      </Text>
                    </Pressable>
                  </View>

                  <View>
                    <Text className="text-xs text-sky-500">Status</Text>
                    <View className="flex-row mt-1">
                      <Pressable
                        onPress={() => setForm((s) => ({ ...s, status: "active" }))}
                        className={`px-3 py-2 rounded-l-md ${
                          form.status === "active"
                            ? "bg-sky-600"
                            : "bg-sky-100"
                        }`}
                      >
                        <Text
                          className={`${
                            form.status === "active"
                              ? "text-white"
                              : "text-sky-700"
                          }`}
                        >
                          Active
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setForm((s) => ({ ...s, status: "inactive" }))}
                        className={`px-3 py-2 rounded-r-md ${
                          form.status === "inactive"
                            ? "bg-gray-600"
                            : "bg-sky-100"
                        }`}
                      >
                        <Text
                          className={`${
                            form.status === "inactive"
                              ? "text-white"
                              : "text-sky-700"
                          }`}
                        >
                          Inactive
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-end mt-4 mb-6">
                  <Pressable
                    onPress={() => {
                      setModalVisible(false);
                      setEditingCourse(null);
                    }}
                    className="px-4 py-2 rounded-md mr-2 bg-gray-100"
                  >
                    <Text className="text-sky-700 font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSave}
                    className="px-4 py-2 rounded-md bg-sky-600"
                  >
                    <Text className="text-white font-semibold">
                      {editingCourse ? "Save" : "Create"}
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Courses;