import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDXnL5Ei7PfJnadis0xziVKUEA1Fyk1-Ms",
  authDomain: "mediconnect-cf076.firebaseapp.com",
  projectId: "mediconnect-cf076",
  storageBucket: "mediconnect-cf076.firebasestorage.app",
  messagingSenderId: "27801906446",
  appId: "1:27801906446:web:30313dad521c14911ffb5f"
};

const persistence = getReactNativePersistence(AsyncStorage);

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: persistence
});

