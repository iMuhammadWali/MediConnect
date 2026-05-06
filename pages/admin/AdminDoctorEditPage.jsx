// Admin edit page for a single doctor's data.
// Fields mirror those used in SignupPage.jsx for consistency.
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ref, onValue, update, set } from "firebase/database";
import { database } from "../../config/firebase";
import { FormInput } from "../../components/FormInput";
import { FormDropdown } from "../../components/FormDropdown";
import { DayPicker } from "../../components/DayPicker";
import { SectionDivider } from "../../components/SectionDivider";

const AdminDoctorEditPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { doctorUid } = route.params;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Doctor fields (same names as in SignupPage and Firebase)
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [medicalLicense, setMedicalLicense] = useState("");
    const [hospitalAffiliation, setHospitalAffiliation] = useState("");
    const [experience, setExperience] = useState("");
    const [consultationFee, setConsultationFee] = useState("");
    const [bio, setBio] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [education, setEducation] = useState("");
    const [services, setServices] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    // Dropdown states
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [workingDays, setWorkingDays] = useState([]);
    const [detailedAffiliations, setDetailedAffiliations] = useState({});

    const specializations = [
        "Cardiologist", "Interventional Cardiologist", "Pediatric Cardiologist",
        "Neurologist", "Neurosurgeon", "Pediatric Neurologist",
        "Pediatrician", "Neonatologist", "Adolescent Medicine Specialist",
        "Dermatologist", "Cosmetic Dermatologist", "Pediatric Dermatologist",
        "Orthopedic Surgeon", "Pediatric Orthopedic Surgeon", "Sports Medicine Specialist",
        "Gynecologist", "Obstetrician", "Reproductive Endocrinologist",
        "Ophthalmologist", "Pediatric Ophthalmologist", "Retina Specialist",
        "ENT Specialist", "Otologist", "Rhinologist", "Laryngologist",
        "Psychiatrist", "Child Psychiatrist", "Forensic Psychiatrist",
        "Radiologist", "Interventional Radiologist", "Pediatric Radiologist",
        "General Physician", "Internal Medicine Specialist", "Family Medicine Specialist",
        "Dentist", "Orthodontist", "Oral Surgeon", "Pediatric Dentist",
        "Urologist", "Pediatric Urologist", "Urogynecologist",
        "Gastroenterologist", "Pediatric Gastroenterologist", "Hepatologist",
        "Endocrinologist", "Pediatric Endocrinologist", "Diabetologist",
        "Nephrologist", "Pediatric Nephrologist",
        "Pulmonologist", "Pediatric Pulmonologist",
        "Rheumatologist", "Pediatric Rheumatologist",
        "Oncologist", "Pediatric Oncologist", "Radiation Oncologist",
        "Anesthesiologist", "Pain Management Specialist", "Pediatric Anesthesiologist",
        "Emergency Medicine Specialist", "Critical Care Specialist",
        "Infectious Disease Specialist", "Immunologist", "Allergist",
        "Hematologist", "Pathologist", "Geneticist"
    ];

    const languagesList = [
        "English", "Urdu", "Hindi", "Arabic", "Punjabi", "Pashto",
        "Sindhi", "Balochi", "French", "German", "Chinese", "Turkish",
        "Persian", "Spanish", "Russian", "Japanese", "Korean", "Italian",
        "Portuguese", "Dutch", "Swedish", "Norwegian", "Danish", "Finnish",
        "Greek", "Polish", "Czech", "Hungarian", "Romanian", "Thai",
        "Vietnamese", "Malay", "Indonesian", "Filipino", "Bengali", "Nepali"
    ];

    const toggleSpecialization = (specialization) => {
        setSelectedSpecializations(prev =>
            prev.includes(specialization)
                ? prev.filter(s => s !== specialization)
                : [...prev, specialization]
        );
    };

    const toggleLanguage = (language) => {
        setSelectedLanguages(prev =>
            prev.includes(language)
                ? prev.filter(l => l !== language)
                : [...prev, language]
        );
    };

    const toggleWorkingDay = (day) => {
        setWorkingDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    useEffect(() => {
        const doctorRef = ref(database, `doctors/${doctorUid}`);
        const unsubscribe = onValue(doctorRef, (snapshot) => {
            if (snapshot.exists()) {
                const d = snapshot.val();
                setFullName(d.fullName || "");
                setPhone(d.phone || "");
                setMedicalLicense(d.medicalLicense || "");
                setHospitalAffiliation(d.hospitalAffiliation || "");
                setExperience(d.experience !== undefined ? String(d.experience) : "");
                setConsultationFee(d.consultationFee !== undefined ? String(d.consultationFee) : "");
                setBio(d.bio || "");
                setStartTime(d.startTime || "");
                setEndTime(d.endTime || "");
                setEducation(d.education || "");
                setServices(d.services || "");
                setIsVerified(d.isVerified || false);
                setSelectedSpecializations(d.specializations || []);
                setSelectedLanguages(d.languages || []);
                setWorkingDays(d.workingDays || []);
                setDetailedAffiliations(d.detailedAffiliations || {});
            }
            setLoading(false);
        });
        return unsubscribe;
    }, [doctorUid]);

    const handleSave = async () => {
        if (!fullName || !medicalLicense || !experience) {
            Alert.alert("Error", "Please fill in all required fields (Full Name, License, Experience)");
            return;
        }
        const expNum = parseInt(experience);
        if (isNaN(expNum) || expNum < 0) {
            Alert.alert("Error", "Please enter valid years of experience");
            return;
        }
        let feeNum = 0;
        if (consultationFee) {
            feeNum = parseInt(consultationFee);
            if (isNaN(feeNum) || feeNum < 0) {
                Alert.alert("Error", "Please enter a valid consultation fee");
                return;
            }
        }

        setSaving(true);
        try {
            // Update doctor node
            await update(ref(database, `doctors/${doctorUid}`), {
                fullName,
                phone,
                medicalLicense,
                hospitalAffiliation,
                experience: expNum,
                consultationFee: feeNum,
                bio,
                startTime,
                endTime,
                education,
                services,
                isVerified,
                specializations: selectedSpecializations,
                primarySpecialization: selectedSpecializations[0] || "",
                languages: selectedLanguages,
                workingDays,
            });
            // Keep users node fullName and phone in sync
            await update(ref(database, `users/${doctorUid}`), {
                fullName,
                phone,
                updatedAt: new Date().toISOString(),
            });
            Alert.alert("Success", "Doctor profile updated successfully!");
            navigation.goBack();
        } catch (e) {
            Alert.alert("Error", e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveAffiliation = (affKey, hospitalName) => {
        Alert.alert(
            "Remove Affiliation",
            `Are you sure you want to remove the affiliation with ${hospitalName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const affRef = ref(database, `doctors/${doctorUid}/detailedAffiliations/${affKey}`);
                            await set(affRef, null);
                            Alert.alert("Success", "Affiliation removed.");
                        } catch (e) {
                            Alert.alert("Error", e.message);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1a40c2" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={22} color="#ffffff" />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>Edit Doctor</Text>
                        <Text style={styles.headerSubtitle} numberOfLines={1}>{fullName}</Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.card}>
                        {/* Verification toggle */}
                        <View style={styles.verifyRow}>
                            <View>
                                <Text style={styles.verifyLabel}>Verification Status</Text>
                                <Text style={styles.verifySubLabel}>
                                    {isVerified ? "Doctor is visible to patients" : "Doctor is hidden from patients"}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.verifyToggle, isVerified ? styles.verifyToggleOn : styles.verifyToggleOff]}
                                onPress={() => setIsVerified(!isVerified)}
                            >
                                <Text style={[styles.verifyToggleText, isVerified ? styles.verifyToggleTextOn : styles.verifyToggleTextOff]}>
                                    {isVerified ? "Verified" : "Pending"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <SectionDivider title="Basic Information" />

                        <FormInput label="Full Name" icon="person-outline" placeholder="Full Name" value={fullName} onChangeText={setFullName} required />
                        <FormInput label="Phone Number" icon="call-outline" placeholder="+92 XXX XXXXXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                        <SectionDivider title="Professional Information" />

                        <FormDropdown
                            label="Specializations"
                            icon="medkit-outline"
                            placeholder="Select Specializations (can select multiple)"
                            multiple
                            selectedItems={selectedSpecializations}
                            onToggleItem={toggleSpecialization}
                            options={specializations}
                            required
                        />

                        {selectedSpecializations.length > 0 && (
                            <View style={styles.selectedCountContainer}>
                                <Text style={styles.selectedCountText}>
                                    {selectedSpecializations.length} specialization(s) selected
                                </Text>
                            </View>
                        )}

                        <FormDropdown
                            label="Languages Spoken"
                            icon="language-outline"
                            placeholder="Select Languages (can select multiple)"
                            multiple
                            selectedItems={selectedLanguages}
                            onToggleItem={toggleLanguage}
                            options={languagesList}
                            required
                        />

                        <FormInput label="Medical License Number" icon="card-outline" placeholder="License Number" value={medicalLicense} onChangeText={setMedicalLicense} required />

                        <SectionDivider title="Manage Detailed Affiliations" />
                        {Object.entries(detailedAffiliations).length === 0 ? (
                            <Text style={styles.emptyText}>No detailed affiliations found.</Text>
                        ) : (
                            Object.entries(detailedAffiliations).map(([key, aff]) => (
                                <View key={key} style={styles.affCard}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.affName}>{aff.hospitalName}</Text>
                                        <Text style={styles.affDetails}>
                                            {aff.workingDays?.join(", ")} • {aff.startTime}-{aff.endTime}
                                        </Text>
                                        <Text style={[styles.statusBadgeText, aff.status === 'approved' ? styles.statusApproved : styles.statusPending]}>
                                            {aff.status?.toUpperCase()}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removeAffBtn}
                                        onPress={() => handleRemoveAffiliation(key, aff.hospitalName)}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ba1a1a" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}

                        <FormInput label="Hospital/Clinic Affiliation (Primary Display)" icon="business-outline" placeholder="Hospital Name" value={hospitalAffiliation} onChangeText={setHospitalAffiliation} />

                        <View style={styles.rowContainer}>
                            <View style={{ flex: 1 }}>
                                <FormInput label="Experience (years)" icon="time-outline" placeholder="10" value={experience} onChangeText={setExperience} keyboardType="numeric" required />
                            </View>
                            <View style={{ flex: 1 }}>
                                <FormInput label="Consultation Fee (PKR)" icon="cash-outline" placeholder="2000" value={consultationFee} onChangeText={setConsultationFee} keyboardType="numeric" />
                            </View>
                        </View>

                        <FormInput label="Education" icon="school-outline" placeholder="MBBS, FCPS, etc." value={education} onChangeText={setEducation} />

                        <SectionDivider title="Schedule & About" />

                        <DayPicker selectedDays={workingDays} onToggleDay={toggleWorkingDay} label="Working Days" />

                        <View style={styles.rowContainer}>
                            <View style={{ flex: 1 }}>
                                <FormInput label="Start Time" icon="time-outline" placeholder="09:00 AM" value={startTime} onChangeText={setStartTime} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <FormInput label="End Time" icon="time-outline" placeholder="05:00 PM" value={endTime} onChangeText={setEndTime} />
                            </View>
                        </View>

                        <FormInput label="Services Offered" icon="list-outline" placeholder="Heart Checkup, ECG, Surgery" value={services} onChangeText={setServices} multiline />
                        <FormInput label="Bio / Introduction" icon="document-text-outline" placeholder="Brief introduction" value={bio} onChangeText={setBio} multiline />

                        <TouchableOpacity
                            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
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
    verifyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eceef1",
        marginBottom: 8,
    },
    verifyLabel: { fontSize: 14, fontWeight: "bold", color: "#191c1e" },
    verifySubLabel: { fontSize: 11, color: "#717273", marginTop: 2 },
    verifyToggle: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 9999,
    },
    verifyToggleOn: { backgroundColor: "#d4f5e2" },
    verifyToggleOff: { backgroundColor: "#fff4e6" },
    verifyToggleText: { fontSize: 12, fontWeight: "bold" },
    verifyToggleTextOn: { color: "#1d8a4e" },
    verifyToggleTextOff: { color: "#e07b00" },
    rowContainer: { flexDirection: "row", gap: 12 },
    selectedCountContainer: { marginTop: -8, marginBottom: 8, paddingHorizontal: 4 },
    selectedCountText: { fontSize: 11, color: "#1a40c2", fontWeight: "500" },
    saveButton: {
        backgroundColor: "#1a40c2",
        borderRadius: 9999,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 16,
        elevation: 3,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
    emptyText: { textAlign: "center", color: "#747686", marginVertical: 10, fontStyle: "italic", fontSize: 13 },
    affCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f7f9fc",
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: "#1a40c2",
    },
    affName: { fontSize: 14, fontWeight: "bold", color: "#191c1e" },
    affDetails: { fontSize: 11, color: "#444654", marginTop: 2 },
    statusBadgeText: { fontSize: 9, fontWeight: "bold", marginTop: 4, alignSelf: "flex-start" },
    statusApproved: { color: "#1d8a4e" },
    statusPending: { color: "#e07b00" },
    removeAffBtn: {
        padding: 8,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginLeft: 10,
    }
});

export default AdminDoctorEditPage;
