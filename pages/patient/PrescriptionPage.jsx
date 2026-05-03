import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "../../config/firebase";

const PrescriptionPage = () => {
    const navigation = useNavigation();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) {
            setLoading(false);
            return;
        }
        
        const presRef = ref(database, "prescriptions");
        const unsub = onValue(presRef, snapshot => {
            const res = [];
            if (snapshot.exists()) {
                snapshot.forEach(c => {
                    const data = c.val();
                    if (data.patientId === uid) {
                        res.push({ id: c.key, ...data });
                    }
                });
            }
            setPrescriptions(res.reverse()); // latest first
            setLoading(false);
        });
        
        return unsub;
    }, []);

    const renderPrescription = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="document-text" size={24} color="#1a40c2" />
                    </View>
                    <View>
                        <Text style={styles.doctorName}>{item.doctorName || "Dr. Unknown"}</Text>
                        <Text style={styles.date}>{item.date || "Unknown Date"}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.downloadButton}>
                    <Ionicons name="download-outline" size={20} color="#1a40c2" />
                </TouchableOpacity>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.medicationTitle}>Medications:</Text>
                {item.medications && item.medications.length > 0 ? (
                    item.medications.map((med, index) => (
                        <View key={index} style={styles.medicationItem}>
                            <View style={styles.bullet} />
                            <Text style={styles.medicationText}>{med.name} - {med.dosage} ({med.frequency})</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noMedicationText}>{item.notes || "No details provided."}</Text>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Prescriptions</Text>
            </View>
            
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1a40c2" style={{marginTop: 40}} />
                ) : prescriptions.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#c4c5d6" />
                        <Text style={styles.emptyTitle}>No Prescriptions</Text>
                        <Text style={styles.emptyText}>You don't have any prescriptions yet.</Text>
                    </View>
                ) : (
                    <FlatList 
                        data={prescriptions}
                        renderItem={renderPrescription}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 20, gap: 16 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
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
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
    content: { flex: 1 },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f2f4f7",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    doctorName: { fontSize: 16, fontWeight: "bold", color: "#191c1e" },
    date: { fontSize: 12, color: "#747686", marginTop: 2 },
    downloadButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f2f4f7",
        alignItems: "center",
        justifyContent: "center",
    },
    cardBody: {},
    medicationTitle: { fontSize: 14, fontWeight: "600", color: "#444654", marginBottom: 8 },
    medicationItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 6,
    },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#1a40c2" },
    medicationText: { fontSize: 14, color: "#191c1e" },
    noMedicationText: { fontSize: 14, color: "#747686", fontStyle: "italic" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#191c1e", marginTop: 8 },
    emptyText: { fontSize: 14, color: "#717273", textAlign: "center" },
});

export default PrescriptionPage;
