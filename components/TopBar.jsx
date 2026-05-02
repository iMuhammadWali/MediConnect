import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export const TopBar = ({ userName, avatarText, greeting = "Good Morning", onNotificationPress }) => {
    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{avatarText || "A"}</Text>
                </View>
                <View>
                    <Text style={styles.greeting}>{greeting}</Text>
                    <Text style={styles.welcomeText}>Welcome Back</Text>
                    <Text style={styles.welcomeName}>{userName}</Text>
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
    greeting: {
        fontSize: 12,
        color: "#a5b4fc",
        fontWeight: "500",
    },
    welcomeText: {
        fontSize: 14,
        color: "#ffffff",
        fontWeight: "bold",
    },
    welcomeName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#ffffff",
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