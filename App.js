import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "./config/firebase";
import { get, ref } from "firebase/database";

import OnboardingPage from "./pages/OnboardingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignupPage";

import HomePage from "./pages/HomePage";
import SchedulesPage from "./pages/SchedulesPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";

import FindDoctorsPage from "./pages/FindDoctorsPage";
import EmergencyPage from "./pages/EmergencyPage";
import DoctorDetailsPage from "./pages/DoctorDetails";

import DoctorDashboardPage from "./pages/DoctorDashboard";

// Navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();


// -------------------- TABS (PATIENT) --------------------
function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Schedule"
        component={SchedulesPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={MessagesPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbox-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function DoctorTabs(){
  return (
    <Tab.Navigator 
      screenOptions={{headerShown: false}}>
      <Tab.Screen 
        name="Dashboard" 
        component={DoctorDashboardPage}/>    
    
      <Tab.Screen
        name="Settings"
        component={SettingsPage}/>

    </Tab.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingPage} />
      <Stack.Screen name="Login" component={LoginPage} />
      <Stack.Screen name="Signup" component={SignUpPage} />
    </Stack.Navigator>
  );
}

function PatientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientTabs" component={PatientTabs} />
      <Stack.Screen name="FindDoctors" component={FindDoctorsPage} />
      <Stack.Screen name="Emergency" component={EmergencyPage} />
      <Stack.Screen name="DoctorDetails" component={DoctorDetailsPage} />
    </Stack.Navigator>
  );
}


function DoctorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);

        if (firebaseUser) {
          const snapshot = await get(ref(database, `users/${firebaseUser.uid}`));

          if (snapshot.exists()) {
            setRole(snapshot.val().role);
          } else {
            setRole(null);
          }
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white" }}>
        <ActivityIndicator size="large" color="#1a40c2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : role === "doctor" ? (
        <DoctorStack />
      ) : (
        <PatientStack />
      )}
    </NavigationContainer>
  );
}