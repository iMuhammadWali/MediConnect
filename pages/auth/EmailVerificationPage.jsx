import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import * as Animatable from "react-native-animatable";

const EmailVerificationPage = () => {
    const [resending, setResending] = useState(false);
    const [checking, setChecking] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const intervalRef = useRef(null);
    const pollRef = useRef(null);

    const userEmail = auth.currentUser?.email || "your email";

    // Auto-poll every 5 seconds
    useEffect(() => {
        pollRef.current = setInterval(async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    await user.reload();
                    if (user.emailVerified) {
                        // Force a re-render by signing out and back in
                        // The App.js auth listener will pick up the verified state
                        clearInterval(pollRef.current);
                        // Trigger auth state change
                        const { currentUser } = auth;
                        if (currentUser?.emailVerified) {
                            // Force auth state refresh
                            await currentUser.getIdToken(true);
                            // The onAuthStateChanged in App.js will handle navigation
                        }
                    }
                }
            } catch (e) {
                // Silent fail for polling
            }
        }, 4000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            intervalRef.current = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [cooldown]);

    const handleResend = async () => {
        if (cooldown > 0) return;
        setResending(true);
        try {
            const user = auth.currentUser;
            if (user) {
                await sendEmailVerification(user);
                Alert.alert("Email Sent", "A new verification link has been sent to your email.");
                setCooldown(60);
            }
        } catch (error) {
            if (error.code === "auth/too-many-requests") {
                Alert.alert("Too Many Requests", "Please wait before requesting another email.");
                setCooldown(120);
            } else {
                Alert.alert("Error", error.message);
            }
        } finally {
            setResending(false);
        }
    };

    const handleCheckVerification = async () => {
        setChecking(true);
        try {
            const user = auth.currentUser;
            if (user) {
                await user.reload();
                if (user.emailVerified) {
                    await user.getIdToken(true);
                    Alert.alert("Verified!", "Your email has been verified successfully.");
                } else {
                    Alert.alert("Not Yet Verified", "Please check your inbox and click the verification link.");
                }
            }
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setChecking(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", style: "destructive", onPress: () => signOut(auth) }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Animated Mail Icon */}
                <Animatable.View
                    animation="bounceIn"
                    duration={1200}
                    style={styles.iconContainer}
                >
                    <View style={styles.iconCircle}>
                        <View style={styles.iconInnerCircle}>
                            <Ionicons name="mail-unread" size={48} color="#1a40c2" />
                        </View>
                    </View>
                </Animatable.View>

                <Animatable.View animation="fadeInUp" delay={400} duration={800}>
                    <Text style={styles.title}>Verify Your Email</Text>
                    <Text style={styles.subtitle}>
                        We've sent a verification link to
                    </Text>
                    <Text style={styles.emailText}>{userEmail}</Text>
                    <Text style={styles.description}>
                        Please check your inbox and click the verification link to continue. Don't forget to check your spam folder!
                    </Text>
                </Animatable.View>

                <Animatable.View animation="fadeInUp" delay={800} duration={800} style={styles.actionsContainer}>
                    {/* Check Verification Button */}
                    <TouchableOpacity
                        style={styles.checkButton}
                        onPress={handleCheckVerification}
                        disabled={checking}
                    >
                        {checking ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                <Text style={styles.checkButtonText}>I've Verified My Email</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Resend Button */}
                    <TouchableOpacity
                        style={[styles.resendButton, (cooldown > 0 || resending) && styles.resendDisabled]}
                        onPress={handleResend}
                        disabled={cooldown > 0 || resending}
                    >
                        {resending ? (
                            <ActivityIndicator color="#1a40c2" />
                        ) : (
                            <>
                                <Ionicons name="refresh" size={18} color={cooldown > 0 ? "#c4c5d6" : "#1a40c2"} />
                                <Text style={[styles.resendButtonText, cooldown > 0 && { color: "#c4c5d6" }]}>
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Sign Out Link */}
                    <TouchableOpacity style={styles.signOutLink} onPress={handleSignOut}>
                        <Text style={styles.signOutText}>Use a different account</Text>
                    </TouchableOpacity>
                </Animatable.View>

                {/* Auto-polling indicator */}
                <Animatable.View
                    animation="pulse"
                    iterationCount="infinite"
                    duration={2000}
                    style={styles.pollingIndicator}
                >
                    <View style={styles.pollingDot} />
                    <Text style={styles.pollingText}>Auto-checking verification status...</Text>
                </Animatable.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
    iconContainer: { marginBottom: 32 },
    iconCircle: {
        width: 140, height: 140, borderRadius: 70,
        backgroundColor: "rgba(26, 64, 194, 0.08)",
        alignItems: "center", justifyContent: "center",
    },
    iconInnerCircle: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: "rgba(26, 64, 194, 0.12)",
        alignItems: "center", justifyContent: "center",
    },
    title: {
        fontSize: 28, fontWeight: "bold", color: "#191c1e",
        textAlign: "center", marginBottom: 8, letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15, color: "#747686", textAlign: "center", lineHeight: 22,
    },
    emailText: {
        fontSize: 16, fontWeight: "700", color: "#1a40c2",
        textAlign: "center", marginTop: 4, marginBottom: 12,
    },
    description: {
        fontSize: 14, color: "#747686", textAlign: "center",
        lineHeight: 22, marginBottom: 8,
    },
    actionsContainer: { width: "100%", marginTop: 24, gap: 14 },
    checkButton: {
        backgroundColor: "#1a40c2", borderRadius: 9999,
        paddingVertical: 16, alignItems: "center", justifyContent: "center",
        flexDirection: "row", gap: 8,
        shadowColor: "#1a40c2", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
    },
    checkButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
    resendButton: {
        backgroundColor: "#ffffff", borderRadius: 9999,
        paddingVertical: 14, alignItems: "center", justifyContent: "center",
        flexDirection: "row", gap: 8,
        borderWidth: 1.5, borderColor: "rgba(26, 64, 194, 0.2)",
    },
    resendDisabled: { borderColor: "#e6e8eb" },
    resendButtonText: { color: "#1a40c2", fontSize: 15, fontWeight: "600" },
    signOutLink: { alignItems: "center", marginTop: 4 },
    signOutText: { fontSize: 14, color: "#747686", fontWeight: "500" },
    pollingIndicator: {
        flexDirection: "row", alignItems: "center", gap: 8,
        position: "absolute", bottom: 40,
    },
    pollingDot: {
        width: 8, height: 8, borderRadius: 4, backgroundColor: "#1d8a4e",
    },
    pollingText: { fontSize: 12, color: "#747686" },
});

export default EmailVerificationPage;
