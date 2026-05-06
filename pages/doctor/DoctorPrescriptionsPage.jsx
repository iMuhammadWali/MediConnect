import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { database, auth } from "../../config/firebase";

const DoctorPrescriptionsPage = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState("list"); // "list" or "create"
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    
    // Create form states
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientPicker, setShowPatientPicker] = useState(false);
    const [diagnosis, setDiagnosis] = useState("");
    const [medications, setMedications] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const uid = auth.currentUser?.uid;

    useEffect(() => {
        if (!uid) { setLoading(false); return; }

        // Get patients from paid appointments
        const appRef = ref(database, "appointments");
        const unsubApps = onValue(appRef, appSnap => {
            const patientIds = new Set();
            if (appSnap.exists()) {
                appSnap.forEach(c => {
                    const data = c.val();
                    if (data.doctorId === uid && data.paid === true) {
                        patientIds.add(data.patientId);
                    }
                });
            }

            // Fetch patient details
            const usersRef = ref(database, "users");
            onValue(usersRef, usersSnap => {
                const pts = [];
                if (usersSnap.exists()) {
                    usersSnap.forEach(child => {
                        if (patientIds.has(child.key)) {
                            pts.push({ uid: child.key, ...child.val() });
                        }
                    });
                }
                setPatients(pts);
            }, { onlyOnce: true });
        });

        // Get prescriptions written by this doctor
        const presRef = ref(database, "prescriptions");
        const unsubPres = onValue(presRef, snapshot => {
            const res = [];
            if (snapshot.exists()) {
                snapshot.forEach(c => {
                    const data = c.val();
                    if (data.doctorId === uid) {
                        res.push({ id: c.key, ...data });
                    }
                });
            }
            setPrescriptions(res.reverse());
            setLoading(false);
        });

        return () => { unsubApps(); unsubPres(); };
    }, [uid]);

    const addMedication = () => {
        setMedications(prev => [...prev, { name: "", dosage: "", frequency: "", duration: "" }]);
    };

    const removeMedication = (index) => {
        if (medications.length <= 1) return;
        setMedications(prev => prev.filter((_, i) => i !== index));
    };

    const updateMedication = (index, field, value) => {
        setMedications(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!selectedPatient) {
            Alert.alert("Required", "Please select a patient.");
            return;
        }
        if (!diagnosis.trim()) {
            Alert.alert("Required", "Please enter a diagnosis.");
            return;
        }
        const validMeds = medications.filter(m => m.name.trim());
        if (validMeds.length === 0) {
            Alert.alert("Required", "Please add at least one medication.");
            return;
        }

        setSubmitting(true);
        try {
            // Get doctor name
            const docSnap = await new Promise((resolve) => {
                onValue(ref(database, `doctors/${uid}`), resolve, { onlyOnce: true });
            });
            const doctorName = docSnap.exists() ? docSnap.val().fullName : "Doctor";

            const presRef = push(ref(database, "prescriptions"));
            await set(presRef, {
                doctorId: uid,
                doctorName,
                patientId: selectedPatient.uid,
                patientName: selectedPatient.fullName,
                diagnosis: diagnosis.trim(),
                medications: validMeds,
                notes: notes.trim(),
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                createdAt: new Date().toISOString(),
            });

            Alert.alert("Success", "Prescription has been created successfully.", [
                { text: "OK", onPress: () => {
                    setActiveTab("list");
                    setSelectedPatient(null);
                    setDiagnosis("");
                    setMedications([{ name: "", dosage: "", frequency: "", duration: "" }]);
                    setNotes("");
                }}
            ]);
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderPrescriptionCard = (item) => {
        const isExpanded = expandedId === item.id;
        return (
            <TouchableOpacity 
                key={item.id} 
                style={styles.presCard}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.7}
            >
                {/* Card Header */}
                <View style={styles.presCardHeader}>
                    <View style={styles.presIconBox}>
                        <Ionicons name="document-text" size={22} color="#1a40c2" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.presPatientName}>{item.patientName}</Text>
                        <Text style={styles.presDate}>{item.date}</Text>
                    </View>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#747686" />
                </View>

                {/* Diagnosis Badge */}
                <View style={styles.diagnosisBadge}>
                    <Ionicons name="medical" size={14} color="#1a40c2" />
                    <Text style={styles.diagnosisText}>{item.diagnosis}</Text>
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={styles.presExpanded}>
                        <View style={styles.presSection}>
                            <Text style={styles.presSectionTitle}>Medications</Text>
                            {item.medications?.map((med, idx) => (
                                <View key={idx} style={styles.medRow}>
                                    <View style={styles.medNumber}>
                                        <Text style={styles.medNumberText}>{idx + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.medName}>{med.name}</Text>
                                        <View style={styles.medDetailsRow}>
                                            {med.dosage ? <Text style={styles.medDetail}>💊 {med.dosage}</Text> : null}
                                            {med.frequency ? <Text style={styles.medDetail}>🔄 {med.frequency}</Text> : null}
                                            {med.duration ? <Text style={styles.medDetail}>📅 {med.duration}</Text> : null}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                        {item.notes ? (
                            <View style={styles.presSection}>
                                <Text style={styles.presSectionTitle}>Notes</Text>
                                <Text style={styles.presNotes}>{item.notes}</Text>
                            </View>
                        ) : null}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Prescriptions</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === "list" && styles.tabActive]}
                    onPress={() => setActiveTab("list")}
                >
                    <Ionicons name="list" size={18} color={activeTab === "list" ? "#1a40c2" : "#747686"} />
                    <Text style={[styles.tabText, activeTab === "list" && styles.tabTextActive]}>All Prescriptions</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === "create" && styles.tabActive]}
                    onPress={() => setActiveTab("create")}
                >
                    <Ionicons name="add-circle" size={18} color={activeTab === "create" ? "#1a40c2" : "#747686"} />
                    <Text style={[styles.tabText, activeTab === "create" && styles.tabTextActive]}>New Prescription</Text>
                </TouchableOpacity>
            </View>

            {activeTab === "list" ? (
                /* List View */
                <ScrollView style={styles.content} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#1a40c2" style={{ marginTop: 40 }} />
                    ) : prescriptions.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={56} color="#c4c5d6" />
                            <Text style={styles.emptyTitle}>No Prescriptions</Text>
                            <Text style={styles.emptyText}>You haven't written any prescriptions yet.</Text>
                            <TouchableOpacity style={styles.emptyButton} onPress={() => setActiveTab("create")}>
                                <Text style={styles.emptyButtonText}>Create Prescription</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        prescriptions.map(renderPrescriptionCard)
                    )}
                </ScrollView>
            ) : (
                /* Create View */
                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView 
                        style={styles.content} 
                        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Patient Selector */}
                        <View style={styles.formCard}>
                            <Text style={styles.formLabel}>Patient *</Text>
                            <TouchableOpacity 
                                style={styles.pickerButton}
                                onPress={() => setShowPatientPicker(!showPatientPicker)}
                            >
                                <Ionicons name="person" size={18} color="#1a40c2" />
                                <Text style={styles.pickerText}>
                                    {selectedPatient ? selectedPatient.fullName : "Select Patient..."}
                                </Text>
                                <Ionicons name={showPatientPicker ? "chevron-up" : "chevron-down"} size={18} color="#747686" />
                            </TouchableOpacity>

                            {showPatientPicker && (
                                <View style={styles.pickerList}>
                                    {patients.length === 0 ? (
                                        <Text style={styles.pickerEmpty}>No patients with paid appointments found.</Text>
                                    ) : (
                                        patients.map(p => (
                                            <TouchableOpacity 
                                                key={p.uid} 
                                                style={[styles.pickerItem, selectedPatient?.uid === p.uid && styles.pickerItemActive]}
                                                onPress={() => { setSelectedPatient(p); setShowPatientPicker(false); }}
                                            >
                                                <Text style={styles.pickerItemText}>{p.fullName}</Text>
                                                {selectedPatient?.uid === p.uid && <Ionicons name="checkmark" size={18} color="#1a40c2" />}
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Diagnosis */}
                        <View style={styles.formCard}>
                            <Text style={styles.formLabel}>Diagnosis *</Text>
                            <TextInput
                                style={styles.formInput}
                                value={diagnosis}
                                onChangeText={setDiagnosis}
                                placeholder="e.g. Upper Respiratory Tract Infection"
                                placeholderTextColor="#c4c5d6"
                            />
                        </View>

                        {/* Medications */}
                        <View style={styles.formCard}>
                            <View style={styles.medHeaderRow}>
                                <Text style={styles.formLabel}>Medications *</Text>
                                <TouchableOpacity style={styles.addMedBtn} onPress={addMedication}>
                                    <Ionicons name="add" size={16} color="#1a40c2" />
                                    <Text style={styles.addMedText}>Add</Text>
                                </TouchableOpacity>
                            </View>

                            {medications.map((med, index) => (
                                <View key={index} style={styles.medFormCard}>
                                    <View style={styles.medFormHeader}>
                                        <Text style={styles.medFormIndex}>Rx {index + 1}</Text>
                                        {medications.length > 1 && (
                                            <TouchableOpacity onPress={() => removeMedication(index)}>
                                                <Ionicons name="close-circle" size={20} color="#ba1a1a" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <TextInput
                                        style={styles.medInput}
                                        value={med.name}
                                        onChangeText={v => updateMedication(index, "name", v)}
                                        placeholder="Medication name"
                                        placeholderTextColor="#c4c5d6"
                                    />
                                    <View style={styles.medInputRow}>
                                        <TextInput
                                            style={[styles.medInput, { flex: 1 }]}
                                            value={med.dosage}
                                            onChangeText={v => updateMedication(index, "dosage", v)}
                                            placeholder="Dosage (e.g. 500mg)"
                                            placeholderTextColor="#c4c5d6"
                                        />
                                    </View>
                                    <View style={styles.medInputRow}>
                                        <TextInput
                                            style={[styles.medInput, { flex: 1 }]}
                                            value={med.frequency}
                                            onChangeText={v => updateMedication(index, "frequency", v)}
                                            placeholder="Frequency (e.g. 3x daily)"
                                            placeholderTextColor="#c4c5d6"
                                        />
                                        <TextInput
                                            style={[styles.medInput, { flex: 1 }]}
                                            value={med.duration}
                                            onChangeText={v => updateMedication(index, "duration", v)}
                                            placeholder="Duration (e.g. 7 days)"
                                            placeholderTextColor="#c4c5d6"
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Notes */}
                        <View style={styles.formCard}>
                            <Text style={styles.formLabel}>Additional Notes</Text>
                            <TextInput
                                style={[styles.formInput, { height: 80, textAlignVertical: "top" }]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Special instructions, follow-up, diet recommendations..."
                                placeholderTextColor="#c4c5d6"
                                multiline
                            />
                        </View>

                        {/* Submit */}
                        <TouchableOpacity 
                            style={[styles.submitButton, submitting && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                                    <Text style={styles.submitText}>Save Prescription</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    header: {
        flexDirection: "row", alignItems: "center", gap: 16,
        backgroundColor: "#1a40c2", paddingHorizontal: 20, paddingVertical: 16,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
    tabBar: {
        flexDirection: "row", marginHorizontal: 20, marginTop: 16,
        backgroundColor: "#ffffff", borderRadius: 16, padding: 4,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    tab: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        gap: 6, paddingVertical: 12, borderRadius: 12,
    },
    tabActive: { backgroundColor: "#E6F1FB" },
    tabText: { fontSize: 13, fontWeight: "600", color: "#747686" },
    tabTextActive: { color: "#1a40c2" },
    content: { flex: 1 },
    // List styles
    emptyContainer: { alignItems: "center", paddingVertical: 60, gap: 8 },
    emptyTitle: { fontSize: 20, fontWeight: "bold", color: "#191c1e", marginTop: 8 },
    emptyText: { fontSize: 14, color: "#747686", textAlign: "center" },
    emptyButton: { backgroundColor: "#1a40c2", borderRadius: 9999, paddingHorizontal: 24, paddingVertical: 12, marginTop: 12 },
    emptyButtonText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
    presCard: {
        backgroundColor: "#ffffff", borderRadius: 16, padding: 16, marginBottom: 14,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    },
    presCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    presIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center" },
    presPatientName: { fontSize: 16, fontWeight: "bold", color: "#191c1e" },
    presDate: { fontSize: 12, color: "#747686", marginTop: 2 },
    diagnosisBadge: {
        flexDirection: "row", alignItems: "center", gap: 6,
        alignSelf: "flex-start", backgroundColor: "rgba(26, 64, 194, 0.08)",
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 12,
    },
    diagnosisText: { fontSize: 13, color: "#1a40c2", fontWeight: "600" },
    presExpanded: { marginTop: 16, borderTopWidth: 1, borderTopColor: "#f2f4f7", paddingTop: 16, gap: 16 },
    presSection: {},
    presSectionTitle: { fontSize: 13, fontWeight: "bold", color: "#747686", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
    medRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
    medNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#1a40c2", alignItems: "center", justifyContent: "center", marginTop: 2 },
    medNumberText: { fontSize: 12, fontWeight: "bold", color: "#ffffff" },
    medName: { fontSize: 15, fontWeight: "bold", color: "#191c1e", marginBottom: 4 },
    medDetailsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    medDetail: { fontSize: 12, color: "#444654", backgroundColor: "#f2f4f7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    presNotes: { fontSize: 14, color: "#444654", lineHeight: 22, fontStyle: "italic" },
    // Form styles
    formCard: {
        backgroundColor: "#ffffff", borderRadius: 16, padding: 18, marginBottom: 14,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
    },
    formLabel: { fontSize: 14, fontWeight: "bold", color: "#191c1e", marginBottom: 10 },
    formInput: {
        backgroundColor: "#f7f9fc", borderRadius: 12, paddingHorizontal: 16,
        paddingVertical: 13, fontSize: 15, color: "#191c1e",
        borderWidth: 1, borderColor: "#e6e8eb",
    },
    pickerButton: {
        flexDirection: "row", alignItems: "center", gap: 10,
        backgroundColor: "#f7f9fc", padding: 14, borderRadius: 12,
        borderWidth: 1, borderColor: "#e6e8eb",
    },
    pickerText: { flex: 1, fontSize: 15, color: "#191c1e" },
    pickerList: { marginTop: 8, borderWidth: 1, borderColor: "#e6e8eb", borderRadius: 12, overflow: "hidden" },
    pickerEmpty: { padding: 16, textAlign: "center", color: "#747686", fontSize: 14 },
    pickerItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f2f4f7", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    pickerItemActive: { backgroundColor: "#E6F1FB" },
    pickerItemText: { fontSize: 15, color: "#191c1e", fontWeight: "500" },
    medHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
    addMedBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#E6F1FB", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    addMedText: { fontSize: 13, fontWeight: "bold", color: "#1a40c2" },
    medFormCard: {
        backgroundColor: "#f7f9fc", borderRadius: 12, padding: 14, marginBottom: 10,
        borderWidth: 1, borderColor: "#e6e8eb",
    },
    medFormHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    medFormIndex: { fontSize: 13, fontWeight: "bold", color: "#1a40c2" },
    medInput: {
        backgroundColor: "#ffffff", borderRadius: 10, paddingHorizontal: 14,
        paddingVertical: 11, fontSize: 14, color: "#191c1e",
        borderWidth: 1, borderColor: "#e6e8eb", marginBottom: 8,
    },
    medInputRow: { flexDirection: "row", gap: 8 },
    submitButton: {
        backgroundColor: "#1a40c2", borderRadius: 9999, paddingVertical: 16,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        marginTop: 8, marginBottom: 20,
        shadowColor: "#1a40c2", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
    },
    submitText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});

export default DoctorPrescriptionsPage;
