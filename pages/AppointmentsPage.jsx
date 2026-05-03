import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database, auth } from "../config/firebase";

const AppointmentsPage = () => {
    const navigation = useNavigation();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    useEffect(() => {
        const appRef = ref(database, "appointments");
        const unsub = onValue(appRef, snapshot => {
            const res = [];
            if (snapshot.exists()) {
                snapshot.forEach(c => {
                    const data = c.val();
                    if (data.patientId === auth.currentUser?.uid || data.doctorId === auth.currentUser?.uid) {
                        res.push({ id: c.key, ...data });
                    }
                });
            }
            setAppointments(res.reverse());
            setLoading(false);
        });
        return unsub;
    }, []);

    const filterTabs = [
        { id: 1, name: "All", value: "All" },
        { id: 2, name: "Upcoming", value: "Upcoming" },
        { id: 3, name: "Completed", value: "Completed" },
        { id: 4, name: "Cancel", value: "Cancel" },
    ];

    const filteredAppointments = appointments.filter(app => {
        const matchesSearch = app.doctorName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "All" || app.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case "Upcoming": return { color: "#F39C12", bgColor: "rgba(243, 156, 18, 0.1)" };
            case "Completed": return { color: "#005951", bgColor: "#84f6e6" };
            case "Cancel": return { color: "#93000a", bgColor: "#ffdad6" };
            default: return { color: "#747686", bgColor: "#e6e8eb" };
        }
    };

    const handleAction = (item) => {
        if (item.status === "Upcoming") {
            Alert.alert("Cancel Appointment", "Are you sure you want to cancel?", [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => {
                    update(ref(database, `appointments/${item.id}`), { status: "Cancel" })
                        .catch(err => alert(err.message));
                }}
            ]);
        } else {
            if (auth.currentUser?.uid === item.doctorId) {
                navigation.navigate("PatientDetails", { patientId: item.patientId });
            } else {
                navigation.navigate("DoctorDetails", { doctorId: item.doctorId });
            }
        }
    };

    const renderFilterTab = ({ item }) => (
        <TouchableOpacity style={[
            styles.filterTab,
            activeTab === item.value && styles.activeFilterTab
        ]} onPress={() => setActiveTab(item.value)}>
            <Text style={[
                styles.filterTabText,
                activeTab === item.value && styles.activeFilterTabText
            ]}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderAppointmentCard = ({ item }) => {
        const statusStyle = getStatusStyle(item.status);
        const initials = item.doctorName ? item.doctorName.replace("Dr. ", "").substring(0, 2).toUpperCase() : "DR";
        return (
            <View style={[styles.appointmentCard, { opacity: item.status === "Cancel" ? 0.7 : 1 }]}>
                <View style={styles.cardLeft}>
                    <View style={styles.doctorAvatar}>
                        <Text style={styles.doctorInitials}>{initials}</Text>
                    </View>
                    <View style={styles.appointmentInfo}>
                        <Text style={styles.doctorName}>{item.doctorName}</Text>
                        <Text style={styles.doctorDetails}>
                            Specialist • <Text style={styles.hospitalName}>{item.hospital || "Hospital"}</Text>
                        </Text>
                        <View style={styles.statusBadge}>
                            <Text style={[styles.statusText, { color: statusStyle.color, backgroundColor: statusStyle.bgColor }]}>
                                {item.status}
                            </Text>
                        </View>
                        <View style={styles.dateTimeContainer}>
                            <View style={styles.dateTimeItem}>
                                <Ionicons name="calendar" size={18} color="#747686" />
                                <Text style={styles.dateTimeText}>{item.date}</Text>
                            </View>
                            <View style={styles.dateTimeItem}>
                                <Ionicons name="time" size={18} color="#747686" />
                                <Text style={styles.dateTimeText}>{item.time}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleAction(item)}>
                    <Text style={styles.actionButtonText}>
                        {item.status === "Upcoming" 
                            ? "Cancel Appointment" 
                            : (auth.currentUser?.uid === item.doctorId ? "View Patient" : "Book Again")}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                
                {/* Mobile Header */}
                <View style={styles.mobileHeader}>
                    <Text style={styles.headerTitle}>Appointments</Text>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userInitials}>PA</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#747686" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Find schedule"
                        placeholderTextColor="#747686"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter Tabs */}
                <FlatList
                    data={filterTabs}
                    renderItem={renderFilterTab}
                    keyExtractor={(item) => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersList}
                />

                {loading ? <ActivityIndicator size="large" color="#1a40c2" style={{marginTop: 20}} /> :
                    filteredAppointments.length === 0 ? (
                        <Text style={{textAlign: "center", color: "#747686", marginTop: 40}}>No schedule found.</Text>
                    ) :
                    <FlatList
                        data={filteredAppointments}
                        renderItem={renderAppointmentCard}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        contentContainerStyle={styles.appointmentsList}
                    />
                }
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
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    mobileHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "bold",
        letterSpacing: -0.5,
        color: "#191c1e",
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#dde1ff",
        alignItems: "center",
        justifyContent: "center",
    },
    userInitials: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1a40c2",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e6e8eb",
        borderRadius: 9999,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: "#191c1e",
    },
    filtersList: {
        marginBottom: 24,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 9999,
        backgroundColor: "#f2f4f7",
        marginRight: 8,
    },
    activeFilterTab: {
        backgroundColor: "#1a40c2",
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#444654",
    },
    activeFilterTabText: {
        color: "#ffffff",
    },
    appointmentsList: {
        gap: 16,
    },
    appointmentCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(196, 197, 214, 0.15)",
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    cardLeft: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 16,
    },
    doctorAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#e6f1fb",
        alignItems: "center",
        justifyContent: "center",
    },
    doctorInitials: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0c447c",
    },
    appointmentInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#191c1e",
        marginBottom: 4,
    },
    doctorDetails: {
        fontSize: 14,
        color: "#444654",
        marginBottom: 12,
    },
    hospitalName: {
        color: "#00746a",
        fontWeight: "500",
    },
    statusBadge: {
        marginBottom: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        backgroundColor: "rgba(243, 156, 18, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
        alignSelf: "flex-start",
        overflow: "hidden",
    },
    dateTimeContainer: {
        gap: 8,
    },
    dateTimeItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    dateTimeText: {
        fontSize: 14,
        color: "#747686",
    },
    actionButton: {
        backgroundColor: "#3B5BDB",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 9999,
        alignItems: "center",
        shadowColor: "#3b5bdb",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    actionButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
});

export default AppointmentsPage;