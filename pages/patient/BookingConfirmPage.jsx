import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from "react-native-animatable";
import { useEffect, useRef } from "react";

const BookingConfirmPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { doctorId, doctorName, hospitalName, date, time, fee } = route.params || {};
    const timerRef = useRef(null);

    useEffect(() => {
        // Auto-redirect to home after 15 seconds
        timerRef.current = setTimeout(() => {
            navigateHome();
        }, 15000);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const navigateHome = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        navigation.reset({
            index: 0,
            routes: [{ name: "PatientTabs" }],
        });
    };

    const navigateToChat = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        navigation.reset({
            index: 1,
            routes: [
                { name: "PatientTabs" },
                { name: "ChatPage", params: { otherUid: doctorId, otherName: doctorName } }
            ],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Success Animation */}
                <Animatable.View animation="bounceIn" duration={1000} style={styles.checkContainer}>
                    <View style={styles.checkOuter}>
                        <View style={styles.checkMiddle}>
                            <View style={styles.checkInner}>
                                <Animatable.View animation="zoomIn" delay={500} duration={600}>
                                    <Ionicons name="checkmark" size={56} color="#ffffff" />
                                </Animatable.View>
                            </View>
                        </View>
                    </View>
                </Animatable.View>

                <Animatable.View animation="fadeInUp" delay={800} duration={800}>
                    <Text style={styles.title}>BOOKING CONFIRMED</Text>
                    <Text style={styles.subtitle}>Your appointment has been booked successfully!</Text>
                </Animatable.View>

                {/* Booking Details Card */}
                <Animatable.View animation="fadeInUp" delay={1200} duration={800} style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Ionicons name="person" size={18} color="#1a40c2" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.detailLabel}>Doctor</Text>
                            <Text style={styles.detailValue}>{doctorName}</Text>
                        </View>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                        <Ionicons name="business" size={18} color="#1a40c2" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.detailLabel}>Hospital</Text>
                            <Text style={styles.detailValue}>{hospitalName}</Text>
                        </View>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={18} color="#1a40c2" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.detailLabel}>Date & Time</Text>
                            <Text style={styles.detailValue}>{date} at {time}</Text>
                        </View>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                        <Ionicons name="card" size={18} color="#1d8a4e" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.detailLabel}>Amount Paid</Text>
                            <Text style={[styles.detailValue, { color: "#1d8a4e" }]}>PKR {fee || 0}</Text>
                        </View>
                    </View>
                </Animatable.View>

                {/* Receipt Notice */}
                <Animatable.View animation="fadeIn" delay={1600} duration={800} style={styles.receiptNotice}>
                    <Ionicons name="mail" size={16} color="#1a40c2" />
                    <Text style={styles.receiptText}>A receipt has been sent to your email</Text>
                </Animatable.View>

                {/* Action Buttons */}
                <Animatable.View animation="fadeInUp" delay={2000} duration={800} style={styles.actions}>
                    <TouchableOpacity style={styles.chatButton} onPress={navigateToChat}>
                        <Ionicons name="chatbubbles" size={20} color="#ffffff" />
                        <Text style={styles.chatButtonText}>Chat with Doctor</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.homeButton} onPress={navigateHome}>
                        <Ionicons name="home-outline" size={18} color="#1a40c2" />
                        <Text style={styles.homeButtonText}>Go to Home</Text>
                    </TouchableOpacity>
                </Animatable.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
    checkContainer: { marginBottom: 28 },
    checkOuter: {
        width: 140, height: 140, borderRadius: 70,
        backgroundColor: "rgba(29, 138, 78, 0.08)",
        alignItems: "center", justifyContent: "center",
    },
    checkMiddle: {
        width: 110, height: 110, borderRadius: 55,
        backgroundColor: "rgba(29, 138, 78, 0.15)",
        alignItems: "center", justifyContent: "center",
    },
    checkInner: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: "#1d8a4e",
        alignItems: "center", justifyContent: "center",
        shadowColor: "#1d8a4e", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
    },
    title: {
        fontSize: 28, fontWeight: "900", color: "#191c1e",
        textAlign: "center", letterSpacing: 1, marginBottom: 8,
    },
    subtitle: {
        fontSize: 15, color: "#747686", textAlign: "center", lineHeight: 22, marginBottom: 4,
    },
    detailsCard: {
        width: "100%", backgroundColor: "#ffffff", borderRadius: 20,
        padding: 20, marginTop: 24,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
    },
    detailRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 8 },
    detailLabel: { fontSize: 11, color: "#747686", fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
    detailValue: { fontSize: 15, color: "#191c1e", fontWeight: "600", marginTop: 2 },
    detailDivider: { height: 1, backgroundColor: "#f2f4f7" },
    receiptNotice: {
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: "#E6F1FB", paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 9999, marginTop: 20,
    },
    receiptText: { fontSize: 13, color: "#1a40c2", fontWeight: "500" },
    actions: { width: "100%", marginTop: 24, gap: 12 },
    chatButton: {
        backgroundColor: "#1a40c2", borderRadius: 9999, paddingVertical: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
        shadowColor: "#1a40c2", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
    },
    chatButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
    homeButton: {
        backgroundColor: "#ffffff", borderRadius: 9999, paddingVertical: 14,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        borderWidth: 1.5, borderColor: "rgba(26, 64, 194, 0.2)",
    },
    homeButtonText: { color: "#1a40c2", fontSize: 15, fontWeight: "600" },
});

export default BookingConfirmPage;
