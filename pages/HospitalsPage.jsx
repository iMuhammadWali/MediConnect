import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";
import { SearchBar } from "../components/SearchBar";

const HospitalsPage = () => {
    const navigation = useNavigation();
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const hRef = ref(database, "hospitals");
        const unsub = onValue(hRef, snapshot => {
            const res = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => res.push({ id: child.key, ...child.val() }));
            }
            setHospitals(res);
            setLoading(false);
        });
        return unsub;
    }, []);

    const filteredHospitals = hospitals.filter(h => 
        h.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        h.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hospitals</Text>
            </View>
            <View style={styles.searchContainer}>
                 <SearchBar placeholder="Search hospitals..." value={searchQuery} onChangeText={setSearchQuery} />
            </View>
            <ScrollView style={styles.content} contentContainerStyle={{padding: 20, gap: 12}}>
                {loading ? <ActivityIndicator size="large" color="#1a40c2" style={{marginTop: 20}} /> :
                    filteredHospitals.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="business-outline" size={48} color="#c4c5d6" />
                            <Text style={styles.emptyText}>No hospitals found</Text>
                        </View>
                    ) :
                    filteredHospitals.map(h => (
                        <View key={h.id} style={styles.card}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="business" size={24} color="#1a40c2" />
                            </View>
                            <View style={styles.info}>
                                <Text style={styles.name}>{h.name}</Text>
                                <Text style={styles.address}>{h.address}</Text>
                                <Text style={styles.phone}>{h.phone}</Text>
                            </View>
                        </View>
                    ))
                }
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
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
    searchContainer: { paddingHorizontal: 20, marginTop: -15 },
    content: { flex: 1 },
    card: {
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
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    info: { flex: 1, gap: 2 },
    name: { fontSize: 16, fontWeight: "bold", color: "#191c1e" },
    address: { fontSize: 13, color: "#444654" },
    phone: { fontSize: 13, color: "#717273" },
    emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 15, color: "#717273" },
});

export default HospitalsPage;
