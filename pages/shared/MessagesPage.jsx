import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "../../config/firebase";

const MessagesPage = () => {
    const navigation = useNavigation();
    const [chatUsers, setChatUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentRole, setCurrentRole] = useState(null);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) { setLoading(false); return; }

        // First, get current user's role
        const userRef = ref(database, `users/${uid}`);
        const unsubUser = onValue(userRef, userSnap => {
            if (userSnap.exists()) {
                setCurrentRole(userSnap.val().role);
            }
        });

        // Listen to appointments to find chat-eligible users
        const appRef = ref(database, "appointments");
        const unsubApps = onValue(appRef, appSnap => {
            const eligibleUids = new Set();
            if (appSnap.exists()) {
                appSnap.forEach(c => {
                    const data = c.val();
                    // Only paid appointments create chat eligibility
                    if (data.paid === true) {
                        if (data.patientId === uid) {
                            eligibleUids.add(data.doctorId);
                        } else if (data.doctorId === uid) {
                            eligibleUids.add(data.patientId);
                        }
                    }
                });
            }

            if (eligibleUids.size === 0) {
                setChatUsers([]);
                setLoading(false);
                return;
            }

            // Fetch user details for eligible UIDs
            const usersRef = ref(database, "users");
            const unsubUsers = onValue(usersRef, usersSnap => {
                const users = [];
                if (usersSnap.exists()) {
                    usersSnap.forEach(child => {
                        if (eligibleUids.has(child.key)) {
                            users.push({ uid: child.key, ...child.val() });
                        }
                    });
                }

                // Also fetch doctor names if available
                const doctorsRef = ref(database, "doctors");
                onValue(doctorsRef, docSnap => {
                    const enriched = users.map(u => {
                        if (u.role === "doctor" && docSnap.exists()) {
                            const docData = docSnap.child(u.uid).val();
                            if (docData) {
                                return { ...u, fullName: docData.fullName || u.fullName, specialization: docData.primarySpecialization };
                            }
                        }
                        return u;
                    });
                    setChatUsers(enriched);
                    setLoading(false);
                }, { onlyOnce: true });
            }, { onlyOnce: true });
        });

        return () => { unsubUser(); unsubApps(); };
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.content} contentContainerStyle={{padding: 20, gap: 12}}>
                {loading ? <ActivityIndicator size="large" color="#1a40c2" /> :
                    chatUsers.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={56} color="#c4c5d6" />
                            <Text style={styles.emptyTitle}>No Conversations</Text>
                            <Text style={styles.emptyText}>
                                {currentRole === "patient" 
                                    ? "Book an appointment with a doctor to start chatting." 
                                    : "Your patients will appear here after they book an appointment."}
                            </Text>
                        </View>
                    ) :
                    chatUsers.map(u => {
                        const initials = u.fullName ? u.fullName.substring(0, 2).toUpperCase() : "U";
                        return (
                        <TouchableOpacity key={u.uid} style={styles.userCard} onPress={() => navigation.navigate("ChatPage", { otherUid: u.uid, otherName: u.fullName })}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{u.fullName}</Text>
                                <Text style={styles.userRole}>
                                    {u.role === "doctor" && u.specialization ? u.specialization : u.role}
                                </Text>
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
    content: { flex: 1 },
    emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 8 },
    emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#191c1e", marginTop: 8 },
    emptyText: { fontSize: 14, color: "#717273", textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
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