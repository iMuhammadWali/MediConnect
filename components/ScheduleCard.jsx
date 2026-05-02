// components/ScheduleCard.js
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export const ScheduleCard = ({ 
    doctorInitials, 
    doctorName, 
    doctorSpecialty, 
    date, 
    time, 
    status = "Confirmed",
    statusColor = "#84f6e6",
    statusTextColor = "#005951",
    onPress,
    onSeeAllPress 
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Schedule Today</Text>
                {onSeeAllPress && (
                    <TouchableOpacity onPress={onSeeAllPress}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={styles.scheduleCard} onPress={onPress}>
                <View style={styles.doctorInfo}>
                    <View style={styles.doctorAvatar}>
                        <Text style={styles.doctorAvatarText}>{doctorInitials}</Text>
                    </View>
                    <View>
                        <Text style={styles.doctorName}>{doctorName}</Text>
                        <Text style={styles.doctorSpecialty}>{doctorSpecialty}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={[styles.statusText, { color: statusTextColor }]}>{status}</Text>
                    </View>
                </View>
                <View style={styles.appointmentDetails}>
                    <View style={styles.appointmentDetail}>
                        <Ionicons name="calendar" size={20} color="#3b5bdb" />
                        <Text style={styles.detailText}>{date}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.appointmentDetail}>
                        <Ionicons name="time" size={20} color="#3b5bdb" />
                        <Text style={styles.detailText}>{time}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#191c1e",
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#3b5bdb",
    },
    scheduleCard: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        padding: 20,
        shadowColor: "#3b5bdb",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        borderWidth: 0.2,
        borderColor: "#c4c5d6",
        overflow: "hidden",
    },
    doctorInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 16,
    },
    doctorAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#b8c3ff",
        alignItems: "center",
        justifyContent: "center",
    },
    doctorAvatarText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#001355",
    },
    doctorName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#191c1e",
    },
    doctorSpecialty: {
        fontSize: 14,
        fontWeight: "500",
        color: "#444654",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
        marginLeft: "auto",
    },
    statusText: {
        fontSize: 12,
        fontWeight: "bold",
    },
    appointmentDetails: {
        flexDirection: "row",
        backgroundColor: "#f2f4f7",
        borderRadius: 16,
        padding: 16,
        justifyContent: "space-between",
    },
    appointmentDetail: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#444654",
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: "#c4c5d6",
    },
});