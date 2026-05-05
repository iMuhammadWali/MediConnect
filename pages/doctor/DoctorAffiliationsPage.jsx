import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database, auth } from "../../config/firebase";

const DoctorAffiliationsPage = () => {
    const navigation = useNavigation();
    const [primaryAffiliation, setPrimaryAffiliation] = useState("");
    const [primaryDays, setPrimaryDays] = useState([]);
    const [primaryStart, setPrimaryStart] = useState("");
    const [primaryEnd, setPrimaryEnd] = useState("");
    const [detailedAffiliations, setDetailedAffiliations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const docRef = ref(database, `doctors/${uid}`);
        const unsubDoc = onValue(docRef, snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setPrimaryAffiliation(data.hospitalAffiliation || "No Primary Hospital");
                setPrimaryDays(data.workingDays || []);
                setPrimaryStart(data.startTime || "");
                setPrimaryEnd(data.endTime || "");
                
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
                        <Text style={styles.sectionTitle}>Primary Affiliation</Text>
                        <View style={styles.card}>
                            <View style={styles.hospitalHeader}>
                                <Ionicons name="business" size={24} color="#1a40c2" />
                                <View style={styles.hospitalInfo}>
                                    <Text style={styles.hospitalName}>{primaryAffiliation}</Text>
                                    <View style={styles.primaryBadge}>
                                        <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.scheduleBox}>
                                <View style={styles.scheduleItem}>
                                    <Ionicons name="calendar-outline" size={16} color="#747686" />
                                    <Text style={styles.scheduleText}>{primaryDays.length > 0 ? primaryDays.join(", ") : "Not set"}</Text>
                                </View>
                                <View style={styles.scheduleItem}>
                                    <Ionicons name="time-outline" size={16} color="#747686" />
                                    <Text style={styles.scheduleText}>{(primaryStart && primaryEnd) ? `${primaryStart} - ${primaryEnd}` : "Not set"}</Text>
                                </View>
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Other Affiliations</Text>
                        
                        {detailedAffiliations.length === 0 ? (
                            <Text style={styles.emptyText}>You have no other hospital affiliations.</Text>
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
                                        </View>
                                    </View>
                                );
                            })
                        )}

                        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("RequestAffiliation")}>
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
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#191c1e", marginBottom: 12 },
    card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    hospitalHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    hospitalInfo: { flex: 1 },
    hospitalName: { fontSize: 16, fontWeight: "bold", color: "#191c1e", marginBottom: 2 },
    addressText: { fontSize: 12, color: "#747686" },
    primaryBadge: { alignSelf: "flex-start", backgroundColor: "#e6f8ef", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    primaryBadgeText: { fontSize: 10, fontWeight: "bold", color: "#1d8a4e", letterSpacing: 0.5 },
    statusBanner: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, marginVertical: 12 },
    statusText: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.5 },
    scheduleBox: { backgroundColor: "#f2f4f7", padding: 12, borderRadius: 12, gap: 8, marginTop: 12 },
    scheduleItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    scheduleText: { fontSize: 13, color: "#444654", fontWeight: "500" },
    emptyText: { fontSize: 14, color: "#747686", textAlign: "center", marginVertical: 20 },
    addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1a40c2", borderRadius: 9999, paddingVertical: 16, gap: 8, marginTop: 10, marginBottom: 40, shadowColor: "#1a40c2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
    addButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" }
});

export default DoctorAffiliationsPage;
