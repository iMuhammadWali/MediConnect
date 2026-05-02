import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from "../components/TopBar";
import { HorizontalScrollList } from "../components/HorizontalScrollList";

const DoctorDashboardPage = () => {
    const navigation = useNavigation();

    const stats = [
        { id: 1, title: "Today's Appts", value: "12", icon: "calendar-outline", color: "#E6F1FB", iconColor: "#1a40c2" },
        { id: 2, title: "Total Patients", value: "1,240", icon: "people-outline", color: "#E6F1FB", iconColor: "#1a40c2" },
        { id: 3, title: "Pending Prescriptions", value: "08", icon: "document-text-outline", color: "#E6F1FB", iconColor: "#1a40c2" },
    ];

    const todaySchedule = [
        { id: 1, initials: "AS", name: "Arjun Sharma", time: "09:30 AM", type: "Follow-up", typeColor: "#84f6e6", typeTextColor: "#005049" },
        { id: 2, initials: "PK", name: "Priya Kapoor", time: "10:15 AM", type: "Consultation", typeColor: "#dde1ff", typeTextColor: "#0736ba" },
        { id: 3, initials: "RK", name: "Rohan Khan", time: "11:00 AM", type: "Follow-up", typeColor: "#84f6e6", typeTextColor: "#005049" },
        { id: 4, initials: "ML", name: "Meera Lynch", time: "11:45 AM", type: "Consultation", typeColor: "#dde1ff", typeTextColor: "#0736ba" },
    ];

    const StatCard = ({ title, value, icon, color, iconColor }) => (
        <View style={[styles.statCard, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color={iconColor} />
            <View style={styles.statTextContainer}>
                <Text style={styles.statTitle}>{title}</Text>
                <Text style={styles.statValue}>{value}</Text>
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
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                
                <TopBar 
                    userName="Dr. Claire"
                    avatarText="DC"
                    greeting="Good Morning"
                    onNotificationPress={() => navigation.navigate("Notifications")}
                />

                {/* Stats Section */}
                <View style={styles.statsSection}>
                    {stats.map((stat) => (
                        <StatCard key={stat.id} {...stat} />
                    ))}
                </View>

                {/* Today's Schedule Section */}
                <View style={styles.scheduleSection}>
                    <View style={styles.scheduleHeader}>
                        <Text style={styles.sectionTitle}>Today's Schedule</Text>
                        <TouchableOpacity onPress={() => navigation.navigate("AllSchedules")}>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.scheduleList}>
                        {todaySchedule.map((item) => (
                            <ScheduleItem 
                                key={item.id} 
                                item={item} 
                                onPress={() => navigation.navigate("PatientDetails", { patientId: item.id })}
                            />
                        ))}
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
        paddingBottom: 24,
    },
    statsSection: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginTop: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#E6F1FB",
        padding: 16,
        borderRadius: 16,
        justifyContent: "space-between",
        aspectRatio: 1,
    },
    statTextContainer: {
        marginTop: 12,
    },
    statTitle: {
        fontSize: 11,
        fontWeight: "500",
        color: "#444654",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#191c1e",
    },
    scheduleSection: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    scheduleHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#191c1e",
        letterSpacing: -0.5,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a40c2",
    },
    scheduleList: {
        gap: 12,
    },
    scheduleCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 12,
        elevation: 1,
    },
    scheduleLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    patientAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    patientInitials: {
        fontSize: 16,
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
        fontSize: 14,
        color: "#444654",
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#c4c5d6",
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 9999,
    },
    typeText: {
        fontSize: 10,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    viewButton: {
        backgroundColor: "#3B5BDB",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
    },
    viewButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "bold",
    },
});

export default DoctorDashboardPage;