import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";

import { 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

const SignUpPage = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);

    const [userRole, setUserRole] = useState("patient");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            // TODO: Give meaninful AHCI errors if time.
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update user profile with full name
            await updateProfile(userCredential.user, {
                displayName: fullName
            });

            Alert.alert("Success", "Account created successfully!");
            navigation.replace("Login");
        } catch (error) {
            let errorMessage = "Sign up failed. Please try again.";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "An account already exists with this email.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Invalid email address format.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "Password is too weak. Use at least 6 characters.";
                    break;
                default:
                    errorMessage = error.message;
            }
            Alert.alert("Sign Up Error", errorMessage);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        Alert.alert("Google Sign Up", "Google sign-in integration would go here");
    };

    const handleLogin = () => {
        navigation.replace("Login");
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

                        {/* Sign Up Card */}
                        <View style={styles.signUpCard}>
                            <Text style={styles.welcomeTitle}>Create Account</Text>

                            {/* Role Toggle */}
                            <View style={styles.roleToggle}>
                                <TouchableOpacity 
                                    style={[styles.roleButton, userRole === 'patient' && styles.activeRoleButton]}
                                    onPress={() => setUserRole("patient")}>
                                    <Text style={[styles.roleButtonText, userRole === "patient" && styles.activeRoleButtonText]}> 
                                        Patient
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.roleButton, userRole === 'doctor' && styles.activeRoleButton]}
                                    onPress={() => setUserRole("doctor")}>
                                    <Text style={[styles.roleButtonText, userRole === "doctor" && styles.activeRoleButtonText]}> 
                                        Doctor
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Form */}
                            <View style={styles.form}>
                                {/* Full Name Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Full Name</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="person-outline" size={18} color="#c4c5d6" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Muhammad Wali"
                                            placeholderTextColor="#c4c5d6"
                                            value={fullName}
                                            onChangeText={setFullName}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                </View>

                                {/* Email Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Email Address</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="mail-outline" size={18} color="#c4c5d6" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="name@example.com"
                                            placeholderTextColor="#c4c5d6"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                {/* Password Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="lock-closed-outline" size={18} color="#c4c5d6" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            placeholder="********"
                                            placeholderTextColor="#c4c5d6"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons 
                                                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                                                size={18} 
                                                color="#c4c5d6" 
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Confirm Password Input */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Confirm Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Ionicons name="lock-closed-outline" size={18} color="#c4c5d6" style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { flex: 1 }]}
                                            placeholder="********"
                                            placeholderTextColor="#c4c5d6"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
                                        />
                                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            <Ionicons 
                                                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                                                size={18} 
                                                color="#c4c5d6" 
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Sign Up Button */}
                                <TouchableOpacity 
                                    style={styles.signUpButton} 
                                    onPress={handleSignUp}
                                    disabled={loading}>
                                    <Text style={styles.signUpButtonText}>
                                        {loading ? "Creating Account..." : "Sign Up"}
                                    </Text>
                                    {/* Should hide this button or add a loading circle*/}
                                </TouchableOpacity>
                            </View>

                            {/* Social Login Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.divider} />
                            </View>

                            {/* Google Button */}
                            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
                                <View style={styles.googleIconContainer}>
                                    <Image 
                                        source={{ uri: 'https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png' }}
                                        style={{ width: 18, height: 18 }}
                                    />                            
                                </View>
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>
                                Already have an account?{" "}
                                <Text style={styles.loginLink} onPress={handleLogin}>
                                    Log in
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
    signUpCard: {
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
        marginBottom: 20,
        color: "#191c1e",
    },
    roleToggle: {
        flexDirection: "row",
        backgroundColor: "#eceef1",
        borderRadius: 9999,
        padding: 4,
        marginBottom: 24,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 9999,
        alignItems: "center",
    },
    activeRoleButton: {
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    roleButtonText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#444654",
    },
    activeRoleButtonText: {
        color: "#1a40c2",
        fontWeight: "600",
    },
    form: {
        gap: 14,
    },
    inputGroup: {
        gap: 4,
    },
    inputLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#444654",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e6e8eb",
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 46,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 13,
        color: "#191c1e",
        paddingVertical: 10,
    },
    signUpButton: {
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
    signUpButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#e0e3e6",
    },
    dividerText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#c4c5d6",
        marginHorizontal: 14,
    },
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "rgba(196, 197, 214, 0.3)",
        borderRadius: 9999,
        paddingVertical: 12,
    },
    googleIconContainer: {
        width: 18,
        height: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    googleButtonText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#191c1e",
    },
    loginContainer: {
        marginTop: 24,
    },
    loginText: {
        fontSize: 13,
        color: "#444654",
    },
    loginLink: {
        fontWeight: "600",
        color: "#1a40c2",
    },
});

export default SignUpPage;