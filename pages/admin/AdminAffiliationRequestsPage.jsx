import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { database } from "../../config/firebase";
import { ref, onValue, update } from "firebase/database";

const AdminAffiliationRequestsPage = () => {
    const navigation = useNavigation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const doctorsRef = ref(database, "doctors");
        const unsub = onValue(doctorsRef, snapshot => {
            const pendingReqs = [];
            if (snapshot.exists()) {
                snapshot.forEach(docSnap => {
                    const docData = docSnap.val();
                    const docId = docSnap.key;
                    
                    if (docData.detailedAffiliations) {
                        Object.entries(docData.detailedAffiliations).forEach(([affilId, affilData]) => {
                            if (affilData.status === "pending") {
                                pendingReqs.push({
                                    docId,
                                    docName: docData.fullName,
                                    isVerified: docData.isVerified === true,
                                    affilId,
                                    ...affilData
                                });
                            }
                        });
                    }
                });
            }
            // Sort by createdAt (oldest first or newest first)
            setRequests(pendingReqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleAction = async (item, action) => {
        const statusText = action === "approved" ? "Approve" : "Reject";
        Alert.alert(
            `${statusText} Request`,
            `Are you sure you want to ${statusText.toLowerCase()} this affiliation request for Dr. ${item.docName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: statusText,
                    style: action === "rejected" ? "destructive" : "default",
                    onPress: async () => {
                        try {
                            await update(ref(database, `doctors/${item.docId}/detailedAffiliations/${item.affilId}`), {
                                status: action
                            });
                        } catch (error) {
                            Alert.alert("Error", error.message);
                        }
                    }
                }
            ]
        );
    };

    const renderRequest = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.doctorInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.docName.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Text style={styles.doctorName}>Dr. {item.docName}</Text>
                            {!item.isVerified && (
                                <View style={{ backgroundColor: "#fff0f0", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                    <Text style={{ fontSize: 9, color: "#ba1a1a", fontWeight: "bold" }}>UNVERIFIED</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.dateText}>Requested on {new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.hospitalBox}>
                <Ionicons name="business" size={20} color="#1a40c2" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.hospitalName} numberOfLines={1}>{item.hospitalName}</Text>
                    <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
                </View>
            </View>

            <View style={styles.scheduleRow}>
                <View style={styles.scheduleItem}>
                    <Ionicons name="calendar-outline" size={16} color="#747686" />
                    <Text style={styles.scheduleText}>{item.workingDays?.join(", ")}</Text>
                </View>
                <View style={styles.scheduleItem}>
                    <Ionicons name="time-outline" size={16} color="#747686" />
                    <Text style={styles.scheduleText}>{item.startTime} - {item.endTime}</Text>
                </View>
                <View style={styles.scheduleItem}>
                    <Ionicons name="cash-outline" size={16} color="#747686" />
                    <Text style={styles.scheduleText}>PKR {item.consultationFee}</Text>
                </View>
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.rejectBtn]} 
                    onPress={() => handleAction(item, "rejected")}
                >
                    <Ionicons name="close" size={18} color="#ba1a1a" />
                    <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.approveBtn, !item.isVerified && { opacity: 0.5 }]} 
                    onPress={() => {
                        if (!item.isVerified) {
                            Alert.alert("Doctor Unverified", "You cannot approve affiliations for unverified doctors. Verify the doctor first.");
                            return;
                        }
                        handleAction(item, "approved");
                    }}
                >
                    <Ionicons name="checkmark" size={18} color="#ffffff" />
                    <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Affiliation Requests</Text>
                    <Text style={styles.headerSubtitle}>{requests.length} Pending</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1a40c2" />
                </View>
            ) : requests.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="checkmark-circle-outline" size={48} color="#c4c5d6" />
                    <Text style={styles.emptyText}>No pending affiliation requests.</Text>
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={item => item.affilId}
                    renderItem={renderRequest}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        backgroundColor: "#1a40c2",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
    headerSubtitle: { fontSize: 12, color: "#e2e5ff" },
    centerContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyText: { fontSize: 15, color: "#747686" },
    listContent: { padding: 20, paddingBottom: 40 },
    card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { marginBottom: 12 },
    doctorInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center" },
    avatarText: { fontSize: 14, fontWeight: "bold", color: "#0C447C" },
    doctorName: { fontSize: 16, fontWeight: "bold", color: "#191c1e" },
    dateText: { fontSize: 12, color: "#747686", marginTop: 2 },
    hospitalBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#f7f9fc", padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e6e8eb" },
    hospitalName: { fontSize: 14, fontWeight: "600", color: "#191c1e", marginBottom: 2 },
    addressText: { fontSize: 12, color: "#747686", lineHeight: 16 },
    scheduleRow: { flexDirection: "row", gap: 16, marginBottom: 16, paddingHorizontal: 4 },
    scheduleItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    scheduleText: { fontSize: 13, color: "#444654", fontWeight: "500" },
    actionsRow: { flexDirection: "row", gap: 12 },
    actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, gap: 6 },
    rejectBtn: { backgroundColor: "#fff0f0" },
    rejectBtnText: { color: "#ba1a1a", fontWeight: "600", fontSize: 14 },
    approveBtn: { backgroundColor: "#1d8a4e" },
    approveBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 14 }
});

export default AdminAffiliationRequestsPage;
