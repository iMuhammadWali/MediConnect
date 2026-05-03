import { View, Image, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';

const OnboardingPage = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.logoSection}>
                    <View style={styles.logoWrapper}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logo}
                        />
                    </View>
                    <Text style={styles.appName}>MediConnect</Text>
                    <Text style={styles.tagline}>Your health, simplified</Text>
                </View>

                <TouchableOpacity 
                    style={styles.getStartedButton} 
                    onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.getStartedButtonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    logoSection: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    logoWrapper: {
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: "#f2f4f7",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    logo: {
        width: 170,
        height: 170,
        borderRadius: 85,
    },
    appName: {
        fontSize: 28,
        fontWeight: "600",
        color: "#1a40c2",
        letterSpacing: -0.5,
        marginTop: 10,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: "#444654",
        fontWeight: "400",
    },
    getStartedButton: {
        backgroundColor: "#1a40c2",
        borderRadius: 9999,
        paddingVertical: 14,
        paddingHorizontal: 24,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    getStartedButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default OnboardingPage;