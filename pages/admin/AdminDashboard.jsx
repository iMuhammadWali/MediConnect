import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { TopBar } from "../../components/TopBar";

const AdminDashboard = () => {
    const navigation = useNavigation();
    const [stats, setStats] = useState({ doctors: 0, patients: 0, pending: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to users node to count patients and doctors
        const usersRef = ref(database, "users");
        const unsubscribeUsers = onValue(usersRef, (snapshot) => {
            let patients = 0;
            let doctors = 0;
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    const role = child.val().role;
                    if (role === "patient") patients++;
                    else if (role === "doctor") doctors++;
                });
            }
            setStats((prev) => ({ ...prev, doctors, patients }));
        });

        // Listen to doctors node to count unverified
        const doctorsRef = ref(database, "doctors");
        const unsubscribeDoctors = onValue(doctorsRef, (snapshot) => {
            let pending = 0;
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    if (child.val().isVerified === false) pending++;
                });
            }
            setStats((prev) => ({ ...prev, pending }));
            setLoading(false);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeDoctors();
        };
    }, []);

    const statCards = [
        { title: "Total Doctors", value: stats.doctors, icon: "medkit-outline", color: "#E6F1FB", iconColor: "#1a40c2", screen: "AdminDoctors" },
        { title: "Total Patients", value: stats.patients, icon: "people-outline", color: "#E6F1FB", iconColor: "#1a40c2", screen: "AdminPatients" },
        { title: "Pending Approval", value: stats.pending, icon: "hourglass-outline", color: "#fff4e6", iconColor: "#e07b00", screen: "AdminDoctors" },
    ];

    const quickActions = [
        { title: "Manage Doctors", subtitle: "View, verify & edit doctors", icon: "medkit-outline", screen: "AdminDoctors" },
        { title: "Manage Patients", subtitle: "View & remove patients", icon: "people-outline", screen: "AdminPatients" },
        { title: "Add Hospital", subtitle: "Add new hospital to directory", icon: "business-outline", screen: "AdminAddHospital" },
    ];

    const StatCard = ({ title, value, icon, color, iconColor, screen }) => (
        <TouchableOpacity
            style={[styles.statCard, { backgroundColor: color }]}
            onPress={() => navigation.navigate(screen)}
        >
            <Ionicons name={icon} size={24} color={iconColor} />
            <View style={styles.statTextContainer}>
                <Text style={styles.statTitle}>{title}</Text>
                {loading ? (
                    <ActivityIndicator size="small" color={iconColor} style={{ marginTop: 4 }} />
                ) : (
                    <Text style={styles.statValue}>{value}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <TopBar
                userName="Admin"
                avatarText="AD"
                greeting="Admin Panel"
                onNotificationPress={() => {}}
            />
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Stats Section */}
                <View style={styles.statsSection}>
                    {statCards.map((card) => (
                        <StatCard key={card.title} {...card} />
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.actionsList}>
                        {quickActions.map((action) => (
                            <TouchableOpacity
                                key={action.title}
                                style={styles.actionCard}
                                onPress={() => navigation.navigate(action.screen)}
                            >
                                <View style={styles.actionIconContainer}>
                                    <Ionicons name={action.icon} size={22} color="#1a40c2" />
                                </View>
                                <View style={styles.actionText}>
                                    <Text style={styles.actionTitle}>{action.title}</Text>
                                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#c4c5d6" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Sign Out */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.signOutButton}
                        onPress={() => signOut(auth)}
                    >
                        <Ionicons name="log-out-outline" size={18} color="#ba1a1a" />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 32 },
    statsSection: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginTop: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        justifyContent: "space-between",
        aspectRatio: 1,
    },
    statTextContainer: { marginTop: 12 },
    statTitle: {
        fontSize: 10,
        fontWeight: "500",
        color: "#444654",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: { fontSize: 26, fontWeight: "bold", color: "#191c1e" },
    section: { marginTop: 28, paddingHorizontal: 20 },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#191c1e",
        letterSpacing: -0.5,
        marginBottom: 14,
    },
    actionsList: { gap: 10 },
    actionCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 12,
        elevation: 1,
    },
    actionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    actionText: { flex: 1 },
    actionTitle: { fontSize: 15, fontWeight: "bold", color: "#191c1e", marginBottom: 2 },
    actionSubtitle: { fontSize: 12, color: "#717273" },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#fff0f0",
        borderRadius: 9999,
        paddingVertical: 14,
    },
    signOutText: { fontSize: 14, fontWeight: "600", color: "#ba1a1a" },
});

export default AdminDashboard;
