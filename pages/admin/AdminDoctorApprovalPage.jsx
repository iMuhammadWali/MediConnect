import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { database } from "../../config/firebase";

const AdminDoctorApprovalPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { doctorUid } = route.params || {};

    const [doctor, setDoctor] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!doctorUid) return;

        let doctorData = null;
        let email = "";

        const docRef = ref(database, `doctors/${doctorUid}`);
        const userRef = ref(database, `users/${doctorUid}`);

        const mergeAndSet = () => {
            if (doctorData) {
                setDoctor(doctorData);
                setUserEmail(email);
            }
            setLoading(false);
        };

        const unsubDoc = onValue(docRef, snapshot => {
            if (snapshot.exists()) {
                doctorData = snapshot.val();
                mergeAndSet();
            } else {
                // If removed, go back
                navigation.goBack();
            }
        });

        const unsubUser = onValue(userRef, snapshot => {
            if (snapshot.exists() && snapshot.val().email) {
                email = snapshot.val().email;
                mergeAndSet();
            }
        });

        return () => {
            unsubDoc();
            unsubUser();
        };
    }, [doctorUid]);

    const getInitials = (fullName) => {
        if (!fullName) return "DR";
        const names = fullName.split(" ");
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const handleToggleVerification = () => {
        if (!doctor) return;
        const newStatus = !doctor.isVerified;
        const actionStr = newStatus ? "Approve" : "Revoke Approval for";
        
        Alert.alert(
            `${actionStr} Doctor`,
            `Are you sure you want to ${actionStr.toLowerCase()} Dr. ${doctor.fullName}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Confirm", onPress: () => {
                    update(ref(database, `doctors/${doctorUid}`), { isVerified: newStatus })
                        .then(() => {
                            Alert.alert("Success", `Doctor has been ${newStatus ? "approved" : "unapproved"}.`);
                        })
                        .catch(err => Alert.alert("Error", err.message));
                }}
            ]
        );
    };

    const handleRemoveDoctor = () => {
        Alert.alert(
            "Remove Doctor",
            `Are you sure you want to completely remove ${doctor?.fullName || "this doctor"} from the platform? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: async () => {
                    try {
                        await remove(ref(database, `doctors/${doctorUid}`));
                        await remove(ref(database, `users/${doctorUid}`));
                        Alert.alert("Removed", "Doctor has been removed successfully.");
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert("Error", err.message);
                    }
                }}
            ]
        );
    };

    if (loading || !doctor) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{color: '#747686'}}>Loading details...</Text>
            </SafeAreaView>
        );
    }

    const isVerified = doctor.isVerified;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Header Section */}
                <View style={[styles.header, { backgroundColor: isVerified ? "#1d8a4e" : "#1a40c2" }]}>
                    <View style={styles.topNav}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={20} color="#ffffff" />
                        </TouchableOpacity>
                        <View style={[styles.statusBadge, isVerified ? styles.statusVerified : styles.statusPending]}>
                            <Text style={styles.statusText}>{isVerified ? "APPROVED" : "PENDING REVIEW"}</Text>
                        </View>
                    </View>

                    <View style={styles.doctorIdentity}>
                        <View style={styles.doctorAvatar}>
                            <Text style={[styles.doctorInitials, { color: isVerified ? "#1d8a4e" : "#1a40c2" }]}>
                                {getInitials(doctor.fullName)}
                            </Text>
                        </View>
                        <Text style={styles.doctorName}>{doctor.fullName || "Unknown Doctor"}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.primarySpecialization || "Specialty not provided"}</Text>
                    </View>
                </View>

                {/* Info Area */}
                <View style={styles.mainContent}>
                    
                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Contact & System Info</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={18} color="#747686" />
                            <Text style={styles.infoText}>{userEmail || "No email found"}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={18} color="#747686" />
                            <Text style={styles.infoText}>{doctor.phoneNumber || "No phone provided"}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="finger-print-outline" size={18} color="#747686" />
                            <Text style={styles.infoText}>UID: {doctorUid}</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Professional Info</Text>
                        
                        <View style={styles.infoRow}>
                            <Ionicons name="business-outline" size={18} color="#747686" />
                            <Text style={styles.infoText}>Primary Hospital: {doctor.hospitalAffiliation || "None provided"}</Text>
                        </View>
                        {doctor.affiliations && doctor.affiliations.length > 0 && (
                            <View style={styles.infoRow}>
                                <Ionicons name="business-outline" size={18} color="#747686" />
                                <Text style={styles.infoText}>Other Affiliations: {doctor.affiliations.join(", ")}</Text>
                            </View>
                        )}
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={18} color="#747686" />
                            <Text style={styles.infoText}>
                                {doctor.workingDays?.length > 0 ? doctor.workingDays.join(", ") : "Days not specified"}
                                {" • "}
                                {doctor.startTime || "N/A"} - {doctor.endTime || "N/A"}
                            </Text>
                        </View>

                        <View style={[styles.statsContainer, { marginTop: 12 }]}>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{doctor.experience || 0} yrs</Text>
                                <Text style={styles.statLabel}>Experience</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{doctor.patientsCount || 0}</Text>
                                <Text style={styles.statLabel}>Patients</Text>
                            </View>
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{doctor.rating || "N/A"}</Text>
                                <Text style={styles.statLabel}>Rating</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <Text style={styles.sectionTitle}>Biography</Text>
                        <Text style={styles.aboutText}>
                            {doctor.bio || "No biography provided by the doctor."}
                        </Text>
                    </View>

                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={[styles.actionBtn, isVerified ? styles.btnRevoke : styles.btnApprove]} 
                    onPress={handleToggleVerification}
                >
                    <Ionicons name={isVerified ? "close-circle" : "checkmark-circle"} size={20} color="#ffffff" />
                    <Text style={styles.actionBtnText}>
                        {isVerified ? "Revoke Approval" : "Approve Doctor"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, styles.btnDanger]} onPress={handleRemoveDoctor}>
                    <Ionicons name="trash-outline" size={20} color="#ba1a1a" />
                    <Text style={[styles.actionBtnText, { color: "#ba1a1a" }]}>Remove Doctor</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 160 },
    header: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingTop: 15,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    topNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    statusVerified: { backgroundColor: "rgba(255,255,255,0.95)" },
    statusPending: { backgroundColor: "#fff4e6" },
    statusText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#191c1e",
        letterSpacing: 0.5,
    },
    doctorIdentity: { alignItems: "center" },
    doctorAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        borderWidth: 3,
        borderColor: "rgba(255,255,255,0.3)",
    },
    doctorInitials: { fontSize: 28, fontWeight: "bold" },
    doctorName: { fontSize: 22, fontWeight: "bold", color: "#ffffff", marginBottom: 4 },
    doctorSpecialty: { fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.9)" },
    mainContent: { marginTop: -20, paddingHorizontal: 24, gap: 16 },
    infoCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#191c1e", marginBottom: 12 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    infoText: { fontSize: 14, color: "#444654", flex: 1 },
    statsContainer: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
    statBox: {
        flex: 1,
        backgroundColor: "#f2f4f7",
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    statValue: { fontSize: 18, fontWeight: "bold", color: "#191c1e", marginBottom: 4 },
    statLabel: { fontSize: 12, color: "#747686" },
    aboutText: { fontSize: 14, lineHeight: 24, color: "#444654" },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255,255,255,0.98)",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
        gap: 12,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 16,
        borderRadius: 9999,
    },
    btnApprove: { backgroundColor: "#1d8a4e" },
    btnRevoke: { backgroundColor: "#e07b00" },
    btnDanger: { backgroundColor: "#fff0f0", borderWidth: 1, borderColor: "#ffdad6" },
    actionBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});

export default AdminDoctorApprovalPage;
