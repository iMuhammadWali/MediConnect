import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database, auth } from "../../config/firebase";

const DoctorSchedulePage = () => {
    const navigation = useNavigation();
    const [appointments, setAppointments] = useState([]);
    const [patientsMap, setPatientsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Upcoming");

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

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
            setLoading(false);
        });

        return () => { unsubUsers(); unsubApp(); };
    }, []);

    const handleCancel = (item) => {
        Alert.alert("Cancel Appointment", "Are you sure you want to cancel this appointment?", [
            { text: "No", style: "cancel" },
            { text: "Yes", style: "destructive", onPress: () => {
                update(ref(database, `appointments/${item.id}`), { status: "Cancel" })
                    .catch(err => Alert.alert("Error", err.message));
            }}
        ]);
    };

    const handleComplete = (item) => {
        Alert.alert("Mark Completed", "Mark this appointment as completed?", [
            { text: "Cancel", style: "cancel" },
            { text: "Confirm", onPress: () => {
                update(ref(database, `appointments/${item.id}`), { status: "Completed" })
                    .catch(err => Alert.alert("Error", err.message));
            }}
        ]);
    };

    const filteredAppointments = appointments.filter(app => {
        if (activeTab === "Upcoming") return app.status === "Upcoming";
        if (activeTab === "Past") return app.status === "Completed" || app.status === "Cancel";
        return true;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case "Upcoming": return { color: "#F39C12", bg: "rgba(243, 156, 18, 0.1)" };
            case "Completed": return { color: "#005951", bg: "#84f6e6" };
            case "Cancel": return { color: "#93000a", bg: "#ffdad6" };
            default: return { color: "#747686", bg: "#e6e8eb" };
        }
    };

    const renderAppointment = ({ item }) => {
        const pName = patientsMap[item.patientId]?.fullName || "Unknown Patient";
        const pInitials = pName.substring(0, 2).toUpperCase() || "PT";
        const st = getStatusStyle(item.status);

        return (
            <View style={[styles.appointmentCard, item.status === "Cancel" && { opacity: 0.6 }]}>
                <View style={styles.cardHeader}>
                    <View style={styles.patientInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{pInitials}</Text>
                        </View>
                        <View>
                            <Text style={styles.patientName}>{pName}</Text>
                            <Text style={styles.appointmentType}>Consultation</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                        <Text style={[styles.statusText, { color: st.color }]}>{item.status}</Text>
                    </View>
                </View>
                
                <View style={styles.dateTimeRow}>
                    <View style={styles.dateTimeItem}>
                        <Ionicons name="calendar-outline" size={16} color="#747686" />
                        <Text style={styles.dateTimeText}>{item.date}</Text>
                    </View>
                    <View style={styles.dateTimeItem}>
                        <Ionicons name="time-outline" size={16} color="#747686" />
                        <Text style={styles.dateTimeText}>{item.time}</Text>
                    </View>
                </View>

                {item.status === "Upcoming" && (
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => handleCancel(item)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, styles.completeBtn]} onPress={() => handleComplete(item)}>
                            <Text style={styles.completeBtnText}>Mark Completed</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <TouchableOpacity 
                    style={styles.viewPatientBtn} 
                    onPress={() => navigation.navigate("PatientDetails", { patientId: item.patientId })}
                >
                    <Text style={styles.viewPatientBtnText}>View Patient Details</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Schedule</Text>
                <Text style={styles.headerSubtitle}>Manage your appointments</Text>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === "Upcoming" && styles.activeTab]} 
                    onPress={() => setActiveTab("Upcoming")}
                >
                    <Text style={[styles.tabText, activeTab === "Upcoming" && styles.activeTabText]}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === "Past" && styles.activeTab]} 
                    onPress={() => setActiveTab("Past")}
                >
                    <Text style={[styles.tabText, activeTab === "Past" && styles.activeTabText]}>Past</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1a40c2" />
                </View>
            ) : filteredAppointments.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="calendar-clear-outline" size={48} color="#c4c5d6" />
                    <Text style={styles.emptyText}>No {activeTab.toLowerCase()} appointments.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredAppointments}
                    keyExtractor={item => item.id}
                    renderItem={renderAppointment}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    header: { padding: 20, backgroundColor: "#1a40c2", borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
    headerSubtitle: { fontSize: 14, color: "#a5b4fc", marginTop: 4 },
    tabsContainer: { flexDirection: "row", paddingHorizontal: 20, marginTop: 16, marginBottom: 8, gap: 12 },
    tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 9999, backgroundColor: "#e6e8eb" },
    activeTab: { backgroundColor: "#1a40c2" },
    tabText: { fontSize: 14, fontWeight: "600", color: "#747686" },
    activeTabText: { color: "#ffffff" },
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyText: { fontSize: 15, color: "#747686" },
    listContent: { padding: 20, gap: 16 },
    appointmentCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
    patientInfo: { flexDirection: "row", gap: 12, alignItems: "center" },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 16, fontWeight: "bold", color: "#0C447C" },
    patientName: { fontSize: 16, fontWeight: "bold", color: "#191c1e", marginBottom: 2 },
    appointmentType: { fontSize: 12, color: "#747686" },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
    statusText: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },
    dateTimeRow: { flexDirection: "row", gap: 16, backgroundColor: "#f2f4f7", padding: 12, borderRadius: 12, marginBottom: 16 },
    dateTimeItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    dateTimeText: { fontSize: 13, color: "#444654", fontWeight: "500" },
    actionsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
    actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    cancelBtn: { backgroundColor: "#fff0f0", borderWidth: 1, borderColor: "#ffdad6" },
    cancelBtnText: { color: "#ba1a1a", fontWeight: "600", fontSize: 13 },
    completeBtn: { backgroundColor: "#1a40c2" },
    completeBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 13 },
    viewPatientBtn: { backgroundColor: "#E6F1FB", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
    viewPatientBtnText: { color: "#0736ba", fontWeight: "600", fontSize: 13 }
});

export default DoctorSchedulePage;
