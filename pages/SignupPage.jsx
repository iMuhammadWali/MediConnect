// pages/SignupPage.js (Updated for multiple specializations)
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set, onValue } from "firebase/database";
import { auth, database } from "../config/firebase";
import { FormInput } from "../components/FormInput";
import { FormDropdown } from "../components/FormDropdown";
import { DayPicker } from "../components/DayPicker";
import { SectionDivider } from "../components/SectionDivider";

const SignUpPage = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState("patient");
    const [hospitals, setHospitals] = useState([]);

    useEffect(() => {
        const hRef = ref(database, "hospitals");
        const unsub = onValue(hRef, snapshot => {
            const res = [];
            if (snapshot.exists()) {
                snapshot.forEach(child => {
                    const hospital = child.val();
                    if (hospital.name) res.push(hospital.name);
                });
            }
            setHospitals(res);
        });
        return unsub;
    }, []);
    
    // Common fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Doctor-specific fields
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [medicalLicense, setMedicalLicense] = useState("");
    const [hospitalAffiliation, setHospitalAffiliation] = useState("");
    const [experience, setExperience] = useState("");
    const [consultationFee, setConsultationFee] = useState("");
    const [bio, setBio] = useState("");
    const [workingDays, setWorkingDays] = useState([]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [education, setEducation] = useState("");
    const [services, setServices] = useState("");

    // Dropdown options (I should really remove some of these)
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

    const validateForm = () => {
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all required fields");
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return false;
        }
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return false;
        }
        if (userRole === "doctor") {
            if (selectedSpecializations.length === 0 || !medicalLicense || !hospitalAffiliation || !experience || !consultationFee) {
                Alert.alert("Error", "Please fill in all doctor information");
                return false;
            }
            const expNum = parseInt(experience);
            if (isNaN(expNum) || expNum < 0) {
                Alert.alert("Error", "Please enter valid years of experience");
                return false;
            }
            const feeNum = parseInt(consultationFee);
            if (isNaN(feeNum) || feeNum < 0) {
                Alert.alert("Error", "Please enter valid consultation fee");
                return false;
            }
        }
        return true;
    };

    // Claude said to add a fallback if write to database after createUserWithEmailAndPassword succeeds but set(ref, val) fails.
    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: fullName });
            await user.reload();
            const userData = {
                role: userRole,
                fullName,
                email,
                phone,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            let doctorData = null;
            if (userRole === "doctor"){
                doctorData = {
                    fullName,
                    phone,
                    specializations: selectedSpecializations,
                    primarySpecialization: selectedSpecializations[0] || "",
                    languages: selectedLanguages,
                    medicalLicense,
                    hospitalAffiliation,
                    experience: parseInt(experience),
                    consultationFee: parseInt(consultationFee),
                    bio,
                    workingDays,
                    startTime: startTime || "09:00 AM",
                    endTime: endTime || "05:00 PM",
                    education,
                    services,
                    // Admin must verify doctor
                    isVerified: false,
                    rating: 0,
                    totalRatings: 0,
                    patientsCount: 0
                }
                await set(ref(database, `doctors/${user.uid}`), doctorData);
            }
            const userRef = ref(database, `users/${user.uid}`);
            await set(userRef, userData);
            
            Alert.alert("Success", userRole === "doctor" 
                ? "Doctor account created! Pending admin verification." 
                : "Account created successfully!");

        } catch (error) {
            const errorMessages = {
                'auth/email-already-in-use': "An account already exists with this email.",
                'auth/invalid-email': "Invalid email address format.",
                'auth/weak-password': "Password is too weak. Use at least 6 characters."
            };
            Alert.alert("Sign Up Error", errorMessages[error.code] || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentContainer}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>MediConnect</Text>
                        </View>

                        <View style={styles.signUpCard}>
                            <Text style={styles.welcomeTitle}>Create Account</Text>

                            {/* Role Toggle */}
                            <View style={styles.roleToggle}>
                                <TouchableOpacity style={[styles.roleButton, userRole === 'patient' && styles.activeRoleButton]} onPress={() => setUserRole("patient")}>
                                    <Text style={[styles.roleButtonText, userRole === "patient" && styles.activeRoleButtonText]}>Patient</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.roleButton, userRole === 'doctor' && styles.activeRoleButton]} onPress={() => setUserRole("doctor")}>
                                    <Text style={[styles.roleButtonText, userRole === "doctor" && styles.activeRoleButtonText]}>Doctor</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Common Fields */}
                            <FormInput label="Full Name" icon="person-outline" placeholder="Full Name" value={fullName} onChangeText={setFullName} required />
                            <FormInput label="Email" icon="mail-outline" placeholder="email@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" required />
                            <FormInput label="Phone Number" icon="call-outline" placeholder="+92 XXX XXXXXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" required />

                            {/* Doctor Fields */}
                            {userRole === "doctor" && (
                                <>
                                    <SectionDivider title="Professional Information" />
                                    
                                    {/* Multiple Specializations Dropdown */}
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
                                    
                                    {/* Display selected specializations count */}
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
                                    
                                    <FormDropdown 
                                        label="Hospital/Clinic Affiliation" 
                                        icon="business-outline" 
                                        placeholder="Select Hospital" 
                                        value={hospitalAffiliation} 
                                        onSelect={setHospitalAffiliation} 
                                        options={hospitals} 
                                        required 
                                    />
                                    
                                    <View style={styles.rowContainer}>
                                        <View style={{ flex: 1 }}>
                                            <FormInput label="Experience (write in years)" icon="time-outline" placeholder="10" value={experience} onChangeText={setExperience} keyboardType="numeric" required />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <FormInput label="Consultation Fee (PKR)" icon="cash-outline" placeholder="2000" value={consultationFee} onChangeText={setConsultationFee} keyboardType="numeric" required />
                                        </View>
                                    </View>
                                    
                                    <FormInput label="Education" icon="school-outline" placeholder="MBBS, FCPS, etc." value={education} onChangeText={setEducation} />
                                    
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
                                    <FormInput label="Bio / Introduction" icon="document-text-outline" placeholder="Brief introduction about yourself" value={bio} onChangeText={setBio} multiline />
                                </>
                            )}

                            {/* Password Fields */}
                            <FormInput label="Password" icon="lock-closed-outline" placeholder="********" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} showPasswordToggle onTogglePassword={() => setShowPassword(!showPassword)} required />
                            <FormInput label="Confirm Password" icon="lock-closed-outline" placeholder="********" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} showPasswordToggle onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)} required />

                            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={loading}>
                                <Text style={styles.signUpButtonText}>{loading ? "Creating Account..." : "Sign Up"}</Text>
                            </TouchableOpacity>

                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink} onPress={() => navigation.replace("Login")}>Log in</Text></Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    contentContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, paddingVertical: 20 },
    logoContainer: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
    logoText: { fontSize: 24, fontWeight: "bold", letterSpacing: -0.5, color: "#1a40c2" },
    signUpCard: { backgroundColor: "#ffffff", borderRadius: 24, padding: 20, width: "100%", shadowColor: "#1a40c2", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    welcomeTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: "#191c1e" },
    roleToggle: { flexDirection: "row", backgroundColor: "#eceef1", borderRadius: 9999, padding: 4, marginBottom: 20 },
    roleButton: { flex: 1, paddingVertical: 8, borderRadius: 9999, alignItems: "center" },
    activeRoleButton: { backgroundColor: "#ffffff", elevation: 1 },
    roleButtonText: { fontSize: 13, fontWeight: "500", color: "#444654" },
    activeRoleButtonText: { color: "#1a40c2", fontWeight: "600" },
    rowContainer: { flexDirection: "row", gap: 12 },
    selectedCountContainer: { marginTop: -8, marginBottom: 8, paddingHorizontal: 4 },
    selectedCountText: { fontSize: 11, color: "#1a40c2", fontWeight: "500" },
    signUpButton: { backgroundColor: "#1a40c2", borderRadius: 9999, paddingVertical: 12, alignItems: "center", marginTop: 8, elevation: 3 },
    signUpButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
    loginContainer: { marginTop: 20, alignItems: "center" },
    loginText: { fontSize: 13, color: "#444654" },
    loginLink: { fontWeight: "600", color: "#1a40c2" }
});

export default SignUpPage;