import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "./config/firebase";
import { get, onValue, ref } from "firebase/database";

import OnboardingPage from "./pages/auth/OnboardingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignupPage";

import HomePage from "./pages/patient/HomePage";
import AppointmentsPage from "./pages/patient/AppointmentsPage";
import SchedulerPage from "./pages/shared/SchedulerPage";
import MessagesPage from "./pages/shared/MessagesPage";
import SettingsPage from "./pages/shared/SettingsPage";

import FindDoctorsPage from "./pages/patient/FindDoctorsPage";
import EmergencyPage from "./pages/patient/EmergencyPage";
import DoctorDetailsPage from "./pages/patient/DoctorDetails";

import DoctorDashboardPage from "./pages/doctor/DoctorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage";
import AdminPatientsPage from "./pages/admin/AdminPatientsPage";
import AdminDoctorEditPage from "./pages/admin/AdminDoctorEditPage";
import AdminAddHospitalPage from "./pages/admin/AdminAddHospitalPage";
import AdminHospitalsPage from "./pages/admin/AdminHospitalsPage";
import AdminDoctorApprovalPage from "./pages/admin/AdminDoctorApprovalPage";
import AdminAffiliationRequestsPage from "./pages/admin/AdminAffiliationRequestsPage";

import RadiologyPage from "./pages/patient/RadiologyPage";
import HospitalsPage from "./pages/patient/HospitalsPage";
import HospitalDetailsPage from "./pages/patient/HospitalDetailsPage";
import { BloodBankPage } from "./pages/shared/ComingSoonPages";
import PrescriptionPage from "./pages/patient/PrescriptionPage";
import ChatPage from "./pages/shared/ChatPage";
import PatientDetailsPage from "./pages/doctor/PatientDetailsPage";
import DoctorAffiliationsPage from "./pages/doctor/DoctorAffiliationsPage";
import RequestAffiliationPage from "./pages/doctor/RequestAffiliationPage";
import DoctorSchedulePage from "./pages/doctor/DoctorSchedulePage";

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
        name="Appointments"
        component={AppointmentsPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
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

function DoctorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{}}>
      <Tab.Screen
        name="Dashboard"
        component={DoctorDashboardPage}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Schedule"
        component={DoctorSchedulePage}
        options={{
          headerShown: false,
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
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }} />

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
      <Stack.Screen name="PatientTabs" component={PatientTabs} options={{ headerShown: false }} />
      <Stack.Screen name="FindDoctors" component={FindDoctorsPage} />
      <Stack.Screen name="Emergency" component={EmergencyPage} />
      <Stack.Screen name="DoctorDetails" component={DoctorDetailsPage} options={{ headerShown: false }} />
      <Stack.Screen name="Radiology" component={RadiologyPage} options={{ headerShown: false }} />
      <Stack.Screen name="Hospitals" component={HospitalsPage} options={{ headerShown: false }} />
      <Stack.Screen name="HospitalDetails" component={HospitalDetailsPage} options={{ headerShown: false }} />
      <Stack.Screen name="BloodBank" component={BloodBankPage} options={{ headerShown: false }} />
      <Stack.Screen name="Prescription" component={PrescriptionPage} options={{ headerShown: false }} />
      <Stack.Screen name="ChatPage" component={ChatPage} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}


function DoctorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorTabs" component={DoctorTabs} />
      <Stack.Screen name="ChatPage" component={ChatPage} />
      <Stack.Screen name="PatientDetails" component={PatientDetailsPage} />
      <Stack.Screen name="DoctorAffiliations" component={DoctorAffiliationsPage} />
      <Stack.Screen name="RequestAffiliation" component={RequestAffiliationPage} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminDoctors" component={AdminDoctorsPage} />
      <Stack.Screen name="AdminDoctorApproval" component={AdminDoctorApprovalPage} />
      <Stack.Screen name="AdminPatients" component={AdminPatientsPage} />
      <Stack.Screen name="AdminDoctorEdit" component={AdminDoctorEditPage} />
      <Stack.Screen name="AdminHospitals" component={AdminHospitalsPage} />
      <Stack.Screen name="AdminAddHospital" component={AdminAddHospitalPage} />
      <Stack.Screen name="AdminAffiliationRequests" component={AdminAffiliationRequestsPage} />
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
        // Use onValue (real-time listener) instead of get() so that if
        // onAuthStateChanged fires before the DB write completes (race
        // condition during signup), the role still updates once the
        // data is written.
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
      {!user || !role ? (
        <AuthStack />
      ) : role === "patient" ? (
        <PatientStack />
      ) : role === "admin" ? (
        <AdminStack />
      ) : role === "doctor" ? (
        <DoctorStack />
      ) : null}
    </NavigationContainer>
  );
}