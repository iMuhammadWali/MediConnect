import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from "../../components/TopBar";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "../../config/firebase";

const DoctorDashboardPage = () => {
    const navigation = useNavigation();

    const [doctorName, setDoctorName] = useState("Doctor");
    const [isVerified, setIsVerified] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [patientsMap, setPatientsMap] = useState({});
    const [rating, setRating] = useState(0);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const docRef = ref(database, `doctors/${uid}`);
        const unsubDoc = onValue(docRef, snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setDoctorName(data.fullName);
                setIsVerified(data.isVerified === true);
                setRating(data.rating || 0);
            }
        });

        const appRef = ref(database, "appointments");
        const unsubApp = onValue(appRef, snapshot => {
            const apps = [];
            if (snapshot.exists()) {
                snapshot.forEach(c => {
                    const data = c.val();
                    if (data.doctorId === uid) {
                        apps.push({ id: c.key, ...data });
                    }
                });
            }
            setAppointments(apps.reverse());
        });

        const usersRef = ref(database, "users");
        const unsubUsers = onValue(usersRef, snapshot => {
            const pMap = {};
            if (snapshot.exists()) {
                snapshot.forEach(c => {
                    pMap[c.key] = c.val();
                });
            }
            setPatientsMap(pMap);
        });

        return () => { unsubDoc(); unsubApp(); unsubUsers(); };
    }, []);

    const upcomingApps = appointments.filter(a => a.status === "Upcoming");
    const totalPatients = new Set(appointments.map(a => a.patientId)).size;

    const stats = [
        { id: 1, title: "Upcoming Appts", value: upcomingApps.length.toString(), icon: "calendar-outline", color: "#E6F1FB", iconColor: "#1a40c2" },
        { id: 2, title: "Total Patients", value: totalPatients.toString(), icon: "people-outline", color: "#E6F1FB", iconColor: "#1a40c2" },
        { id: 3, title: "Rating", value: rating.toString(), icon: "star", color: "#fff9db", iconColor: "#f59e0b" },
    ];

    const getApprovalBadge = () => {
        if (isVerified) {
            return { text: "Approved", dotColor: "#34d399", bgColor: "rgba(52, 211, 153, 0.2)", textColor: "#d1fae5" };
        }
        return { text: "Pending", dotColor: "#fbbf24", bgColor: "rgba(251, 191, 36, 0.25)", textColor: "#fef3c7" };
    };

    const StatCard = ({ title, value, icon, color, iconColor }) => (
        <View style={[styles.statCard, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color={iconColor} />
            <View style={styles.statTextContainer}>
                <Text style={styles.statTitle} numberOfLines={2}>{title}</Text>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
            </View>
        </View>
    );

    const ScheduleItem = ({ item, onPress }) => (
        <View style={styles.scheduleCard}>
            <View style={styles.scheduleLeft}>
                <View style={styles.patientAvatar}>
                    <Text style={styles.patientInitials}>{item.initials}</Text>
                </View>
                <View>
                    <Text style={styles.patientName}>{item.name}</Text>
                    <View style={styles.patientDetails}>
                        <Text style={styles.appointmentTime}>{item.time}</Text>
                        <View style={styles.dot} />
                        <View style={[styles.typeBadge, { backgroundColor: item.typeColor }]}>
                            <Text style={[styles.typeText, { color: item.typeTextColor }]}>{item.type}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.viewButton} onPress={onPress}>
                <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <TopBar
                userName={doctorName}
                avatarText={doctorName.replace("Dr. ", "").substring(0, 2).toUpperCase() || "DR"}
                greeting="Good Morning"
                onNotificationPress={() => { }}
                statusBadge={getApprovalBadge()}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Pending approval banner - now inside ScrollView to prevent layout shifting */}
                {!isVerified && (
                    <View style={styles.pendingBanner}>
                        <View style={styles.bannerIconContainer}>
                            <Ionicons name="information-circle" size={22} color="#92400e" />
                        </View>
                        <Text style={styles.pendingBannerText}>
                            Your profile is pending admin approval. You can add affiliations once approved.
                        </Text>
                    </View>
                )}

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    {stats.map((stat) => (
                        <StatCard key={stat.id} {...stat} />
                    ))}
                </View>

                {/* Quick Actions Section */}
                <View style={styles.quickActionsSection}>
                    <Text style={styles.sectionLabel}>Quick Actions</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate("DoctorAffiliations")}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#eef2ff' }]}>
                                <Ionicons name="business" size={24} color="#4767e6" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.quickActionText}>Manage Affiliations</Text>
                                <Text style={styles.quickActionSubtext}>Hospitals & schedules</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#c4c5d6" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => navigation.navigate("DoctorPrescriptions")}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: '#fdf2f8' }]}>
                                <Ionicons name="document-text" size={24} color="#db2777" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.quickActionText}>Prescriptions</Text>
                                <Text style={styles.quickActionSubtext}>Manage patient records</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#c4c5d6" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Today's Schedule Section */}
                <View style={styles.scheduleSection}>
                    <View style={styles.scheduleHeader}>
                        <Text style={styles.sectionTitle}>Upcoming Schedule</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Schedule")} style={styles.viewAllBtn}>
                            <Text style={styles.viewAllText}>View All</Text>
                            <Ionicons name="arrow-forward" size={14} color="#1a40c2" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.scheduleList}>
                        {upcomingApps.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={48} color="#c4c5d6" />
                                <Text style={styles.emptyStateText}>No upcoming appointments.</Text>
                            </View>
                        ) : upcomingApps.slice(0, 5).map((item) => {
                            const pName = patientsMap[item.patientId]?.fullName || "Loading Patient...";
                            const pInitials = pName !== "Loading Patient..." ? pName.substring(0, 2).toUpperCase() : "PT";
                            return (
                                <ScheduleItem
                                    key={item.id}
                                    item={{
                                        initials: pInitials,
                                        name: pName,
                                        time: `${item.date || "TBD"} at ${item.time || "TBD"}`,
                                        type: "Consultation",
                                        typeColor: "#dde1ff",
                                        typeTextColor: "#0736ba",
                                    }}
                                    onPress={() => navigation.navigate("PatientDetails", { patientId: item.patientId })}
                                />
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fc",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    pendingBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#fef3c7",
        marginHorizontal: 20,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#f59e0b",
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    bannerIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    pendingBannerText: {
        flex: 1,
        fontSize: 13,
        color: "#92400e",
        lineHeight: 18,
        fontWeight: "600",
    },
    statsSection: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#E6F1FB",
        padding: 14,
        borderRadius: 20,
        justifyContent: "space-between",
        minHeight: 120,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 1,
    },
    statTextContainer: {
        marginTop: 14,
    },
    statTitle: {
        fontSize: 10,
        fontWeight: "700",
        color: "#747686",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#191c1e",
    },
    quickActionsSection: {
        paddingHorizontal: 20,
        marginTop: 28,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#747686",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 16,
        marginLeft: 4,
    },
    actionsGrid: {
        gap: 12,
    },
    quickActionButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: "#f0f2f5",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    quickActionText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#191c1e",
    },
    quickActionSubtext: {
        fontSize: 12,
        color: "#747686",
        marginTop: 2,
    },
    scheduleSection: {
        marginTop: 32,
        paddingHorizontal: 20,
    },
    scheduleHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#191c1e",
        letterSpacing: -0.5,
    },
    viewAllBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#f0f4ff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 9999,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1a40c2",
    },
    scheduleList: {
        gap: 14,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
        backgroundColor: "#fff",
        borderRadius: 24,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#c4c5d6",
    },
    emptyStateText: {
        color: "#747686",
        fontSize: 14,
        marginTop: 12,
        fontWeight: "500",
    },
    scheduleCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.03,
        shadowRadius: 16,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f8f9fa",
    },
    scheduleLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    patientAvatar: {
        width: 52,
        height: 52,
        borderRadius: 18,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    patientInitials: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0C447C",
    },
    patientName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#191c1e",
        marginBottom: 4,
    },
    patientDetails: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    appointmentTime: {
        fontSize: 13,
        color: "#747686",
        fontWeight: "500",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#c4c5d6",
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 9,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    viewButton: {
        backgroundColor: "#1a40c2",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    viewButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "bold",
    },
});

export default DoctorDashboardPage;