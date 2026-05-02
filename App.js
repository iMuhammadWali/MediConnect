import { Ionicons } from "@expo/vector-icons";


import { StyleSheet, Text, View, Image, Button, ActivityIndicator } from 'react-native';
import AppButton from './components/AppButton';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';
import MediConnectHome from './pages/HomePage';
import HomePage from './pages/HomePage';

import { Platform } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';

import SchedulesPage from "./pages/SchedulesPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";
import FindDoctorsPage from "./pages/FindDoctorsPage";
import EmergencyPage from "./pages/EmergencyPage";
import DoctorDetailsPage from "./pages/DoctorDetails";
import SignUpPage from "./pages/SignupPage";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";

const myTabs = createBottomTabNavigator({
  initialRouteName: 'Home',
  screens: {
    Home: {
      screen: HomePage,
      options:{
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" size={size} color={color} />
        ),
      }
    },

    Schedule: {
      screen: SchedulesPage,
      options:{ 
        // headerShown: false,
        tabBarIcon: ({color, size}) => (
          <Ionicons name="calendar-outline" size={size} color={color}/>
        )
      }
    },
    Messages :{
      screen: MessagesPage,
      options: {
        // headerShown: false,
        tabBarIcon:({color, size}) => (
          <Ionicons name="chatbox-outline" size={size} color={color}/>
        )
      }
    },
    Settings :{
      screen: SettingsPage,
      options: {
        // headerShown: false,
        tabBarIcon:({color, size}) => (
          <Ionicons name="settings-outline" size={size} color={color}/>
        )
      }
    }
  }
})

const createRootStack = (initialRoute) => {
  return createNativeStackNavigator({
    initialRouteName: initialRoute,
    screenOptions: {
      contentStyle: { backgroundColor: "#ffffff" }
    },
    screens: {
      Onboarding: {
        screen: OnboardingPage,
        options: {
          headerShown: false,
        }
      },
      Signup: {
        screen: SignUpPage,
        options: {
          headerShown: false
        }
      },
      Login: {
        screen: LoginPage,
        options:{
          headerShown: false
        }
      },
      AppTabs: {
        screen: myTabs,
        options: { headerShown: false }
      },
      FindDoctors: {
        screen: FindDoctorsPage
      },
      Emergency: {
        screen: EmergencyPage
      },
      DoctorDetails: {
        screen: DoctorDetailsPage
      }
    }
  })
};


export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, (user)=>{
      setUser(user);
      setIsLoading(false);
    });
    return unsubscribe; 
  }, []);

  if (isLoading){
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white"}}>
        <ActivityIndicator size="large" color="#1a40c2"></ActivityIndicator>
      </View>
    )
  }

  const RootStack = createRootStack(user? "AppTabs" : "Onboarding");
  const Navigation = createStaticNavigation(RootStack); 

  return <Navigation/>
}