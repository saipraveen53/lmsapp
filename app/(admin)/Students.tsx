import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";

// Mock student data
const sampleStudents = [
  {
    id: "S001",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    enrolled: 5,
    status: "active",
    joined: "2023-01-15",
  },
  {
    id: "S002",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    enrolled: 2,
    status: "inactive",
    joined: "2022-11-10",
  },
  {
    id: "S003",
    name: "Cathy Lee",
    email: "cathy.lee@example.com",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    enrolled: 7,
    status: "active",
    joined: "2023-03-22",
  },
  {
    id: "S004",
    name: "David Kim",
    email: "david.kim@example.com",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
    enrolled: 3,
    status: "active",
    joined: "2023-05-02",
  },
  {
    id: "S005",
    name: "Eva Green",
    email: "eva.green@example.com",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    enrolled: 4,
    status: "inactive",
    joined: "2022-09-18",
  },
];

export default function Students() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const [search, setSearch] = useState("");
  const students = useMemo(() => {
    if (!search) return sampleStudents;
    return sampleStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // Stats
  const total = sampleStudents.length;
  const active = sampleStudents.filter((s) => s.status === "active").length;
  const inactive = total - active;

  // Responsive columns
  let columns = 1;
  if (isDesktop) columns = 3;
  else if (isTablet) columns = 2;

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={["#7c3aed", "#db2777", "#ea580c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Students</Text>
        <Text style={styles.headerSubtitle}>Manage and view all enrolled students</Text>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#ede9fe" }]}>
          <Ionicons name="people" size={24} color="#7c3aed" />
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#fef9c3" }]}>
          <Ionicons name="checkmark-circle" size={24} color="#f59e42" />
          <Text style={styles.statValue}>{active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#fee2e2" }]}>
          <Ionicons name="close-circle" size={24} color="#ef4444" />
          <Text style={styles.statValue}>{inactive}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#64748b" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search by name or email"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Students Grid */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.grid, { gap: 20 }]}>
          {students.length === 0 && (
            <Text style={{ color: "#64748b", textAlign: "center", marginTop: 40 }}>No students found.</Text>
          )}
          {students.map((s) => (
            <View
              key={s.id}
              style={[
                styles.card,
                { width: (width - 48 - (columns - 1) * 20) / columns },
              ]}
            >
              <View style={styles.cardHeader}>
                <Image source={{ uri: s.avatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{s.name}</Text>
                  <Text style={styles.email}>{s.email}</Text>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: s.status === "active" ? "#22c55e" : "#f87171" },
                  ]}
                />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Ionicons name="book" size={16} color="#7c3aed" style={{ marginRight: 4 }} />
                  <Text style={styles.infoText}>{s.enrolled} Courses</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color="#db2777" style={{ marginRight: 4 }} />
                  <Text style={styles.infoText}>Joined {s.joined}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="eye" size={18} color="#fff" />
                <Text style={styles.actionText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 48,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "flex-start",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  headerSubtitle: {
    color: "#f3e8ff",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -28,
    marginBottom: 18,
    marginHorizontal: 24,
    zIndex: 2,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "600",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 24,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#334155",
    paddingVertical: 2,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 20,
    padding: 18,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#db2777",
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1e293b",
  },
  email: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: "#fff",
    marginTop: 2,
  },
  cardBody: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#334155",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7c3aed",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },
});