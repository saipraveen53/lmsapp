import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { JSX, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from "react-native";
// import "../globals.css"; // Commented out to rely on pure StyleSheet for consistent results

// --- TYPES & LOGIC (UNCHANGED) ---
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

// --- COMPONENT ---
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

  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 768; // Breakpoint for Desktop vs Mobile

  const columns = useMemo(() => {
    if (width >= 1200) return 3;
    if (width >= 800) return 2;
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

  // --- STYLING CONSTANTS ---
  const THEME = {
    primary: "#5b21b6", // Deep Purple
    primaryLight: "#7c3aed",
    accent: "#f97316", // Orange
    bg: "#f8fafc", // Very light gray/blue
    cardBg: "#ffffff",
    textDark: "#1e293b",
    textLight: "#64748b",
    border: "#e2e8f0",
  };

  
  const cardGap = 20;
  const padding = 24;
  const cardWidth = (width - (padding * 2) - (cardGap * (columns - 1))) / columns;

  return (
    <SafeAreaView style={styles.container}>
        {/*<StatusBar barStyle="light-content" backgroundColor={THEME.primary} />*/}
      
      {/* HEADER */}
  <LinearGradient
  colors={['#7c3aed', '#db2777', '#ea580c']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.headerContainer}
>
  <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
    <View>
      <Text style={styles.headerTitle}>ANASOL LMS</Text>
      <Text style={styles.headerSubtitle}>Course Management Dashboard</Text>
    </View>
    <TouchableOpacity onPress={openCreate} style={styles.createButton}>
      <Ionicons name="add" size={20} color="#fff" />
      <Text style={styles.createButtonText}>New Course</Text>
    </TouchableOpacity>
  </View>
</LinearGradient>

      {/* CONTENT GRID */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.gridContainer, { gap: cardGap }]}>
          {courses.map((c, idx) => (
            <View key={`${c.title}-${idx}`} style={[styles.card, { width: cardWidth }]}>
              {/* Card Image */}
              <View style={styles.cardImageContainer}>
                {c.thumbnailUrl ? (
                  <Image source={{ uri: c.thumbnailUrl }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderImage}>
                     <Ionicons name="school" size={48} color={THEME.primaryLight} opacity={0.5} />
                  </View>
                )}
                <View style={styles.priceTag}>
                   <Text style={styles.priceText}>{c.price ? `$${c.price.toFixed(2)}` : "Free"}</Text>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <View>
                  <Text style={styles.cardTitle} numberOfLines={1}>{c.title}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>{c.subtitle}</Text>
                  <Text style={styles.cardDesc} numberOfLines={3}>{c.description}</Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <Text style={styles.cardDate}>{formatDate(c.createdAt).split(' ')[0]}</Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEdit(idx)} style={styles.actionBtn}>
                      <Ionicons name="create-outline" size={18} color={THEME.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(idx)} style={[styles.actionBtn, { marginLeft: 8 }]}>
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal animationType="fade" visible={modalVisible} transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.modalOverlay}
        >
          <View style={isDesktop ? styles.modalContentDesktop : styles.modalContentMobile}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingIndex !== null ? "Edit Course" : "Create New Course"}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setEditingIndex(null); }}>
                <Ionicons name="close-circle" size={28} color={THEME.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Basic Info Section */}
              <Text style={styles.sectionHeader}>Basic Information</Text>
              
              <View style={isDesktop ? styles.row : null}>
                <View style={[styles.inputGroup, isDesktop && { flex: 2, marginRight: 16 }]}>
                    <Text style={styles.label}>Course Title</Text>
                    <TextInput 
                        value={String(form.title ?? "")} 
                        onChangeText={(v) => setForm((s) => ({ ...s, title: v }))} 
                        style={styles.input} 
                        placeholder="e.g., Spring Boot Masterclass" 
                    />
                </View>
                <View style={[styles.inputGroup, isDesktop && { flex: 1 }]}>
                    <Text style={styles.label}>Price (USD)</Text>
                    <TextInput 
                        value={String(form.price ?? "")} 
                        onChangeText={(v) => setForm((s) => ({ ...s, price: v }))} 
                        style={styles.input} 
                        placeholder="99.99" 
                        keyboardType="numeric"
                    />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Subtitle</Text>
                <TextInput value={String(form.subtitle ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, subtitle: v }))} style={styles.input} placeholder="Brief catchy tagline" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput 
                    value={String(form.description ?? "")} 
                    onChangeText={(v) => setForm((s) => ({ ...s, description: v }))} 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Full course details..." 
                    multiline 
                    numberOfLines={4} 
                    textAlignVertical="top" 
                />
              </View>

              {/* Details Grid */}
              <View style={styles.grid2Col}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Language</Text>
                    <TextInput value={String(form.language ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, language: v }))} style={styles.input} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Level</Text>
                    <TextInput value={String(form.level ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, level: v }))} style={styles.input} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Category ID</Text>
                    <TextInput value={String(form.categoryId ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, categoryId: v }))} style={styles.input} />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Target Audience</Text>
                    <TextInput value={String(form.targetAudience ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, targetAudience: v }))} style={styles.input} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                 <Text style={styles.label}>Thumbnail URL</Text>
                 <TextInput value={String(form.thumbnailUrl ?? "")} onChangeText={(v) => setForm((s) => ({ ...s, thumbnailUrl: v }))} style={styles.input} />
              </View>

              {/* Curriculum Builder */}
              <View style={styles.divider} />
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeader}>Curriculum Builder</Text>
                <TouchableOpacity onPress={addSection} style={styles.smallBtn}>
                    <Text style={styles.smallBtnText}>+ Add Section</Text>
                </TouchableOpacity>
              </View>

              {formSections.map((s, sIdx) => (
                <View key={`sec-${sIdx}`} style={styles.curriculumCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.curriculumTitle}>Section {sIdx + 1}</Text>
                    <Text style={styles.metaText}>Order: {s.orderIndex ?? sIdx + 1}</Text>
                  </View>
                  
                  <TextInput 
                    value={String(s.title ?? "")} 
                    onChangeText={(v) => updateSection(sIdx, { title: v })} 
                    style={styles.inputSm} 
                    placeholder="Section Title" 
                  />
                   <TextInput 
                    value={String(s.description ?? "")} 
                    onChangeText={(v) => updateSection(sIdx, { description: v })} 
                    style={[styles.inputSm, {marginBottom: 10}]} 
                    placeholder="Section Description" 
                  />

                  <View style={styles.lecturesContainer}>
                     <View style={styles.rowBetween}>
                        <Text style={styles.subLabel}>Lectures</Text>
                        <TouchableOpacity onPress={() => addLecture(sIdx)}>
                            <Text style={styles.linkText}>+ Add Lecture</Text>
                        </TouchableOpacity>
                     </View>

                     {(s.lectures ?? []).map((l, lIdx) => (
                        <View key={`lec-${sIdx}-${lIdx}`} style={styles.lectureItem}>
                            <View style={styles.row}>
                                <Ionicons name="play-circle-outline" size={20} color={THEME.primary} style={{marginRight: 8}} />
                                <View style={{flex: 1}}>
                                    <TextInput 
                                        value={String(l.title ?? "")} 
                                        onChangeText={(v) => updateLecture(sIdx, lIdx, { title: v })} 
                                        style={styles.inputMinimal} 
                                        placeholder="Lecture Title"
                                    />
                                    <View style={styles.row}>
                                        <TextInput 
                                            value={String(l.videoUrl ?? "")} 
                                            onChangeText={(v) => updateLecture(sIdx, lIdx, { videoUrl: v })} 
                                            style={[styles.inputMinimal, {fontSize: 11, flex: 1}]} 
                                            placeholder="Video URL..."
                                        />
                                        <View style={styles.switchContainer}>
                                            <Text style={styles.tinyLabel}>Preview</Text>
                                            <Switch 
                                                value={Boolean(l.isPreview)} 
                                                onValueChange={(v) => updateLecture(sIdx, lIdx, { isPreview: v })} 
                                                trackColor={{ true: THEME.accent, false: "#e2e8f0" }}
                                                thumbColor={"#fff"}
                                                style={{ transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }] }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                     ))}
                  </View>
                </View>
              ))}
              
              <View style={{height: 40}} /> 
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
                <TouchableOpacity onPress={() => { setModalVisible(false); setEditingIndex(null); }} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                    <Text style={styles.saveBtnText}>{editingIndex !== null ? "Save Changes" : "Create Course"}</Text>
                </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  // HEADER
  headerContainer: {
    //backgroundColor:"#7c3aed", // Deep Purple base
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: "#4c1d95",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e9d5ff",
    marginTop: 4,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#f97316", // Orange accent
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 50,
    marginLeft: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },

  // GRID & CARDS
  scrollContent: {
    padding: 24,
    paddingTop: 16, // Pull up to overlap header slightly if desired, or kept standard
    paddingBottom: 80,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardImageContainer: {
    height: 160,
    backgroundColor: "#e2e8f0",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  priceTag: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: "#4c1d95",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardBody: {
    padding: 16,
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#f97316", // Orange
    marginBottom: 8,
    fontWeight: "500",
  },
  cardDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  cardDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  cardActions: {
    flexDirection: "row",
  },
  actionBtn: {
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)", // Darker backdrop
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentDesktop: {
    backgroundColor: "#fff",
    width: "60%",
    maxWidth: 800,
    maxHeight: "85%",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
    overflow: "hidden",
  },
  modalContentMobile: {
    backgroundColor: "#fff",
    width: "100%",
    height: "95%",
    marginTop: "auto",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  modalBody: {
    padding: 24,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "#f8fafc",
  },

  // FORM ELEMENTS
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4c1d95",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#334155",
  },
  inputSm: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    marginBottom: 8,
  },
  inputMinimal: {
    padding: 0,
    fontSize: 13,
    color: "#334155",
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  textArea: {
    minHeight: 80,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  grid2Col: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  divider: {
      height: 1,
      backgroundColor: '#e2e8f0',
      marginVertical: 20,
  },

  // BUTTONS
  saveBtn: {
    backgroundColor: "#4c1d95",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 12,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    color: "#64748b",
    fontWeight: "600",
  },
  smallBtn: {
      backgroundColor: "#e0f2fe",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
  },
  smallBtnText: {
      color: "#0284c7",
      fontSize: 12,
      fontWeight: "600",
  },

  // CURRICULUM
  curriculumCard: {
      backgroundColor: "#f8fafc",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#e2e8f0",
      marginBottom: 16,
  },
  curriculumTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: "#334155",
  },
  metaText: {
      fontSize: 11,
      color: "#94a3b8",
  },
  lecturesContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: "#e2e8f0",
  },
  lectureItem: {
      backgroundColor: "#fff",
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "#f1f5f9",
  },
  subLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: "#64748b",
  },
  linkText: {
      color: "#4c1d95",
      fontSize: 12,
      fontWeight: "600",
  },
  tinyLabel: {
      fontSize: 10,
      color: "#94a3b8",
      marginRight: 6,
  },
  switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  }
});