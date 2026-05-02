import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "./config/firebase";
import { get, ref, onValue } from "firebase/database";

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        // headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          headerShown: false,
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
        component={SettingsPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}/>

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
    <Stack.Navigator screenOptions={{}}>
      <Stack.Screen name="PatientTabs" component={PatientTabs} options={{headerShown: false}} />
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
    let roleUnsubscribe = null;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous role listener when auth state changes because new one will be attached.
      if (roleUnsubscribe) {
        roleUnsubscribe();
        roleUnsubscribe = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        roleUnsubscribe = onValue(
          ref(database, `users/${firebaseUser.uid}`),
          (snapshot) => {
            const fetchedRole = snapshot.exists() ? snapshot.val().role : null;
            setRole(fetchedRole);
            setIsLoading(false);
          },
          (error) => {
            console.error("Error fetching role:", error);
            setRole(null);
            setIsLoading(false);
          }
        );
      } else {
        setRole(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (roleUnsubscribe) roleUnsubscribe();
    };
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