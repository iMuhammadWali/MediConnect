import { View, Image, Text, StyleSheet, ToastAndroid } from "react-native"
import AppButton from '../components/AppButton';
import { Link, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const OnboardingPage = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{ flex: 1, alignItems: 'center', padding: 20 }}>
                <View style={{
                    flex: 1, alignItems: 'center', justifyContent: 'center'
                }}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={{ width: 170, height: 170 }}
                    />

                    <Text style={{
                        marginTop: 10, fontSize: 28, fontWeight: "400"
                    }}>MediConnect</Text>

                    <Text style={{
                        marginTop: 10, marginBottom: 100, fontSize: 16
                    }}>Your health, simplified</Text>

                </View>

                <AppButton
                    text="Get Started"
                    onPress={() => { navigation.navigate("AppTabs") }}
                    height={50}
                    width="100%" />

            </View>
        </SafeAreaView>
    );
}

export default OnboardingPage;