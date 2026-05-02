import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { database } from "../../config/firebase";

const AdminDoctorsPage = () => {
    const navigation = useNavigation();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // "all" | "pending" | "verified"

    useEffect(() => {
        // Get all doctors and match with users for email
        const doctorsRef = ref(database, "doctors");
        const usersRef = ref(database, "users");

        let doctorsData = {};
        let usersData = {};

        const mergeDoctors = () => {
            const merged = Object.keys(doctorsData).map((uid) => ({
                uid,
                ...doctorsData[uid],
                email: usersData[uid]?.email || "",
            }));
            setDoctors(merged);
            setLoading(false);
        };

        const unsubscribeDoctors = onValue(doctorsRef, (snapshot) => {
            doctorsData = snapshot.exists() ? snapshot.val() : {};
            mergeDoctors();
        });

        const unsubscribeUsers = onValue(usersRef, (snapshot) => {
            usersData = snapshot.exists() ? snapshot.val() : {};
            mergeDoctors();
        });

        return () => {
            unsubscribeDoctors();
            unsubscribeUsers();
        };
    }, []);

    const handleVerify = (uid, currentStatus) => {
        const newStatus = !currentStatus;
        const label = newStatus ? "verify" : "unverify";
        Alert.alert(
            `${newStatus ? "Verify" : "Unverify"} Doctor`,
            `Are you sure you want to ${label} this doctor?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            await update(ref(database, `doctors/${uid}`), { isVerified: newStatus });
                        } catch (e) {
                            Alert.alert("Error", e.message);
                        }
                    },
                },
            ]
        );
    };

    const handleRemove = (uid, name) => {
        Alert.alert(
            "Remove Doctor",
            `Remove ${name} from the platform? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await remove(ref(database, `doctors/${uid}`));
                            await remove(ref(database, `users/${uid}`));
                        } catch (e) {
                            Alert.alert("Error", e.message);
                        }
                    },
                },
            ]
        );
    };

    const filteredDoctors = doctors.filter((doc) => {
        if (filter === "pending") return doc.isVerified === false;
        if (filter === "verified") return doc.isVerified === true;
        return true;
    });

    const FilterTab = ({ label, value }) => (
        <TouchableOpacity
            style={[styles.filterTab, filter === value && styles.filterTabActive]}
            onPress={() => setFilter(value)}
        >
            <Text style={[styles.filterTabText, filter === value && styles.filterTabTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const DoctorRow = ({ doctor }) => {
        const initials = doctor.fullName
            ? doctor.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
            : "DR";

        return (
            <View style={styles.doctorCard}>
                <View style={styles.doctorLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{doctor.fullName || "Unknown"}</Text>
                        <Text style={styles.doctorSpecialty}>
                            {doctor.primarySpecialization || "—"}
                        </Text>
                        <Text style={styles.doctorEmail}>{doctor.email}</Text>
                        <View style={[styles.badge, doctor.isVerified ? styles.badgeVerified : styles.badgePending]}>
                            <Text style={[styles.badgeText, doctor.isVerified ? styles.badgeTextVerified : styles.badgeTextPending]}>
                                {doctor.isVerified ? "Verified" : "Pending"}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    {/* Edit */}
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => navigation.navigate("AdminDoctorEdit", { doctorUid: doctor.uid })}
                    >
                        <Ionicons name="create-outline" size={18} color="#1a40c2" />
                    </TouchableOpacity>

                    {/* Verify toggle */}
                    <TouchableOpacity
                        style={[styles.iconButton, doctor.isVerified ? styles.iconButtonWarning : styles.iconButtonSuccess]}
                        onPress={() => handleVerify(doctor.uid, doctor.isVerified)}
                    >
                        <Ionicons
                            name={doctor.isVerified ? "close-circle-outline" : "checkmark-circle-outline"}
                            size={18}
                            color={doctor.isVerified ? "#e07b00" : "#1d8a4e"}
                        />
                    </TouchableOpacity>

                    {/* Remove */}
                    <TouchableOpacity
                        style={[styles.iconButton, styles.iconButtonDanger]}
                        onPress={() => handleRemove(doctor.uid, doctor.fullName)}
                    >
                        <Ionicons name="trash-outline" size={18} color="#ba1a1a" />
                    </TouchableOpacity>
                </View>
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
                    <Text style={styles.headerTitle}>Manage Doctors</Text>
                    <Text style={styles.headerSubtitle}>{doctors.length} total</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                <FilterTab label="All" value="all" />
                <FilterTab label="Pending" value="pending" />
                <FilterTab label="Verified" value="verified" />
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
                    {filteredDoctors.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="medkit-outline" size={48} color="#c4c5d6" />
                            <Text style={styles.emptyText}>No doctors found</Text>
                        </View>
                    ) : (
                        filteredDoctors.map((doctor) => (
                            <DoctorRow key={doctor.uid} doctor={doctor} />
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
    filterRow: {
        flexDirection: "row",
        backgroundColor: "#eceef1",
        borderRadius: 9999,
        margin: 20,
        padding: 4,
    },
    filterTab: { flex: 1, paddingVertical: 8, borderRadius: 9999, alignItems: "center" },
    filterTabActive: { backgroundColor: "#ffffff", elevation: 1 },
    filterTabText: { fontSize: 13, fontWeight: "500", color: "#444654" },
    filterTabTextActive: { color: "#1a40c2", fontWeight: "600" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 15, color: "#717273" },
    doctorCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    doctorLeft: { flexDirection: "row", gap: 12, flex: 1 },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { fontSize: 16, fontWeight: "bold", color: "#0C447C" },
    doctorInfo: { flex: 1, gap: 3 },
    doctorName: { fontSize: 15, fontWeight: "bold", color: "#191c1e" },
    doctorSpecialty: { fontSize: 12, color: "#444654" },
    doctorEmail: { fontSize: 11, color: "#717273" },
    badge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 9999,
        marginTop: 4,
    },
    badgeVerified: { backgroundColor: "#d4f5e2" },
    badgePending: { backgroundColor: "#fff4e6" },
    badgeText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
    badgeTextVerified: { color: "#1d8a4e" },
    badgeTextPending: { color: "#e07b00" },
    actionButtons: { flexDirection: "column", gap: 8, marginLeft: 8 },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    iconButtonSuccess: { backgroundColor: "#d4f5e2" },
    iconButtonWarning: { backgroundColor: "#fff4e6" },
    iconButtonDanger: { backgroundColor: "#fff0f0" },
});

export default AdminDoctorsPage;
