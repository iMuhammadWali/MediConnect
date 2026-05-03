import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database, auth } from "../../config/firebase";

const DoctorAffiliationsPage = () => {
    const navigation = useNavigation();
    const [hospitals, setHospitals] = useState([]);
    const [affiliations, setAffiliations] = useState([]);
    const [primaryAffiliation, setPrimaryAffiliation] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        // Fetch all hospitals
        const hRef = ref(database, "hospitals");
        const unsubHospitals = onValue(hRef, snapshot => {
            const res = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const hospital = child.val();
                    if (hospital.name) res.push(hospital.name);
                });
            }
            setHospitals(res);
        });

        // Fetch doctor's affiliations
        const docRef = ref(database, `doctors/${uid}`);
        const unsubDoc = onValue(docRef, snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setPrimaryAffiliation(data.hospitalAffiliation || "");
                setAffiliations(data.affiliations || []);
            }
            setLoading(false);
        });

        return () => {
            unsubHospitals();
            unsubDoc();
        };
    }, []);

    const toggleAffiliation = (hospitalName) => {
        if (hospitalName === primaryAffiliation) {
            Alert.alert("Notice", "This is your primary affiliation. You cannot remove it from here. Contact admin to change your primary affiliation.");
            return;
        }

        setAffiliations(prev => {
            if (prev.includes(hospitalName)) {
                return prev.filter(h => h !== hospitalName);
            } else {
                return [...prev, hospitalName];
            }
        });
    };

    const handleSave = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        setSaving(true);
        try {
            await update(ref(database, `doctors/${uid}`), {
                affiliations: affiliations
            });
            Alert.alert("Success", "Hospital affiliations updated successfully!");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", "Failed to update affiliations.");
        } finally {
            setSaving(false);
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
                    <View style={styles.card}>
                        <Text style={styles.description}>
                            Select the hospitals you are affiliated with. Your primary affiliation is marked and cannot be removed directly.
                        </Text>
                        
                        <View style={styles.listContainer}>
                            {hospitals.map((hospital, index) => {
                                const isPrimary = hospital === primaryAffiliation;
                                const isSelected = isPrimary || affiliations.includes(hospital);
                                
                                return (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={[styles.hospitalItem, isSelected && styles.selectedItem]}
                                        onPress={() => toggleAffiliation(hospital)}
                                        activeOpacity={isPrimary ? 1 : 0.7}
                                    >
                                        <View style={styles.hospitalInfo}>
                                            <Ionicons name="business" size={20} color={isSelected ? "#1a40c2" : "#747686"} />
                                            <View>
                                                <Text style={[styles.hospitalName, isSelected && styles.selectedText]}>{hospital}</Text>
                                                {isPrimary && <Text style={styles.primaryBadge}>Primary</Text>}
                                            </View>
                                        </View>
                                        
                                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                            {isSelected && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        
                        <TouchableOpacity 
                            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                            onPress={handleSave} 
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Affiliations</Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
        borderRadius: 24,
        padding: 20,
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    description: {
        fontSize: 14,
        color: "#444654",
        marginBottom: 20,
        lineHeight: 20,
    },
    listContainer: {
        gap: 12,
        marginBottom: 24,
    },
    hospitalItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#f7f9fc",
        borderWidth: 1,
        borderColor: "transparent",
    },
    selectedItem: {
        backgroundColor: "#E6F1FB",
        borderColor: "rgba(26, 64, 194, 0.2)",
    },
    hospitalInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    hospitalName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#444654",
    },
    selectedText: {
        color: "#1a40c2",
    },
    primaryBadge: {
        fontSize: 11,
        color: "#1d8a4e",
        fontWeight: "bold",
        marginTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#c4c5d6",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxSelected: {
        backgroundColor: "#1a40c2",
        borderColor: "#1a40c2",
    },
    saveButton: {
        backgroundColor: "#1a40c2",
        borderRadius: 9999,
        paddingVertical: 14,
        alignItems: "center",
        elevation: 3,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
});

export default DoctorAffiliationsPage;
