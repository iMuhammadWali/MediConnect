import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export const TopBar = ({ userName, avatarText, greeting = "Good Morning", onNotificationPress, statusBadge }) => {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{avatarText || "A"}</Text>
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.greeting}>{greeting}</Text>
                    <View style={styles.nameRow}>
                        <Text style={styles.welcomeName} numberOfLines={1}>{userName}</Text>
                        {statusBadge && (
                            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor || "rgba(255,255,255,0.2)" }]}>
                                <View style={[styles.statusDot, { backgroundColor: statusBadge.dotColor || "#ffffff" }]} />
                                <Text style={[styles.statusText, { color: statusBadge.textColor || "#ffffff" }]}>{statusBadge.text}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
                <Ionicons name="notifications-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1a40c2",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#dde1ff",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#001355",
    },
    nameContainer: {
        flex: 1,
    },
    greeting: {
        fontSize: 12,
        color: "#a5b4fc",
        fontWeight: "500",
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
    },
    welcomeName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ffffff",
        flexShrink: 1,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 9999,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 9,
        fontWeight: "bold",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
});