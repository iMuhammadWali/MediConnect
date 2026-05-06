import { View, Text, Image, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { auth } from "../../config/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { FormInput } from "../../components/FormInput";
import { SectionDivider } from "../../components/SectionDivider";

const LoginPage = () => {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const subscriber = onAuthStateChanged(auth, (u) => {
        });
        return subscriber;
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            let errorMessage = "Login failed. Please try again.";
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "Invalid email address format.";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled.";
                    break;
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email.";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Incorrect password.";
                    break;
                default:
                    errorMessage = error.message;
            }
            Alert.alert("Login Error", errorMessage);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        navigation.replace("Signup");
    };

    const handleForgotPassword = () => {
        // Nothing for now.
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.contentContainer}>
                        {/* Title */}
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>MediConnect</Text>
                        </View>

                        {/* Login Card */}
                        <View style={styles.loginCard}>
                            <Text style={styles.welcomeTitle}>Welcome Back</Text>
                            <Text style={styles.welcomeText}>Log in to manage your appointments, view test results, and connect with your healthcare team.</Text>
                            {/* Form */}
                            <View style={styles.form}>
                                <FormInput 
                                    label="Email Address"
                                    icon="mail-outline"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    required
                                />

                                <FormInput 
                                    label="Password"
                                    icon="lock-closed-outline"
                                    placeholder="********"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    showPasswordToggle
                                    onTogglePassword={() => setShowPassword(!showPassword)}
                                    headerRightElement={
                                        <TouchableOpacity onPress={handleForgotPassword}>
                                            <Text style={styles.forgotLink}>Forgot?</Text>
                                        </TouchableOpacity>
                                    }
                                    required
                                />

                                <TouchableOpacity 
                                    style={styles.loginButton} 
                                    onPress={handleLogin}
                                    disabled={loading}>
                                    <Text style={styles.loginButtonText}>
                                        {loading ? "Logging in..." : "Log in"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>
                                Don't have an account?{" "}
                                <Text style={styles.registerLink} onPress={handleRegister}>
                                    Register
                                </Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fc",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    logoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 32,
    },
    logoText: {
        fontSize: 24,
        fontWeight: "bold",
        letterSpacing: -0.5,
        color: "#1a40c2",
    },
    loginCard: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 24,
        width: "100%",
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#191c1e",
    },
    welcomeText: {
        fontSize: 14,
        marginBottom: 20,
        color: "#717273",
    },
    form: {
        gap: 14,
    },
    forgotLink: {
        fontSize: 11,
        fontWeight: "500",
        color: "#1a40c2",
    },
    loginButton: {
        backgroundColor: "#1a40c2",
        borderRadius: 9999,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 8,
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    loginButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    registerContainer: {
        marginTop: 24,
    },
    registerText: {
        fontSize: 13,
        color: "#444654",
    },
    registerLink: {
        fontWeight: "600",
        color: "#1a40c2",
    },
});

export default LoginPage;