// pages/SignupPage.js
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { ref, set, onValue } from "firebase/database";
import { auth, database } from "../../config/firebase";
import { FormInput } from "../../components/FormInput";
import { FormDropdown } from "../../components/FormDropdown";
import { SectionDivider } from "../../components/SectionDivider";

const SignUpPage = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState("patient");

    // Common fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Doctor-specific fields (simplified — no affiliation, no fee, no schedule)
    const [selectedSpecializations, setSelectedSpecializations] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [medicalLicense, setMedicalLicense] = useState("");
    const [experience, setExperience] = useState("");
    const [bio, setBio] = useState("");
    const [education, setEducation] = useState("");

    // Dropdown options
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

    const validateForm = () => {
        if (!fullName || !email || !password || !confirmPassword) {
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
            if (selectedSpecializations.length === 0 || !medicalLicense || !experience) {
                Alert.alert("Error", "Please fill in all required doctor information");
                return false;
            }
            const expNum = parseInt(experience);
            if (isNaN(expNum) || expNum < 0) {
                Alert.alert("Error", "Please enter valid years of experience");
                return false;
            }
        }
        return true;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            try {
                await updateProfile(user, { displayName: fullName });
                await user.reload();
                
                // Send email verification
                await sendEmailVerification(user);
                
                const userData = {
                    role: userRole,
                    fullName,
                    email,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                
                if (userRole === "doctor"){
                    const doctorData = {
                        fullName,
                        specializations: selectedSpecializations,
                        primarySpecialization: selectedSpecializations[0] || "",
                        languages: selectedLanguages,
                        medicalLicense,
                        experience: parseInt(experience),
                        bio,
                        education,
                        isVerified: false,
                        rating: 0,
                        totalRatings: 0,
                        patientsCount: 0
                    };
                    await set(ref(database, `doctors/${user.uid}`), doctorData);
                }
                
                const userRef = ref(database, `users/${user.uid}`);
                await set(userRef, userData);
                
                Alert.alert("Success", userRole === "doctor" 
                    ? "Doctor account created! Please verify your email. Your profile is pending admin approval." 
                    : "Account created! Please check your email to verify your account.");
            } catch (dbError) {
                // Critical Fix: If database write fails, delete the auth user to prevent orphaned accounts
                await user.delete().catch(() => {}); // ignore delete errors
                throw new Error("Failed to save profile. Please check your connection and try again.");
            }

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
            <KeyboardAvoidingView 
                style={styles.keyboardView} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
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
                                    
                                    <FormInput label="Experience (years)" icon="time-outline" placeholder="e.g. 10" value={experience} onChangeText={setExperience} keyboardType="numeric" required />
                                    
                                    <FormInput label="Education" icon="school-outline" placeholder="MBBS, FCPS, etc." value={education} onChangeText={setEducation} />
                                    
                                    <FormInput label="Bio / Introduction" icon="document-text-outline" placeholder="Brief introduction about yourself" value={bio} onChangeText={setBio} multiline />

                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoBoxText}>
                                            ℹ️  After admin approval, you can add hospital affiliations, set your availability schedule, and consultation fees.
                                        </Text>
                                    </View>
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
    infoBox: { 
        backgroundColor: "#E6F1FB", borderRadius: 12, padding: 14, marginTop: 8, marginBottom: 4,
        borderLeftWidth: 3, borderLeftColor: "#1a40c2",
    },
    infoBoxText: { fontSize: 12, color: "#444654", lineHeight: 18 },
    signUpButton: { backgroundColor: "#1a40c2", borderRadius: 9999, paddingVertical: 12, alignItems: "center", marginTop: 8, elevation: 3 },
    signUpButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
    loginContainer: { marginTop: 20, alignItems: "center" },
    loginText: { fontSize: 13, color: "#444654" },
    loginLink: { fontWeight: "600", color: "#1a40c2" }
});

export default SignUpPage;