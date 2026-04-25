import { StyleSheet, Text, View, Image, Button } from 'react-native';
import AppButton from './components/AppButton';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingPage from './pages/OnboardingPage';
import LoginPage from './pages/LoginPage';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Onboarding',
  screenOptions: {
    contentStyle: { backgroundColor: "#fff" }
  },
  screens: {
    'Onboarding': {
      'screen': OnboardingPage,
      'options': {
        headerShown: false,
        'title' : ''
      }
    },
    'Login': LoginPage
  }
});

const Navigation = createStaticNavigation(RootStack); 

export default function App() {
  return <Navigation/>
}
