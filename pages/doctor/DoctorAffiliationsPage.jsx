import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database, auth } from "../../config/firebase";

const DoctorAffiliationsPage = () => {
    const navigation = useNavigation();
    const [isVerified, setIsVerified] = useState(false);
    const [detailedAffiliations, setDetailedAffiliations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const docRef = ref(database, `doctors/${uid}`);
        const unsubDoc = onValue(docRef, snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setIsVerified(data.isVerified === true);
                
                if (data.detailedAffiliations) {
                    const affils = Object.entries(data.detailedAffiliations).map(([key, val]) => ({
                        id: key,
                        ...val
                    }));
                    setDetailedAffiliations(affils.reverse());
                } else {
                    setDetailedAffiliations([]);
                }
            }
            setLoading(false);
        });

        return () => unsubDoc();
    }, []);

    const handleRemove = (affilId) => {
        Alert.alert(
            "Remove Affiliation",
            "Are you sure you want to remove this affiliation?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const uid = auth.currentUser?.uid;
                            if (!uid) return;
                            await remove(ref(database, `doctors/${uid}/detailedAffiliations/${affilId}`));
                        } catch (error) {
                            Alert.alert("Error", error.message);
                        }
                    }
                }
            ]
        );
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case "approved": return { color: "#1d8a4e", bg: "#e6f8ef", text: "Approved" };
            case "pending": return { color: "#e07b00", bg: "#fff4e6", text: "Pending Review" };
            case "rejected": return { color: "#ba1a1a", bg: "#fff0f0", text: "Rejected" };
            default: return { color: "#747686", bg: "#f2f4f7", text: status };
        }
    };

    const handleRequestAffiliation = () => {
        if (!isVerified) {
            Alert.alert(
                "Approval Required", 
                "You need admin approval before you can add hospital affiliations. Please wait for your profile to be approved.",
                [{ text: "OK" }]
            );
            return;
        }
        navigation.navigate("RequestAffiliation");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Affiliations</Text>
            </View>
            
            <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1a40c2" style={{ marginTop: 40 }} />
                ) : (
                    <>
                        {/* Approval Gate Banner */}
                        {!isVerified && (
                            <View style={styles.lockedBanner}>
                                <View style={styles.lockedIconContainer}>
                                    <Ionicons name="lock-closed" size={28} color="#e07b00" />
                                </View>
                                <Text style={styles.lockedTitle}>Approval Required</Text>
                                <Text style={styles.lockedText}>
                                    Your profile is pending admin approval. Once approved, you'll be able to add hospital affiliations, set your availability schedule, and consultation fees.
                                </Text>
                            </View>
                        )}

                        {isVerified && (
                            <>
                                <Text style={styles.sectionTitle}>Your Affiliations</Text>
                                
                                {detailedAffiliations.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <Ionicons name="business-outline" size={48} color="#c4c5d6" />
                                        <Text style={styles.emptyTitle}>No Affiliations Yet</Text>
                                        <Text style={styles.emptyText}>Add your hospital affiliations to start receiving appointment bookings.</Text>
                                    </View>
                                ) : (
                                    detailedAffiliations.map(affil => {
                                        const st = getStatusStyle(affil.status);
                                        return (
                                            <View key={affil.id} style={styles.card}>
                                                <View style={styles.hospitalHeader}>
                                                    <Ionicons name="location-outline" size={24} color={st.color} />
                                                    <View style={styles.hospitalInfo}>
                                                        <Text style={styles.hospitalName} numberOfLines={1}>{affil.hospitalName}</Text>
                                                        <Text style={styles.addressText} numberOfLines={1}>{affil.address}</Text>
                                                    </View>
                                                    <TouchableOpacity 
                                                        style={{ padding: 4 }} 
                                                        onPress={() => handleRemove(affil.id)}
                                                    >
                                                        <Ionicons name="trash-outline" size={20} color="#ba1a1a" />
                                                    </TouchableOpacity>
                                                </View>
                                                
                                                <View style={[styles.statusBanner, { backgroundColor: st.bg }]}>
                                                    <Text style={[styles.statusText, { color: st.color }]}>{st.text}</Text>
                                                </View>

                                                <View style={styles.scheduleBox}>
                                                    <View style={styles.scheduleItem}>
                                                        <Ionicons name="calendar-outline" size={16} color="#747686" />
                                                        <Text style={styles.scheduleText}>{affil.workingDays?.join(", ") || "N/A"}</Text>
                                                    </View>
                                                    <View style={styles.scheduleItem}>
                                                        <Ionicons name="time-outline" size={16} color="#747686" />
                                                        <Text style={styles.scheduleText}>{affil.startTime} - {affil.endTime}</Text>
                                                    </View>
                                                    {affil.consultationFee && (
                                                        <View style={styles.scheduleItem}>
                                                            <Ionicons name="cash-outline" size={16} color="#747686" />
                                                            <Text style={styles.scheduleText}>PKR {affil.consultationFee}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                            </>
                        )}

                        <TouchableOpacity 
                            style={[styles.addButton, !isVerified && styles.addButtonDisabled]} 
                            onPress={handleRequestAffiliation}
                        >
                            <Ionicons name="add" size={20} color="#ffffff" />
                            <Text style={styles.addButtonText}>Request New Affiliation</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
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
    content: { flex: 1 },
    lockedBanner: {
        backgroundColor: "#fff8f0",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "rgba(224, 123, 0, 0.15)",
    },
    lockedIconContainer: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: "rgba(224, 123, 0, 0.1)",
        alignItems: "center", justifyContent: "center",
        marginBottom: 16,
    },
    lockedTitle: { fontSize: 18, fontWeight: "bold", color: "#191c1e", marginBottom: 8 },
    lockedText: { fontSize: 14, color: "#747686", textAlign: "center", lineHeight: 22 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#191c1e", marginBottom: 12 },
    emptyContainer: { alignItems: "center", paddingVertical: 40, gap: 8 },
    emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#191c1e" },
    emptyText: { fontSize: 14, color: "#747686", textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
    card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    hospitalHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    hospitalInfo: { flex: 1 },
    hospitalName: { fontSize: 16, fontWeight: "bold", color: "#191c1e", marginBottom: 2 },
    addressText: { fontSize: 12, color: "#747686" },
    statusBanner: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, marginVertical: 12 },
    statusText: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
    scheduleBox: { backgroundColor: "#f2f4f7", padding: 12, borderRadius: 12, gap: 8, marginTop: 4 },
    scheduleItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    scheduleText: { fontSize: 13, color: "#444654", fontWeight: "500" },
    addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1a40c2", borderRadius: 9999, paddingVertical: 16, gap: 8, marginTop: 10, marginBottom: 40, shadowColor: "#1a40c2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
    addButtonDisabled: { backgroundColor: "#c4c5d6", shadowOpacity: 0, elevation: 0 },
    addButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" }
});

export default DoctorAffiliationsPage;
