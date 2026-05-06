import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";

const PatientDetailsPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { patientId } = route.params || {};

    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!patientId) {
            setLoading(false);
            return;
        }
        const patRef = ref(database, `users/${patientId}`);
        const unsub = onValue(patRef, snapshot => {
            if (snapshot.exists()) {
                setPatient(snapshot.val());
            }
            setLoading(false);
        });
        return unsub;
    }, [patientId]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={20} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={{color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 16}}>Patient Details</Text>
                </View>
                <ActivityIndicator size="large" color="#1a40c2" style={{marginTop: 40}} />
            </SafeAreaView>
        );
    }

    if (!patient) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>
                <Text style={{textAlign: "center", marginTop: 40}}>Patient not found.</Text>
            </SafeAreaView>
        );
    }

    const initials = patient.fullName ? patient.fullName.substring(0, 2).toUpperCase() : "PA";

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.topNav}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.patientIdentity}>
                    <View style={styles.patientAvatar}>
                        <Text style={styles.patientInitials}>{initials}</Text>
                    </View>
                    <Text style={styles.patientName}>{patient.fullName}</Text>
                    <Text style={styles.patientInfo}>{patient.email || "No email"}</Text>
                </View>
            </View>
            <ScrollView style={styles.scrollView} contentContainerStyle={{padding: 24}}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Medical Information</Text>
                    <Text style={styles.infoText}>Blood Type: Unknown</Text>
                    <Text style={styles.infoText}>Allergies: None reported</Text>
                    <Text style={styles.infoText}>Current Medications: None</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    header: {
        backgroundColor: "#1a40c2",
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingTop: 15,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    topNav: { flexDirection: "row", justifyContent: "space-between" },
    iconButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center", justifyContent: "center"
    },
    patientIdentity: { alignItems: "center", marginTop: 16 },
    patientAvatar: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: "#E6F1FB",
        alignItems: "center", justifyContent: "center",
        marginBottom: 16, borderWidth: 4, borderColor: "rgba(255,255,255,0.2)",
    },
    patientInitials: { fontSize: 32, fontWeight: "bold", color: "#1a40c2" },
    patientName: { fontSize: 24, fontWeight: "bold", color: "#ffffff", marginBottom: 4 },
    patientInfo: { fontSize: 16, color: "#e2e5ff", opacity: 0.9, marginTop: 4 },
    scrollView: { flex: 1 },
    section: {
        backgroundColor: "#fff", padding: 20, borderRadius: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#191c1e", marginBottom: 12 },
    infoText: { fontSize: 15, color: "#444654", marginBottom: 8 }
});

export default PatientDetailsPage;
