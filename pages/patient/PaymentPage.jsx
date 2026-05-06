import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from "react";
import { ref, push, set } from "firebase/database";
import { database, auth } from "../../config/firebase";

const PaymentPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { doctorId, doctorName, hospitalName, affiliationId, date, time, fee } = route.params || {};
    
    const [paying, setPaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Shimmer animation loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
                Animated.timing(shimmerAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const handlePay = async () => {
        setPaying(true);
        
        // Fake loading with progress animation over 5 seconds
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: false,
        }).start();

        // Update progress text
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 2;
            });
        }, 100);

        // Wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        clearInterval(interval);
        setProgress(100);

        try {
            const uid = auth.currentUser?.uid;
            // Create appointment
            const appointmentRef = push(ref(database, "appointments"));
            await set(appointmentRef, {
                patientId: uid,
                doctorId: doctorId || "unknown_doctor",
                doctorName: doctorName || "Dr. Unknown",
                hospitalName: hospitalName || "Hospital",
                affiliationId: affiliationId || "",
                date: date,
                time: time,
                fee: fee,
                status: "Upcoming",
                paid: true,
                createdAt: new Date().toISOString()
            });

            // Navigate to confirmation
            navigation.replace("BookingConfirm", {
                doctorId,
                doctorName,
                hospitalName,
                date,
                time,
                fee,
                appointmentId: appointmentRef.key,
            });
        } catch (error) {
            setPaying(false);
            setProgress(0);
            progressAnim.setValue(0);
            alert("Payment failed: " + error.message);
        }
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => !paying && navigation.goBack()} disabled={paying}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
            </View>

            <View style={styles.content}>
                {/* Booking Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Booking Summary</Text>
                    
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryIconBox}>
                            <Ionicons name="person" size={18} color="#1a40c2" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.summaryLabel}>Doctor</Text>
                            <Text style={styles.summaryValue}>{doctorName}</Text>
                        </View>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryIconBox}>
                            <Ionicons name="business" size={18} color="#1a40c2" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.summaryLabel}>Hospital</Text>
                            <Text style={styles.summaryValue}>{hospitalName}</Text>
                        </View>
                    </View>

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryIconBox}>
                            <Ionicons name="calendar" size={18} color="#1a40c2" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.summaryLabel}>Date & Time</Text>
                            <Text style={styles.summaryValue}>{date} at {time}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>PKR {fee || 0}</Text>
                    </View>
                </View>

                {/* Payment Processing */}
                {paying && (
                    <View style={styles.processingCard}>
                        <ActivityIndicator size="large" color="#1a40c2" />
                        <Text style={styles.processingTitle}>Processing Payment...</Text>
                        <Text style={styles.processingText}>Please wait while we process your payment</Text>
                        
                        <View style={styles.progressBarBg}>
                            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
                        </View>
                        <Text style={styles.progressText}>{Math.min(progress, 100)}%</Text>
                    </View>
                )}

                {/* Pay Button */}
                {!paying && (
                    <View style={styles.paySection}>
                        <View style={styles.secureRow}>
                            <Ionicons name="shield-checkmark" size={16} color="#1d8a4e" />
                            <Text style={styles.secureText}>Secure payment processing</Text>
                        </View>
                        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
                            <Ionicons name="card" size={20} color="#ffffff" />
                            <Text style={styles.payButtonText}>Pay Now — PKR {fee || 0}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    header: {
        flexDirection: "row", alignItems: "center", gap: 16,
        backgroundColor: "#1a40c2", paddingHorizontal: 20, paddingVertical: 16,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
    content: { flex: 1, padding: 20 },
    summaryCard: {
        backgroundColor: "#ffffff", borderRadius: 20, padding: 24,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
    },
    summaryTitle: { fontSize: 18, fontWeight: "bold", color: "#191c1e", marginBottom: 20 },
    summaryRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 16 },
    summaryIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center" },
    summaryLabel: { fontSize: 12, color: "#747686", fontWeight: "500" },
    summaryValue: { fontSize: 15, color: "#191c1e", fontWeight: "600", marginTop: 2 },
    divider: { height: 1, backgroundColor: "#f2f4f7", marginVertical: 16 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    totalLabel: { fontSize: 16, color: "#191c1e", fontWeight: "600" },
    totalValue: { fontSize: 24, color: "#1a40c2", fontWeight: "bold" },
    processingCard: {
        backgroundColor: "#ffffff", borderRadius: 20, padding: 32,
        alignItems: "center", marginTop: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
    },
    processingTitle: { fontSize: 18, fontWeight: "bold", color: "#191c1e", marginTop: 16, marginBottom: 4 },
    processingText: { fontSize: 14, color: "#747686", marginBottom: 20 },
    progressBarBg: { width: "100%", height: 8, backgroundColor: "#f2f4f7", borderRadius: 4, overflow: "hidden" },
    progressBarFill: { height: "100%", backgroundColor: "#1a40c2", borderRadius: 4 },
    progressText: { fontSize: 14, fontWeight: "bold", color: "#1a40c2", marginTop: 8 },
    paySection: { marginTop: "auto", paddingTop: 20 },
    secureRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12 },
    secureText: { fontSize: 13, color: "#1d8a4e", fontWeight: "500" },
    payButton: {
        backgroundColor: "#1a40c2", borderRadius: 9999, paddingVertical: 18,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
        shadowColor: "#1a40c2", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
    },
    payButtonText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
});

export default PaymentPage;
