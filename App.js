import { Ionicons } from "@expo/vector-icons";


import { StyleSheet, Text, View, Image, Button } from 'react-native';
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
import SchedulePage from "./pages/SchedulePage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";

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
      screen: SchedulePage,
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

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Onboarding',
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
    Login: {
      screen: LoginPage,
      options:{
        headerShown: false
      }
    },
    AppTabs: {
      screen: myTabs,
      options: { headerShown: false }
    }
  }
});

const Navigation = createStaticNavigation(RootStack); 

export default function App() {
  return <Navigation/>
}
