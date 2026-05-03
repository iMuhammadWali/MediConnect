import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "../config/firebase";

const MessagesPage = () => {
    const navigation = useNavigation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const uRef = ref(database, "users");
        const unsub = onValue(uRef, snapshot => {
            const res = [];
            if (snapshot.exists()) {
                snapshot.forEach(c => {
                    if (c.key !== auth.currentUser?.uid && c.val().role !== "admin") {
                        res.push({ uid: c.key, ...c.val() });
                    }
                });
            }
            setUsers(res);
            setLoading(false);
        });
        return unsub;
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.content} contentContainerStyle={{padding: 20, gap: 12}}>
                {loading ? <ActivityIndicator size="large" color="#1a40c2" /> :
                    users.length === 0 ? (
                        <Text style={styles.emptyText}>No users to chat with</Text>
                    ) :
                    users.map(u => {
                        const initials = u.fullName ? u.fullName.substring(0, 2).toUpperCase() : "U";
                        return (
                        <TouchableOpacity key={u.uid} style={styles.userCard} onPress={() => navigation.navigate("ChatPage", { otherUid: u.uid, otherName: u.fullName })}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{u.fullName}</Text>
                                <Text style={styles.userRole}>{u.role}</Text>
                            </View>
                            <Ionicons name="chatbubble-outline" size={20} color="#1a40c2" />
                        </TouchableOpacity>
                    )})
                }
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    header: {
        backgroundColor: "#1a40c2",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: "#ffffff" },
    content: { flex: 1 },
    emptyText: { textAlign: "center", color: "#717273", marginTop: 20 },
    userCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
        gap: 16
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: { fontSize: 16, fontWeight: "bold", color: "#0C447C" },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: "bold", color: "#191c1e" },
    userRole: { fontSize: 12, color: "#717273", textTransform: "capitalize" }
});

export default MessagesPage;