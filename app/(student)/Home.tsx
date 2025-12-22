import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- DUMMY DATA ---
const categories = ["All", "Coding", "Design", "Business", "Marketing", "Music", "Photography"];

const continueLearning = {
  title: "Full Stack Web Development",
  libraryId: "567017", 
  progress: 65,
  totalLessons: 40,
  completedLessons: 26,
  thumbnail: "https://img.freepik.com/free-vector/web-development-programmer-engineering-coding-website-augmented-reality-interface-screens-developer-project-engineer-programming-software-application-design-cartoon-illustration_107791-3863.jpg"
};

// --- POPULAR COURSES ---
const popularCourses = [
  {
    id: 1,
    libraryId: "567017", 
    title: "React Native for Beginners",
    author: "Suresh Tech",
    rating: 4.8,
    price: "₹499",
    thumbnail: "https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg",
    tag: "Bestseller",
    description: "Learn how to build native Android and iOS apps using React Native. This course covers everything from basics to advanced topics like Navigation, State Management, API integration, and NativeWind styling.",
    duration: "12h 30m",
    lessons: 45,
    language: "Telugu/English"
  },
  {
    id: 2,
    libraryId: "100002",
    title: "Master UI/UX Design",
    author: "Creative Minds",
    rating: 4.9,
    price: "₹899",
    thumbnail: "https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149065783.jpg",
    tag: "New",
    description: "Master the art of User Interface and User Experience design. Learn Figma, Adobe XD, and design principles to create stunning mobile and web applications.",
    duration: "18h 15m",
    lessons: 60,
    language: "English"
  },
  {
    id: 3,
    libraryId: "100003",
    title: "Digital Marketing 101",
    author: "Grow Business",
    rating: 4.5,
    price: "₹299",
    thumbnail: "https://img.freepik.com/free-vector/digital-marketing-concept-illustration_114360-1554.jpg",
    tag: "Hot",
    description: "Understand the fundamentals of Digital Marketing, SEO, Social Media Marketing, and Email Marketing strategies to grow any business online.",
    duration: "8h 45m",
    lessons: 32,
    language: "Telugu"
  },
  {
    id: 4,
    libraryId: "100004",
    title: "Python for Data Science",
    author: "Data Wizards",
    rating: 4.7,
    price: "₹699",
    thumbnail: "https://img.freepik.com/free-vector/laptop-with-program-code-isometric-icon-software-development-programming-applications-dark-neon_39422-971.jpg",
    tag: "Trending",
    description: "Learn Python programming from scratch and master libraries like Pandas, NumPy, and Matplotlib for data analysis and visualization.",
    duration: "22h 10m",
    lessons: 85,
    language: "English"
  },
  {
    id: 5,
    libraryId: "100005",
    title: "Graphic Design Masterclass",
    author: "Design Pro",
    rating: 4.6,
    price: "₹599",
    thumbnail: "https://img.freepik.com/free-vector/graphic-design-colorful-geometrical-background_52683-34588.jpg",
    tag: "Creative",
    description: "The ultimate graphic design course which covers Photoshop, Illustrator, InDesign, and design theory.",
    duration: "15h 00m",
    lessons: 50,
    language: "English"
  },
  {
    id: 6,
    libraryId: "100006",
    title: "Financial Analysis & Investing",
    author: "Wall Street Prep",
    rating: 4.8,
    price: "₹999",
    thumbnail: "https://img.freepik.com/free-vector/financial-analysis-concept-illustration_114360-5629.jpg",
    tag: "Finance",
    description: "Learn how to read financial statements, analyze stocks, and build financial models like a pro.",
    duration: "10h 20m",
    lessons: 28,
    language: "English"
  },
  {
    id: 7,
    libraryId: "100007",
    title: "Photography for Beginners",
    author: "Lens Queen",
    rating: 4.9,
    price: "₹399",
    thumbnail: "https://img.freepik.com/free-vector/photographer-concept-illustration_114360-2268.jpg",
    tag: "Hobby",
    description: "Understand your DSLR camera, master aperture, shutter speed, ISO, and composition to take breathtaking photos.",
    duration: "6h 30m",
    lessons: 20,
    language: "Telugu"
  },
  {
    id: 8,
    libraryId: "100008",
    title: "Public Speaking Mastery",
    author: "Speak Up",
    rating: 4.7,
    price: "₹249",
    thumbnail: "https://img.freepik.com/free-vector/public-speaking-concept-illustration_114360-1438.jpg",
    tag: "Soft Skills",
    description: "Overcome your fear of public speaking and learn how to deliver powerful presentations with confidence.",
    duration: "4h 15m",
    lessons: 15,
    language: "English"
  },
  {
    id: 9,
    libraryId: "100009",
    title: "Ethical Hacking Bootcamp",
    author: "Cyber Secure",
    rating: 4.8,
    price: "₹799",
    thumbnail: "https://img.freepik.com/free-vector/cyber-security-concept_23-2148532223.jpg",
    tag: "Advanced",
    description: "Learn network penetration testing, web application security, and how to protect systems from cyber attacks.",
    duration: "25h 00m",
    lessons: 90,
    language: "English"
  },
  {
    id: 10,
    libraryId: "100010",
    title: "Machine Learning A-Z",
    author: "AI Future",
    rating: 4.9,
    price: "₹1299",
    thumbnail: "https://img.freepik.com/free-vector/artificial-intelligence-concept-illustration_114360-1763.jpg",
    tag: "Future Tech",
    description: "Dive into the world of AI. Learn to build predictive models using Scikit-Learn and TensorFlow.",
    duration: "30h 00m",
    lessons: 100,
    language: "English"
  }
];

const mentors = [
  { id: 1, name: "Suresh", role: "Dev", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Ananya", role: "Design", img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "Rahul", role: "Marketing", img: "https://randomuser.me/api/portraits/men/85.jpg" },
  { id: 4, name: "Priya", role: "Business", img: "https://randomuser.me/api/portraits/women/65.jpg" },
  { id: 5, name: "Arjun", role: "Finance", img: "https://randomuser.me/api/portraits/men/11.jpg" },
];

const Home = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [username, setUserName] = useState("Student");
  
  // --- COURSE DETAILS MODAL ---
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // --- MOCK ENROLLED COURSES ---
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([1]); 

  useEffect(() => {
    let fetchUsername = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          const decode: any = jwtDecode(token);
          setUserName(decode.sub || "Student");
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    }
    fetchUsername();
  }, [])

  // Function to open Course Modal
  const openCourseDetails = (course: any) => {
    setSelectedCourse(course);
    setCourseModalVisible(true);
  };

  // --- HANDLE ENROLL ---
  const handleEnroll = () => {
    Alert.alert(
        "Enrollment Successful!", 
        `You have successfully enrolled in ${selectedCourse?.title}`, 
        [
            { 
                text: "Start Learning", 
                onPress: () => {
                    if(selectedCourse) {
                        setEnrolledCourseIds((prev) => [...prev, selectedCourse.id]);
                    }
                } 
            }
        ]
    );
  };

  // --- HANDLE CONTINUE LEARNING ---
  const handleContinueLearning = () => {
    setCourseModalVisible(false);
    if (selectedCourse?.libraryId) {
        router.push({
            pathname: "/(videos)/[id]",
            params: { id: selectedCourse.libraryId }
        });
    } else {
        Alert.alert("Error", "Course content not available yet.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* --- STICKY HEADER --- */}
      <View className="bg-white px-5 pt-2 pb-4 shadow-sm z-10 rounded-b-3xl">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-gray-400 text-sm font-medium">Welcome Back,</Text>
            <Text className="text-2xl font-bold text-gray-800 capitalize">
              {username} 👋
            </Text>
          </View>
          
          {/* USER ICON - Navigate to Profile */}
          <TouchableOpacity 
            onPress={() => router.push('/(student)/MyProfile')}
            className="bg-gray-100 p-1 rounded-full border border-gray-200"
          >
            <Image
              source={{ uri: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
              className="w-10 h-10 rounded-full"
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-gray-50 p-3 rounded-2xl border border-gray-200">
          <Text className="text-gray-400 mr-2 text-lg">🔍</Text>
          <TextInput
            placeholder="Search for courses, mentors..."
            className="flex-1 text-gray-700 font-medium h-full"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity>
             <Text className="text-gray-400">⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MAIN SCROLL CONTENT --- */}
      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
      >
        {/* Promo Banner */}
        <View className="bg-gray-900 rounded-3xl p-5 mb-8 flex-row items-center shadow-lg shadow-indigo-200">
          <View className="flex-1">
             <View className="bg-orange-500 self-start px-2 py-1 rounded-md mb-2">
                <Text className="text-white text-[10px] font-bold">PRO ACCESS</Text>
             </View>
             <Text className="text-white text-lg font-bold mb-1">Get 50% Off Today!</Text>
             <Text className="text-gray-300 text-xs mb-3">Unlock all premium courses.</Text>
             <TouchableOpacity className="bg-white py-2 px-4 rounded-xl self-start">
                <Text className="text-gray-900 font-bold text-xs">Upgrade Now</Text>
             </TouchableOpacity>
          </View>
          <Image 
             source={{ uri: "https://cdn3d.iconscout.com/3d/premium/thumb/trophy-cup-3d-icon-download-in-png-blend-fbx-gltf-file-formats--award-winner-reward-champion-prize-interface-pack-user-icons-4860718.png" }}
             className="w-24 h-24"
          />
        </View>

        {/* Continue Learning */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-3">Continue Learning</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push({
                pathname: "/(videos)/[id]",
                params: { id: continueLearning.libraryId }
            })}
            className="bg-white border border-indigo-100 rounded-3xl p-4 flex-row items-center shadow-sm"
          >
            <Image
              source={{ uri: continueLearning.thumbnail }}
              className="w-20 h-20 rounded-2xl bg-indigo-50"
            />
            <View className="flex-1 ml-4">
              <Text className="text-gray-900 font-bold text-lg mb-1" numberOfLines={1}>
                {continueLearning.title}
              </Text>
              <Text className="text-gray-400 text-xs mb-3">
                {continueLearning.completedLessons} / {continueLearning.totalLessons} Lessons Completed
              </Text>
              <View className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
                <View
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${continueLearning.progress}%` }}
                />
              </View>
            </View>
            <View className="bg-indigo-600 w-8 h-8 rounded-full justify-center items-center ml-2 shadow-md shadow-indigo-300">
                <Text className="text-white text-xs">▶</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Top Mentors */}
        <View className="mb-8">
            <Text className="text-lg font-bold text-gray-800 mb-3">Top Mentors</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
               {mentors.map((m) => (
                  <TouchableOpacity key={m.id} className="items-center mr-5">
                      <View className="p-1 border-2 border-orange-400 rounded-full">
                         <Image source={{uri: m.img}} className="w-14 h-14 rounded-full" />
                      </View>
                      <Text className="text-xs font-bold text-gray-700 mt-1">{m.name}</Text>
                      <Text className="text-[10px] text-gray-400">{m.role}</Text>
                  </TouchableOpacity>
               ))}
            </ScrollView>
        </View>

        {/* Categories */}
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setActiveCategory(cat)}
                className={`mr-3 px-6 py-2.5 rounded-full border ${
                  activeCategory === cat
                    ? 'bg-gray-900 border-gray-900'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`font-medium text-sm ${activeCategory === cat ? 'text-white' : 'text-gray-600'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Courses */}
        <View className="mb-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-800">Popular Courses</Text>
            <TouchableOpacity>
               <Text className="text-indigo-600 font-bold text-xs">View All</Text>
            </TouchableOpacity>
          </View>
          
          {popularCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.includes(course.id);
            return (
                <TouchableOpacity
                    key={course.id}
                    onPress={() => openCourseDetails(course)}
                    className="bg-white p-3 rounded-3xl mb-4 shadow-sm border border-gray-100 flex-row"
                >
                    <Image
                        source={{ uri: course.thumbnail }}
                        className="w-28 h-28 rounded-2xl bg-gray-50"
                    />
                    <View className="flex-1 ml-4 justify-center py-1">
                        <View className="flex-row justify-between items-start mb-1">
                            {isEnrolled ? (
                                <View className="bg-green-100 px-2 py-0.5 rounded">
                                    <Text className="text-green-600 text-[10px] font-bold uppercase">PURCHASED</Text>
                                </View>
                            ) : (
                                <View className="bg-orange-50 px-2 py-0.5 rounded">
                                    <Text className="text-orange-500 text-[10px] font-bold uppercase">{course.tag}</Text>
                                </View>
                            )}

                            <View className="flex-row items-center">
                                <Text className="text-yellow-400 text-xs">★</Text>
                                <Text className="text-gray-800 font-bold text-xs ml-1">{course.rating}</Text>
                            </View>
                        </View>
                        
                        <Text className="text-base font-bold text-gray-900 mb-1 leading-tight" numberOfLines={2}>
                        {course.title}
                        </Text>
                        <Text className="text-gray-400 text-xs mb-3">By {course.author}</Text>
                        
                        <View className="flex-row items-center justify-between">
                            {isEnrolled ? (
                                <Text className="text-green-600 font-bold text-sm">Owned</Text>
                            ) : (
                                <Text className="text-indigo-600 font-extrabold text-lg">{course.price}</Text>
                            )}

                            <View className={`p-2 rounded-full ${isEnrolled ? 'bg-green-100' : 'bg-gray-50'}`}>
                                <Text className={`text-xs font-bold ${isEnrolled ? 'text-green-600' : 'text-gray-400'}`}>
                                    {isEnrolled ? '✓' : '+'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* --- COURSE DETAILS MODAL --- */}
      <Modal
        animationType="slide"
        visible={courseModalVisible}
        presentationStyle="pageSheet"
        onRequestClose={() => setCourseModalVisible(false)}
      >
        {selectedCourse && (
            <View className="flex-1 bg-white">
                <View className="relative">
                    <Image 
                        source={{ uri: selectedCourse.thumbnail }} 
                        className="w-full h-64 bg-gray-200"
                        resizeMode="cover"
                    />
                    <TouchableOpacity 
                        onPress={() => setCourseModalVisible(false)}
                        className="absolute top-4 right-4 bg-black/30 p-2 rounded-full"
                    >
                        <Text className="text-white font-bold text-xs">✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 pr-4">
                             <Text className="text-orange-600 font-bold text-xs tracking-widest uppercase mb-1">
                                {selectedCourse.tag}
                             </Text>
                             <Text className="text-2xl font-black text-gray-900 leading-tight">
                                {selectedCourse.title}
                             </Text>
                        </View>
                        {enrolledCourseIds.includes(selectedCourse.id) ? (
                            <View className="bg-green-100 px-3 py-1 rounded-lg">
                                <Text className="text-green-700 font-bold">Purchased</Text>
                            </View>
                        ) : (
                            <View className="items-end">
                                <Text className="text-xl font-black text-indigo-600">{selectedCourse.price}</Text>
                                <Text className="text-gray-400 text-xs line-through">₹1999</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row items-center mb-6 space-x-4">
                        <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-md mr-3">
                             <Text className="text-yellow-500 text-xs">★</Text>
                             <Text className="text-gray-800 font-bold text-xs ml-1">{selectedCourse.rating}</Text>
                        </View>
                        <Text className="text-gray-400 text-xs">🕒 {selectedCourse.duration}</Text>
                        <Text className="text-gray-400 text-xs ml-3">📹 {selectedCourse.lessons} Lessons</Text>
                    </View>

                    <View className="flex-row items-center mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <View className="w-10 h-10 bg-indigo-100 rounded-full justify-center items-center mr-3">
                            <Text className="text-indigo-600 font-bold text-lg">{selectedCourse.author.charAt(0)}</Text>
                        </View>
                        <View>
                            <Text className="text-gray-900 font-bold text-sm">{selectedCourse.author}</Text>
                            <Text className="text-gray-500 text-xs">Course Instructor</Text>
                        </View>
                    </View>

                    <Text className="text-lg font-bold text-gray-900 mb-2">About Course</Text>
                    <Text className="text-gray-600 leading-6 mb-6">
                        {selectedCourse.description}
                    </Text>

                    <Text className="text-lg font-bold text-gray-900 mb-3">What You'll Learn</Text>
                    <View className="bg-gray-50 p-4 rounded-2xl mb-6">
                        {['Master the basics', 'Build Real-world Projects', 'Get Certified', 'Lifetime Access'].map((item, index) => (
                             <View key={index} className="flex-row items-center mb-2">
                                 <Text className="text-green-500 mr-2">✓</Text>
                                 <Text className="text-gray-700 font-medium">{item}</Text>
                             </View>
                        ))}
                    </View>

                    {enrolledCourseIds.includes(selectedCourse.id) ? (
                        <TouchableOpacity 
                            activeOpacity={0.8}
                            onPress={handleContinueLearning}
                            className="bg-indigo-600 py-4 rounded-2xl shadow-lg shadow-indigo-200 mt-4 mb-8 flex-row justify-center items-center"
                        >
                            <Text className="text-white text-center font-bold text-lg tracking-wide mr-2">
                                Continue Learning
                            </Text>
                            <Text className="text-white">▶</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            activeOpacity={0.8}
                            onPress={handleEnroll}
                            className="bg-green-600 py-4 rounded-2xl shadow-lg shadow-green-200 mt-4 mb-8"
                        >
                            <Text className="text-white text-center font-bold text-lg tracking-wide">
                                Enroll Now - {selectedCourse.price}
                            </Text>
                        </TouchableOpacity>
                    )}

                </ScrollView>
            </View>
        )}
      </Modal>

    </SafeAreaView>
  );
};

export default Home;