import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../../config/firebase";

const AdminHospitalsPage = () => {
    const navigation = useNavigation();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hospitalsRef = ref(database, "hospitals");
        const unsubscribe = onValue(hospitalsRef, (snapshot) => {
            const result = [];
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    result.push({ id: child.key, ...child.val() });
                });
            }
            setHospitals(result);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleRemove = (id, name) => {
        Alert.alert(
            "Remove Hospital",
            `Remove ${name} from the platform? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await remove(ref(database, `hospitals/${id}`));
                        } catch (e) {
                            Alert.alert("Error", e.message);
                        }
                    },
                },
            ]
        );
    };

    const HospitalRow = ({ hospital }) => {
        const createdDate = hospital.createdAt
            ? new Date(hospital.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—";

        return (
            <View style={styles.hospitalCard}>
                <View style={styles.hospitalLeft}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="business" size={24} color="#1a40c2" />
                    </View>
                    <View style={styles.hospitalInfo}>
                        <Text style={styles.hospitalName}>{hospital.name}</Text>
                        <Text style={styles.hospitalAddress}>{hospital.address}</Text>
                        <Text style={styles.hospitalPhone}>{hospital.phone}</Text>
                        <Text style={styles.hospitalDate}>Added {createdDate}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(hospital.id, hospital.name)}
                >
                    <Ionicons name="trash-outline" size={18} color="#ba1a1a" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Manage Hospitals</Text>
                    <Text style={styles.headerSubtitle}>{hospitals.length} total</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a40c2" />
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => navigation.navigate("AdminAddHospital")}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
                        <Text style={styles.addButtonText}>Add New Hospital</Text>
                    </TouchableOpacity>

                    {hospitals.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="business-outline" size={48} color="#c4c5d6" />
                            <Text style={styles.emptyText}>No hospitals found</Text>
                        </View>
                    ) : (
                        hospitals.map((hospital) => (
                            <HospitalRow key={hospital.id} hospital={hospital} />
                        ))
                    )}
                </ScrollView>
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
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
    headerSubtitle: { fontSize: 12, color: "#a5b4fc", marginTop: 2 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 12 },
    addButton: {
        flexDirection: "row",
        backgroundColor: "#1a40c2",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 8,
        elevation: 2,
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    addButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "bold" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 15, color: "#717273" },
    hospitalCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    hospitalLeft: { flexDirection: "row", gap: 12, flex: 1 },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    hospitalInfo: { flex: 1, gap: 2 },
    hospitalName: { fontSize: 15, fontWeight: "bold", color: "#191c1e" },
    hospitalAddress: { fontSize: 13, color: "#444654" },
    hospitalPhone: { fontSize: 12, color: "#717273" },
    hospitalDate: { fontSize: 11, color: "#c4c5d6", marginTop: 2 },
    removeButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#fff0f0",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
});

export default AdminHospitalsPage;
