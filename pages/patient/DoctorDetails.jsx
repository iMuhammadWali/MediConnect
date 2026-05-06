import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "../../config/firebase";

const DoctorDetailsPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { doctorId } = route.params || {};

    const [doctor, setDoctor] = useState(null);
    const [affiliations, setAffiliations] = useState([]);
    const [selectedAffiliation, setSelectedAffiliation] = useState(null);
    const [showAffDropdown, setShowAffDropdown] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    useEffect(() => {
        if (!doctorId) return;
        const unsub = onValue(ref(database, `doctors/${doctorId}`), snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setDoctor(data);
                // Extract approved affiliations
                if (data.detailedAffiliations) {
                    const approved = Object.entries(data.detailedAffiliations)
                        .filter(([_, val]) => val.status === "approved")
                        .map(([key, val]) => ({ id: key, ...val }));
                    setAffiliations(approved);
                } else {
                    setAffiliations([]);
                }
            }
        });
        return unsub;
    }, [doctorId]);

    const getInitials = (fullName) => {
        if (!fullName) return "DR";
        const names = fullName.split(" ");
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    // Generate dates based on selected affiliation's working days
    const generateDates = () => {
        if (!selectedAffiliation) return [];
        const result = [];
        const today = new Date();
        const dayMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const workDays = selectedAffiliation.workingDays || [];
        
        let count = 0;
        for (let i = 0; i < 30 && count < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dayName = dayNames[d.getDay()];
            if (workDays.includes(dayName)) {
                result.push({
                    id: count,
                    day: dayName,
                    date: d.getDate().toString(),
                    month: d.toLocaleString('default', { month: 'short' }),
                    fullDate: d,
                });
                count++;
            }
        }
        return result;
    };

    // Generate time slots from affiliation's start/end time
    const generateTimeSlots = () => {
        if (!selectedAffiliation) return [];
        const slots = [];
        const [startH, startM] = selectedAffiliation.startTime.split(':').map(Number);
        const [endH, endM] = selectedAffiliation.endTime.split(':').map(Number);
        let startMin = startH * 60 + (startM || 0);
        const endMin = endH * 60 + (endM || 0);
        
        let id = 0;
        while (startMin < endMin) {
            const h = Math.floor(startMin / 60);
            const m = startMin % 60;
            const ampm = h >= 12 ? "PM" : "AM";
            const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
            const timeStr = `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
            slots.push({ id: id++, time: timeStr });
            startMin += 30;
        }
        return slots;
    };

    const dates = generateDates();
    const timeSlots = generateTimeSlots();

    const handleConfirm = () => {
        if (!selectedAffiliation || !selectedDate || !selectedTime) {
            Alert.alert("Incomplete", "Please select a hospital, date, and time slot.");
            return;
        }
        const selectedFullDate = dates.find(d => d.id === selectedDate)?.fullDate;
        const dateStr = selectedFullDate
            ? selectedFullDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : `Date: ${selectedDate}`;

        navigation.navigate("Payment", {
            doctorId,
            doctorName: doctor?.fullName || "Dr. Unknown",
            hospitalName: selectedAffiliation.hospitalName,
            affiliationId: selectedAffiliation.id,
            date: dateStr,
            time: selectedTime,
            fee: selectedAffiliation.consultationFee || 0,
        });
    };

    if (!doctor) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size="large" color="#1a40c2" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.topNav}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={20} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.doctorIdentity}>
                        <View style={styles.doctorAvatar}>
                            <Text style={styles.doctorInitials}>{getInitials(doctor?.fullName)}</Text>
                        </View>
                        <Text style={styles.doctorName}>{doctor?.fullName || "Loading..."}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor?.primarySpecialization || "Specialty"}</Text>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{doctor.experience || 0} yrs</Text>
                            <Text style={styles.statLabel}>Experience</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{doctor.patientsCount || 0}+</Text>
                            <Text style={styles.statLabel}>Patients</Text>
                        </View>
                        <View style={styles.statCard}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                <Text style={styles.statValue}>{doctor.rating || 0}</Text>
                                <Ionicons name="star" size={14} color="#F39C12" />
                            </View>
                            <Text style={styles.statLabel}>Rating</Text>
                        </View>
                    </View>

                    {/* Education & Experience Section */}
                    {(doctor.education || doctor.experience) && (
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Education & Experience</Text>
                            {doctor.education && (
                                <View style={styles.eduRow}>
                                    <View style={styles.eduIconBox}>
                                        <Ionicons name="school" size={18} color="#1a40c2" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.eduLabel}>Education</Text>
                                        <Text style={styles.eduValue}>{doctor.education}</Text>
                                    </View>
                                </View>
                            )}
                            {doctor.experience && (
                                <View style={styles.eduRow}>
                                    <View style={styles.eduIconBox}>
                                        <Ionicons name="briefcase" size={18} color="#1a40c2" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.eduLabel}>Professional Experience</Text>
                                        <Text style={styles.eduValue}>{doctor.experience} years of clinical practice</Text>
                                    </View>
                                </View>
                            )}
                            {doctor.languages && doctor.languages.length > 0 && (
                                <View style={styles.eduRow}>
                                    <View style={styles.eduIconBox}>
                                        <Ionicons name="language" size={18} color="#1a40c2" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.eduLabel}>Languages</Text>
                                        <Text style={styles.eduValue}>{doctor.languages.join(", ")}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {/* About Section */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>About Doctor</Text>
                        <Text style={styles.aboutText}>
                            {doctor?.bio || "No biography provided by the doctor."}
                        </Text>
                    </View>

                    {/* Affiliation Selector */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Select Hospital</Text>
                        {affiliations.length === 0 ? (
                            <Text style={styles.noAffText}>This doctor has no available affiliations yet.</Text>
                        ) : (
                            <>
                                <TouchableOpacity 
                                    style={styles.dropdownBtn}
                                    onPress={() => setShowAffDropdown(!showAffDropdown)}
                                >
                                    <Ionicons name="business" size={20} color="#1a40c2" />
                                    <Text style={styles.dropdownBtnText} numberOfLines={1}>
                                        {selectedAffiliation ? selectedAffiliation.hospitalName : "Choose a hospital..."}
                                    </Text>
                                    <Ionicons name={showAffDropdown ? "chevron-up" : "chevron-down"} size={18} color="#747686" />
                                </TouchableOpacity>
                                
                                {showAffDropdown && (
                                    <View style={styles.dropdownList}>
                                        {affiliations.map(aff => (
                                            <TouchableOpacity 
                                                key={aff.id} 
                                                style={[
                                                    styles.dropdownItem, 
                                                    selectedAffiliation?.id === aff.id && styles.dropdownItemActive
                                                ]}
                                                onPress={() => {
                                                    setSelectedAffiliation(aff);
                                                    setShowAffDropdown(false);
                                                    setSelectedDate(null);
                                                    setSelectedTime(null);
                                                }}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.dropdownItemName}>{aff.hospitalName}</Text>
                                                    <Text style={styles.dropdownItemSub}>
                                                        {aff.workingDays?.join(", ")} • {aff.startTime}-{aff.endTime} • PKR {aff.consultationFee || "N/A"}
                                                    </Text>
                                                </View>
                                                {selectedAffiliation?.id === aff.id && (
                                                    <Ionicons name="checkmark-circle" size={20} color="#1a40c2" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Selected affiliation details */}
                                {selectedAffiliation && (
                                    <View style={styles.affDetailCard}>
                                        <View style={styles.affDetailRow}>
                                            <Ionicons name="calendar-outline" size={16} color="#1a40c2" />
                                            <Text style={styles.affDetailText}>{selectedAffiliation.workingDays?.join(", ")}</Text>
                                        </View>
                                        <View style={styles.affDetailRow}>
                                            <Ionicons name="time-outline" size={16} color="#1a40c2" />
                                            <Text style={styles.affDetailText}>{selectedAffiliation.startTime} - {selectedAffiliation.endTime}</Text>
                                        </View>
                                        <View style={styles.affDetailRow}>
                                            <Ionicons name="cash-outline" size={16} color="#1a40c2" />
                                            <Text style={[styles.affDetailText, { fontWeight: "bold" }]}>PKR {selectedAffiliation.consultationFee || "N/A"}</Text>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}
                    </View>

                    {/* Date Selection */}
                    {selectedAffiliation && dates.length > 0 && (
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Select Date</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesList}>
                                {dates.map(item => (
                                    <TouchableOpacity 
                                        key={item.id}
                                        style={[styles.dateChip, selectedDate === item.id && styles.activeDateChip]}
                                        onPress={() => { setSelectedDate(item.id); setSelectedTime(null); }}
                                    >
                                        <Text style={[styles.dateDay, selectedDate === item.id && styles.activeDateText]}>{item.day}</Text>
                                        <Text style={[styles.dateNumber, selectedDate === item.id && styles.activeDateText]}>{item.date}</Text>
                                        <Text style={[styles.dateMonth, selectedDate === item.id && styles.activeDateText]}>{item.month}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Time Selection */}
                    {selectedDate !== null && timeSlots.length > 0 && (
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>Select Time</Text>
                            <View style={styles.timeGrid}>
                                {timeSlots.map(slot => (
                                    <TouchableOpacity 
                                        key={slot.id}
                                        style={[styles.timeChip, selectedTime === slot.time && styles.activeTimeChip]}
                                        onPress={() => setSelectedTime(slot.time)}
                                    >
                                        <Text style={[styles.timeText, selectedTime === slot.time && styles.activeTimeText]}>
                                            {slot.time}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={[styles.confirmButton, (!selectedAffiliation || selectedDate === null || !selectedTime) && {opacity: 0.5}]} 
                    onPress={handleConfirm}
                    disabled={!selectedAffiliation || selectedDate === null || !selectedTime}
                >
                    <Text style={styles.confirmButtonText}>Continue to Payment</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 120 },
    header: {
        backgroundColor: "#3b5bdb",
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingTop: 15,
        paddingBottom: 80,
        paddingHorizontal: 24,
    },
    topNav: { flexDirection: "row", justifyContent: "space-between" },
    iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
    doctorIdentity: { alignItems: "center" },
    doctorAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 4, borderColor: "rgba(255,255,255,0.2)", elevation: 4 },
    doctorInitials: { fontSize: 32, fontWeight: "bold", color: "#3b5bdb" },
    doctorName: { fontSize: 24, fontWeight: "bold", color: "#ffffff", letterSpacing: -0.5, marginBottom: 4 },
    doctorSpecialty: { fontSize: 16, fontWeight: "500", color: "#e2e5ff", opacity: 0.9 },
    mainContent: { marginTop: -40, paddingHorizontal: 20, gap: 16 },
    statsRow: { flexDirection: "row", gap: 12 },
    statCard: { flex: 1, backgroundColor: "#dde1ff", borderRadius: 12, padding: 12, alignItems: "center" },
    statValue: { fontSize: 18, fontWeight: "bold", color: "#0736ba", lineHeight: 22 },
    statLabel: { fontSize: 12, fontWeight: "500", color: "#0736ba", opacity: 0.8, marginTop: 2 },
    sectionCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#191c1e", marginBottom: 12 },
    aboutText: { fontSize: 15, lineHeight: 24, color: "#444654" },
    eduRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
    eduIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center", marginTop: 2 },
    eduLabel: { fontSize: 12, color: "#747686", fontWeight: "500", marginBottom: 2 },
    eduValue: { fontSize: 15, color: "#191c1e", fontWeight: "600", lineHeight: 22 },
    noAffText: { fontSize: 14, color: "#747686", textAlign: "center", paddingVertical: 20 },
    dropdownBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#f2f4f7", padding: 14, borderRadius: 12 },
    dropdownBtnText: { flex: 1, fontSize: 15, color: "#191c1e", fontWeight: "500" },
    dropdownList: { marginTop: 8, borderWidth: 1, borderColor: "#e6e8eb", borderRadius: 12, overflow: "hidden" },
    dropdownItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: "#f2f4f7", flexDirection: "row", alignItems: "center" },
    dropdownItemActive: { backgroundColor: "#E6F1FB" },
    dropdownItemName: { fontSize: 15, fontWeight: "600", color: "#191c1e", marginBottom: 2 },
    dropdownItemSub: { fontSize: 12, color: "#747686" },
    affDetailCard: { marginTop: 12, backgroundColor: "#f7f9fc", padding: 14, borderRadius: 12, gap: 8, borderLeftWidth: 3, borderLeftColor: "#1a40c2" },
    affDetailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    affDetailText: { fontSize: 14, color: "#444654", fontWeight: "500" },
    datesList: { gap: 12, paddingVertical: 4 },
    dateChip: { alignItems: "center", justifyContent: "center", minWidth: 64, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 16, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e6e8eb" },
    activeDateChip: { backgroundColor: "#3b5bdb", borderColor: "#3b5bdb", elevation: 5 },
    dateDay: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", color: "#747686", marginBottom: 2 },
    dateNumber: { fontSize: 20, fontWeight: "bold", color: "#191c1e" },
    dateMonth: { fontSize: 10, color: "#747686", fontWeight: "500", marginTop: 2 },
    activeDateText: { color: "#ffffff" },
    timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    timeChip: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: "#f2f4f7", minWidth: "30%" , alignItems: "center" },
    activeTimeChip: { backgroundColor: "#3b5bdb", elevation: 4 },
    timeText: { fontSize: 14, fontWeight: "600", color: "#191c1e" },
    activeTimeText: { color: "#ffffff" },
    bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 50, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
    confirmButton: { backgroundColor: "#3b5bdb", borderRadius: 9999, paddingVertical: 16, alignItems: "center", justifyContent: "center", elevation: 6 },
    confirmButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});

export default DoctorDetailsPage;