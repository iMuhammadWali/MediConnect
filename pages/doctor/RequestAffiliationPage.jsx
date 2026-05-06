import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { auth, database } from "../../config/firebase";
import { ref, push, set, get } from "firebase/database";

const RequestAffiliationPage = () => {
    const navigation = useNavigation();
    
    // Search states
    const [searchQuery, setSearchQuery] = useState("");
    const [allHospitals, setAllHospitals] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loadingHospitals, setLoadingHospitals] = useState(true);
    const [selectedHospital, setSelectedHospital] = useState(null);

    // Schedule states
    const [selectedDays, setSelectedDays] = useState([]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [consultationFee, setConsultationFee] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [doctorData, setDoctorData] = useState(null);

    const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    useEffect(() => {
        const fetchInitialData = async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            // Fetch Doctor Data
            const docSnap = await get(ref(database, `doctors/${uid}`));
            if (docSnap.exists()) {
                const data = docSnap.val();
                setDoctorData(data);
                if (!data.isVerified) {
                    Alert.alert("Approval Required", "You need admin approval before adding affiliations.", [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                    return;
                }
            }

            // Fetch All Hospitals
            try {
                const hospSnap = await get(ref(database, "hospitals"));
                if (hospSnap.exists()) {
                    const list = [];
                    hospSnap.forEach(child => {
                        list.push({ id: child.key, ...child.val() });
                    });
                    setAllHospitals(list);
                }
            } catch (err) {
                console.error("Error fetching hospitals:", err);
            } finally {
                setLoadingHospitals(false);
            }
        };
        fetchInitialData();
    }, []);

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (!text.trim()) {
            setSearchResults([]);
            return;
        }
        const filtered = allHospitals.filter(h => 
            h.name.toLowerCase().includes(text.toLowerCase()) ||
            h.address.toLowerCase().includes(text.toLowerCase())
        );
        setSearchResults(filtered);
    };

    const toggleDay = (day) => {
        setSelectedDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const parseTime = (timeStr) => {
        const [h, m] = timeStr.split(':');
        return parseInt(h) * 60 + parseInt(m);
    };

    const checkConflict = () => {
        if (!doctorData) return false;
        
        const reqStart = parseTime(startTime);
        const reqEnd = parseTime(endTime);

        // Check detailedAffiliations
        if (doctorData.detailedAffiliations) {
            let conflictFound = false;
            Object.values(doctorData.detailedAffiliations).forEach(affil => {
                if (affil.status === 'rejected') return;
                const affStart = parseTime(affil.startTime);
                const affEnd = parseTime(affil.endTime);
                
                for (const day of selectedDays) {
                    if (affil.workingDays?.includes(day)) {
                        if (reqStart < affEnd && reqEnd > affStart) {
                            conflictFound = true;
                            Alert.alert("Schedule Conflict", `This schedule conflicts with your affiliation at ${affil.hospitalName} on ${day}.`);
                        }
                    }
                }
            });
            if (conflictFound) return true;
        }
        
        return false;
    };

    const handleSubmit = async () => {
        if (!selectedHospital) {
            Alert.alert("Required", "Please select a hospital first.");
            return;
        }
        if (selectedDays.length === 0) {
            Alert.alert("Required", "Please select at least one working day.");
            return;
        }
        
        const reqStart = parseTime(startTime);
        const reqEnd = parseTime(endTime);
        
        if (reqStart >= reqEnd) {
            Alert.alert("Invalid Time", "End time must be after start time.");
            return;
        }
        if (!consultationFee || parseInt(consultationFee) <= 0) {
            Alert.alert("Required", "Please enter a valid consultation fee.");
            return;
        }

        const hasConflict = checkConflict();
        if (hasConflict) return;

        setSubmitting(true);
        try {
            const uid = auth.currentUser?.uid;
            const affilRef = push(ref(database, `doctors/${uid}/detailedAffiliations`));
            await set(affilRef, {
                hospitalName: selectedHospital.name,
                address: selectedHospital.address,
                lat: selectedHospital.latitude,
                lon: selectedHospital.longitude,
                workingDays: selectedDays,
                startTime,
                endTime,
                consultationFee: parseInt(consultationFee),
                status: "pending",
                createdAt: new Date().toISOString()
            });
            Alert.alert("Success", "Affiliation request submitted. Pending Admin approval.", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert("Error", error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Request Affiliation</Text>
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView 
                    style={styles.content} 
                    contentContainerStyle={{ padding: 20 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Step 1: Search Hospital */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Search Hospital</Text>
                        <View style={styles.searchRow}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder={loadingHospitals ? "Loading hospitals..." : "Search registered hospitals..."}
                                value={searchQuery}
                                onChangeText={handleSearch}
                                editable={!loadingHospitals}
                            />
                            <View style={[styles.searchBtn, { backgroundColor: '#c4c5d6' }]}>
                                {loadingHospitals ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="business" size={20} color="#fff" />}
                            </View>
                        </View>

                        {searchResults.length > 0 && !selectedHospital && (
                            <View style={styles.resultsContainer}>
                                {searchResults.map((item, index) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={styles.resultItem}
                                        onPress={() => setSelectedHospital(item)}
                                    >
                                        <Ionicons name="business" size={20} color="#1a40c2" />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.resultItemName}>{item.name}</Text>
                                            <Text style={styles.resultItemAddress} numberOfLines={1}>{item.address}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {selectedHospital && (
                            <View style={styles.selectedHospitalCard}>
                                <View style={styles.selectedHospitalInfo}>
                                    <Ionicons name="business" size={24} color="#1a40c2" />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.hospitalNameBold}>{selectedHospital.name}</Text>
                                        <Text style={styles.hospitalAddress} numberOfLines={2}>{selectedHospital.address}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedHospital(null)}>
                                    <Text style={styles.changeBtn}>Change</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Step 2: Set Schedule */}
                    <View style={[styles.section, !selectedHospital && styles.disabledSection]}>
                        <Text style={styles.sectionTitle}>2. Availability Days</Text>
                        <View style={styles.daysGrid}>
                            {DAYS_OF_WEEK.map(day => (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.dayChip, selectedDays.includes(day) && styles.dayChipActive]}
                                    onPress={() => selectedHospital && toggleDay(day)}
                                    disabled={!selectedHospital}
                                >
                                    <Text style={[styles.dayText, selectedDays.includes(day) && styles.dayTextActive]}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>3. Working Hours (24h format)</Text>
                        <View style={styles.timeRow}>
                            <View style={styles.timeInputContainer}>
                                <Text style={styles.timeLabel}>Start Time</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={startTime}
                                    onChangeText={setStartTime}
                                    placeholder="09:00"
                                    keyboardType="numbers-and-punctuation"
                                    editable={!!selectedHospital}
                                />
                            </View>
                            <Text style={{ marginTop: 24, marginHorizontal: 10, color: "#747686" }}>to</Text>
                            <View style={styles.timeInputContainer}>
                                <Text style={styles.timeLabel}>End Time</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={endTime}
                                    onChangeText={setEndTime}
                                    placeholder="17:00"
                                    keyboardType="numbers-and-punctuation"
                                    editable={!!selectedHospital}
                                />
                            </View>
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>4. Consultation Fee</Text>
                        <View style={styles.feeContainer}>
                            <Text style={styles.feeCurrency}>PKR</Text>
                            <TextInput
                                style={styles.feeInput}
                                value={consultationFee}
                                onChangeText={setConsultationFee}
                                placeholder="2000"
                                keyboardType="numeric"
                                editable={!!selectedHospital}
                            />
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity 
                        style={[styles.submitButton, (!selectedHospital || selectedDays.length === 0 || submitting || !consultationFee) && styles.submitDisabled]} 
                        onPress={handleSubmit}
                        disabled={!selectedHospital || selectedDays.length === 0 || submitting || !consultationFee}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Request</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
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
    section: { backgroundColor: "#ffffff", padding: 20, borderRadius: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    disabledSection: { opacity: 0.5 },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#191c1e", marginBottom: 16 },
    searchRow: { flexDirection: "row", gap: 12 },
    searchInput: { flex: 1, backgroundColor: "#f2f4f7", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 15 },
    searchBtn: { backgroundColor: "#1a40c2", width: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    resultsContainer: { marginTop: 12, borderWidth: 1, borderColor: "#e6e8eb", borderRadius: 12, overflow: "hidden" },
    resultItem: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#e6e8eb", backgroundColor: "#fafbfc" },
    resultItemName: { fontSize: 14, fontWeight: "bold", color: "#191c1e" },
    resultItemAddress: { fontSize: 11, color: "#747686", marginTop: 2 },
    selectedHospitalCard: { marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#E6F1FB", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(26,64,194,0.2)" },
    selectedHospitalInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
    hospitalNameBold: { fontSize: 15, fontWeight: "bold", color: "#1a40c2", marginBottom: 4 },
    hospitalAddress: { fontSize: 12, color: "#0c447c" },
    changeBtn: { fontSize: 13, fontWeight: "bold", color: "#ba1a1a", marginLeft: 12 },
    daysGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    dayChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 9999, backgroundColor: "#f2f4f7", borderWidth: 1, borderColor: "#e6e8eb" },
    dayChipActive: { backgroundColor: "#1a40c2", borderColor: "#1a40c2" },
    dayText: { fontSize: 14, fontWeight: "600", color: "#747686" },
    dayTextActive: { color: "#ffffff" },
    timeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    timeInputContainer: { flex: 1 },
    timeLabel: { fontSize: 12, fontWeight: "500", color: "#747686", marginBottom: 6, marginLeft: 4 },
    timeInput: { backgroundColor: "#f2f4f7", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 16, textAlign: "center", fontWeight: "bold", color: "#191c1e" },
    feeContainer: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#f2f4f7", 
        borderRadius: 12, 
        paddingHorizontal: 16,
        gap: 8,
    },
    feeCurrency: { fontSize: 16, fontWeight: "bold", color: "#1a40c2" },
    feeInput: { flex: 1, paddingVertical: 14, fontSize: 18, fontWeight: "bold", color: "#191c1e" },
    submitButton: { backgroundColor: "#1a40c2", borderRadius: 9999, paddingVertical: 16, alignItems: "center", marginTop: 10, marginBottom: 40, shadowColor: "#1a40c2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
    submitDisabled: { backgroundColor: "#c4c5d6", shadowOpacity: 0 },
    submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" }
});

export default RequestAffiliationPage;
