import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { ref, push, set } from "firebase/database";
import { database, auth } from "../config/firebase";

const DoctorDetailsPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { doctorId } = route.params || {};

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [loading, setLoading] = useState(false);

    // This component should have a doctor object passed to it as a prop
    const stats = [
        { id: 1, value: "20 yrs", label: "Experience" },
        { id: 2, value: "1000+", label: "Patients" },
        { id: 3, value: "5.0", label: "Rating", hasStar: true },
    ];


    // And all this data should be retrieved from database.

    const dates = [
        { id: 1, day: "Mon", date: "11", isActive: false },
        { id: 2, day: "Tue", date: "12", isActive: true },
        { id: 3, day: "Wed", date: "13", isActive: false },
        { id: 4, day: "Thu", date: "14", isActive: false },
        { id: 5, day: "Fri", date: "15", isActive: false },
    ];


    const timeSlots = [
        { id: 1, time: "09:00 AM", isActive: true, isBooked: false },
        { id: 2, time: "09:30 AM", isActive: false, isBooked: false },
        { id: 3, time: "10:00 AM", isActive: false, isBooked: false },
        { id: 4, time: "10:30 AM", isActive: false, isBooked: false },
        { id: 5, time: "11:00 AM", isActive: false, isBooked: false },
        { id: 6, time: "11:30 AM", isActive: false, isBooked: true },
    ];

    const renderStatItem = ({ item }) => (
        <View style={styles.statCard}>
            <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{item.value}</Text>
                {item.hasStar && (
                    <Ionicons name="star" size={14} color="#F39C12" />
                )}
            </View>
            <Text style={styles.statLabel}>{item.label}</Text>
        </View>
    );

    const renderDateItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.dateChip,
                selectedDate === item.date && styles.activeDateChip
            ]}
            onPress={() => setSelectedDate(item.date)}
        >
            <Text style={[
                styles.dateDay,
                selectedDate === item.date && styles.activeDateText
            ]}>{item.day}</Text>
            <Text style={[
                styles.dateNumber,
                selectedDate === item.date && styles.activeDateText
            ]}>{item.date}</Text>
        </TouchableOpacity>
    );

    const renderTimeSlot = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.timeChip,
                selectedTime === item.time && styles.activeTimeChip,
                item.isBooked && styles.bookedTimeChip
            ]}
            disabled={item.isBooked}
            onPress={() => setSelectedTime(item.time)}
        >
            <Text style={[
                styles.timeText,
                selectedTime === item.time && styles.activeTimeText,
                item.isBooked && styles.bookedTimeText
            ]}>{item.time}</Text>
        </TouchableOpacity>
    );

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime) {
            alert("Please select a date and time");
            return;
        }
        setLoading(true);
        try {
            const newRef = push(ref(database, "appointments"));
            await set(newRef, {
                patientId: auth.currentUser?.uid,
                doctorId: doctorId || "unknown_doctor",
                doctorName: "Dr. Sarah Ahmed", // Default fallback
                date: `Sep ${selectedDate}, 2023`,
                time: selectedTime,
                status: "Upcoming",
                createdAt: new Date().toISOString()
            });
            alert("Appointment booked successfully!");
            navigation.goBack();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                
                {/* Header Section (Hero) */}
                <View style={styles.header}>
                    {/* Top Nav */}
                    <View style={styles.topNav}>
                        <TouchableOpacity 
                            style={styles.iconButton}
                            onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={20} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    {/* Doctor Identity */}
                    <View style={styles.doctorIdentity}>
                        <View style={styles.doctorAvatar}>
                            <Text style={styles.doctorInitials}>SA</Text>
                        </View>
                        <Text style={styles.doctorName}>Dr. Sarah Ahmed</Text>
                        <Text style={styles.doctorSpecialty}>Cardiologist</Text>
                    </View>
                </View>

                {/* Main Content Area */}
                <View style={styles.mainContent}>
                    {/* Stats Card */}
                    <FlatList
                        data={stats}
                        renderItem={renderStatItem}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.statsList}
                    />

                    {/* About Section */}
                    <View style={styles.aboutSection}>
                        <Text style={styles.sectionTitle}>About Doctor</Text>
                        <Text style={styles.aboutText}>
                            Dr. Sarah Ahmed is a highly respected Cardiologist with over two decades of clinical experience. She specializes in advanced heart failure management and preventive...
                            <Text style={styles.readMore}> Read More</Text> 
                            {/* I should make the Read More functional. */}
                        </Text>
                    </View>

                    {/* Date Selection */}
                    <View style={styles.selectionSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Date</Text>
                            <Text style={styles.sectionSubtitle}>September 2023</Text>
                        </View>
                        <FlatList
                            data={dates}
                            renderItem={renderDateItem}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.datesList}
                        />
                    </View>

                    {/* Time Selection */}
                    <View style={styles.selectionSection}>
                        <Text style={styles.sectionTitle}>Time</Text>
                        <View style={styles.timeGrid}>
                            {timeSlots.map((slot) => (
                                <View key={slot.id} style={styles.timeGridItem}>
                                    {renderTimeSlot({ item: slot })}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={[styles.confirmButton, (!selectedDate || !selectedTime || loading) && {opacity: 0.7}]} 
                    onPress={handleConfirm}
                    disabled={!selectedDate || !selectedTime || loading}
                >
                    <Text style={styles.confirmButtonText}>
                        {loading ? "Booking..." : "Confirm Schedule"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fc",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        backgroundColor: "#3b5bdb",
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        paddingTop: 15,
        paddingBottom: 80,
        paddingHorizontal: 24,
    },
    topNav: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    doctorIdentity: {
        alignItems: "center",
    },
    doctorAvatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        borderWidth: 4,
        borderColor: "rgba(255,255,255,0.2)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    doctorInitials: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#3b5bdb",
    },
    doctorName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff",
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: 16,
        fontWeight: "500",
        color: "#e2e5ff",
        opacity: 0.9,
    },
    mainContent: {
        marginTop: -40,
        paddingHorizontal: 24,
    },
    statsList: {
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#dde1ff",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        minWidth: 100,
    },
    statValueContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0736ba",
        lineHeight: 22,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "#0736ba",
        opacity: 0.8,
    },
    aboutSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#191c1e",
        marginBottom: 8,
    },
    aboutText: {
        fontSize: 16,
        lineHeight: 26,
        color: "#444654",
    },
    readMore: {
        color: "#3b5bdb",
        fontWeight: "500",
    },
    selectionSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 12,
        fontWeight: "500",
        color: "#444654",
    },
    datesList: {
        gap: 12,
    },
    dateChip: {
        alignItems: "center",
        justifyContent: "center",
        minWidth: 64,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: "#ffffff",
    },
    activeDateChip: {
        backgroundColor: "#3b5bdb",
        shadowColor: "#3b5bdb",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 5,
    },
    dateDay: {
        fontSize: 12,
        fontWeight: "500",
        textTransform: "uppercase",
        color: "#444654",
        marginBottom: 4,
    },
    dateNumber: {
        fontSize: 18,
        fontWeight: "600",
        color: "#444654",
    },
    activeDateText: {
        color: "#ffffff",
    },
    timeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -6,
    },
    timeGridItem: {
        width: "33.33%",
        paddingHorizontal: 6,
        marginBottom: 12,
    },
    timeChip: {
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    activeTimeChip: {
        backgroundColor: "#3b5bdb",
        shadowColor: "#3b5bdb",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 4,
    },
    bookedTimeChip: {
        backgroundColor: "#f2f4f7",
    },
    timeText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#191c1e",
    },
    activeTimeText: {
        color: "#ffffff",
    },
    bookedTimeText: {
        color: "rgba(68, 70, 84, 0.4)",
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255,255,255,0.95)",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 50,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    confirmButton: {
        backgroundColor: "#3b5bdb",
        borderRadius: 9999,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#3b5bdb",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 6,
    },
    confirmButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default DoctorDetailsPage;