import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../../config/firebase";

const AdminPatientsPage = () => {
    const navigation = useNavigation();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = ref(database, "users");
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const result = [];
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    const data = child.val();
                    if (data.role === "patient") {
                        result.push({ uid: child.key, ...data });
                    }
                });
            }
            setPatients(result);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleRemove = (uid, name) => {
        Alert.alert(
            "Remove Patient",
            `Remove ${name} from the platform? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await remove(ref(database, `users/${uid}`));
                        } catch (e) {
                            Alert.alert("Error", e.message);
                        }
                    },
                },
            ]
        );
    };

    const PatientRow = ({ patient }) => {
        const initials = patient.fullName
            ? patient.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
            : "PT";

        const createdDate = patient.createdAt
            ? new Date(patient.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—";

        return (
            <View style={styles.patientCard}>
                <View style={styles.patientLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{patient.fullName || "Unknown"}</Text>
                        <Text style={styles.patientEmail}>{patient.email}</Text>
                        <Text style={styles.patientPhone}>{patient.phone || "No phone"}</Text>
                        <Text style={styles.patientDate}>Joined {createdDate}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(patient.uid, patient.fullName)}
                >
                    <Ionicons name="trash-outline" size={18} color="#ba1a1a" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Manage Patients</Text>
                    <Text style={styles.headerSubtitle}>{patients.length} total</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a40c2" />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {patients.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color="#c4c5d6" />
                            <Text style={styles.emptyText}>No patients found</Text>
                        </View>
                    ) : (
                        patients.map((patient) => (
                            <PatientRow key={patient.uid} patient={patient} />
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        backgroundColor: "#1a40c2",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
    headerSubtitle: { fontSize: 12, color: "#a5b4fc", marginTop: 2 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 12 },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 15, color: "#717273" },
    patientCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    patientLeft: { flexDirection: "row", gap: 12, flex: 1 },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { fontSize: 16, fontWeight: "bold", color: "#0C447C" },
    patientInfo: { flex: 1, gap: 2 },
    patientName: { fontSize: 15, fontWeight: "bold", color: "#191c1e" },
    patientEmail: { fontSize: 12, color: "#444654" },
    patientPhone: { fontSize: 12, color: "#717273" },
    patientDate: { fontSize: 11, color: "#c4c5d6", marginTop: 2 },
    removeButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#fff0f0",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
});

export default AdminPatientsPage;
