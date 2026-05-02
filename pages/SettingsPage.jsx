import { signOut } from "firebase/auth";
import { Alert, Button, StyleSheet, Text, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";

const SettingsPage = ()=> {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.container} edges={['top']}>      
            <Button title={"Logout"} onPress={()=>{
                signOut(auth).then(()=>{
                    ToastAndroid.show("User signed out", ToastAndroid.SHORT)
                    navigation.replace("Login")
                });                                
            }}></Button>
        </SafeAreaView>
    );
    
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fc",
    },
});
export default SettingsPage;