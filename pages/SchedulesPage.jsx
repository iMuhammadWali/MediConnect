import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

const SchedulesPage = () => {
    const navigation = useNavigation();

    const filterTabs = [
        { id: 1, name: "All", isActive: true },
        { id: 2, name: "Upcoming", isActive: false },
        { id: 3, name: "Completed", isActive: false },
        { id: 4, name: "Cancel", isActive: false },
    ];

    const appointments = [
        {
            id: 1,
            initials: "RA",
            name: "Dr. Robert Anderson",
            specialty: "Cardiologist",
            hospital: "City General Hospital",
            status: "Upcoming",
            statusColor: "#F39C12",
            statusBgColor: "#F39C12",
            date: "Mon, 12 Oct 2023",
            time: "10:30 AM - 11:00 AM",
            buttonText: "Reschedule",
            opacity: 1,
        },
        {
            id: 2,
            initials: "SL",
            name: "Dr. Sarah Lee",
            specialty: "Dermatologist",
            hospital: "Westside Clinic",
            status: "Complete",
            statusColor: "#005951",
            statusBgColor: "#84f6e6",
            date: "Fri, 02 Sep 2023",
            time: "02:00 PM - 02:45 PM",
            buttonText: "Make new appointment",
            opacity: 0.8,
        },
        {
            id: 3,
            initials: "MK",
            name: "Dr. Michael Chen",
            specialty: "Neurologist",
            hospital: "Central Medical Center",
            status: "Cancel",
            statusColor: "#93000a",
            statusBgColor: "#ffdad6",
            date: "Wed, 15 Aug 2023",
            time: "09:00 AM - 10:00 AM",
            buttonText: "Reschedule",
            opacity: 0.7,
        },
    ];

    const renderFilterTab = ({ item }) => (
        <TouchableOpacity style={[
            styles.filterTab,
            item.isActive && styles.activeFilterTab
        ]}>
            <Text style={[
                styles.filterTabText,
                item.isActive && styles.activeFilterTabText
            ]}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderAppointmentCard = ({ item }) => (
        <View style={[styles.appointmentCard, { opacity: item.opacity }]}>
            <View style={styles.cardLeft}>
                <View style={styles.doctorAvatar}>
                    <Text style={styles.doctorInitials}>{item.initials}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                    <Text style={styles.doctorName}>{item.name}</Text>
                    <Text style={styles.doctorDetails}>
                        {item.specialty} • <Text style={styles.hospitalName}>{item.hospital}</Text>
                    </Text>
                    <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, { color: item.statusColor }]}>
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
            <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>{item.buttonText}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                
                {/* Mobile Header */}
                <View style={styles.mobileHeader}>
                    <Text style={styles.headerTitle}>Schedules</Text>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userInitials}>JD</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#747686" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Find schedule"
                        placeholderTextColor="#747686"
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

                {/* Appointments List */}
                <FlatList
                    data={appointments}
                    renderItem={renderAppointmentCard}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    contentContainerStyle={styles.appointmentsList}
                />
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

export default SchedulesPage;