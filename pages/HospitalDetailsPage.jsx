import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase";
import { WebView } from "react-native-webview";

const HospitalDetailsPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { hospital } = route.params || {};

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!hospital?.name) {
            setLoading(false);
            return;
        }
        const docRef = ref(database, "doctors");
        const unsub = onValue(docRef, snapshot => {
            const res = [];
            if (snapshot.exists()) {
                snapshot.forEach(c => {
                    const data = c.val();
                    if (data.isVerified && (data.hospitalAffiliation === hospital.name || (data.affiliations && data.affiliations.includes(hospital.name)))) {
                        res.push({ id: c.key, ...data });
                    }
                });
            }
            setDoctors(res);
            setLoading(false);
        });
        return unsub;
    }, [hospital]);

    const getInitials = (fullName) => {
        if (!fullName) return "DR";
        const names = fullName.split(" ");
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const renderDoctorItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.doctorCard}
            onPress={() => navigation.navigate("DoctorDetails", { doctorId: item.id })}
        >
            <View style={styles.doctorAvatar}>
                <Text style={styles.doctorInitials}>{getInitials(item.fullName)}</Text>
            </View>
            <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{item.fullName}</Text>
                <Text style={styles.doctorSpecialty}>{item.primarySpecialization}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#F39C12" />
                    <Text style={styles.ratingText}>{item.rating || "New"}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#c4c5d6" />
        </TouchableOpacity>
    );

    const hasLocation = hospital?.latitude && hospital?.longitude;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{hospital?.name}</Text>
            </View>
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Hospital Information</Text>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={20} color="#1a40c2" />
                        <Text style={styles.infoText}>{hospital?.address}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color="#1a40c2" />
                        <Text style={styles.infoText}>{hospital?.phone}</Text>
                    </View>
                </View>

                {hasLocation ? (
                    <View style={styles.mapContainer}>
                        <WebView 
                            style={styles.map}
                            source={{ uri: `https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(hospital.longitude)-0.01}%2C${parseFloat(hospital.latitude)-0.01}%2C${parseFloat(hospital.longitude)+0.01}%2C${parseFloat(hospital.latitude)+0.01}&layer=mapnik&marker=${hospital.latitude}%2C${hospital.longitude}` }}
                            scrollEnabled={false}
                        />
                    </View>
                ) : (
                    <View style={styles.noMapContainer}>
                        <Ionicons name="map-outline" size={40} color="#c4c5d6" />
                        <Text style={styles.noMapText}>Location coordinates not provided.</Text>
                    </View>
                )}

                <View style={styles.doctorsSection}>
                    <Text style={styles.sectionTitle}>Affiliated Doctors</Text>
                    {loading ? (
                        <ActivityIndicator size="small" color="#1a40c2" style={{marginTop: 20}} />
                    ) : doctors.length === 0 ? (
                        <Text style={styles.noDoctorsText}>No verified doctors found for this hospital.</Text>
                    ) : (
                        <FlatList 
                            data={doctors}
                            renderItem={renderDoctorItem}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                        />
                    )}
                </View>
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
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff", flex: 1 },
    content: { flex: 1, padding: 20 },
    infoSection: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#191c1e", marginBottom: 16 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
    infoText: { fontSize: 14, color: "#444654", flex: 1 },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
    },
    map: { width: "100%", height: "100%" },
    noMapContainer: {
        height: 150,
        backgroundColor: "#e6e8eb",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        gap: 8,
    },
    noMapText: { fontSize: 14, color: "#747686" },
    doctorsSection: { marginBottom: 40 },
    noDoctorsText: { fontSize: 14, color: "#747686", fontStyle: "italic" },
    doctorCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    doctorAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    doctorInitials: { fontSize: 16, fontWeight: "bold", color: "#1a40c2" },
    doctorInfo: { flex: 1 },
    doctorName: { fontSize: 16, fontWeight: "bold", color: "#191c1e", marginBottom: 2 },
    doctorSpecialty: { fontSize: 13, color: "#444654", marginBottom: 4 },
    ratingContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
    ratingText: { fontSize: 12, fontWeight: "500", color: "#444654" },
});

export default HospitalDetailsPage;
