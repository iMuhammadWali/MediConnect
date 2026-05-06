import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, ToastAndroid, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { use, useEffect, useState } from "react";
import { database } from "../../config/firebase";
import { get, ref } from "firebase/database";

const FindDoctorsPage = () => {
    const navigation = useNavigation();

    const filterCategories = [
        { id: 1, name: "All", isActive: true },
        { id: 2, name: "General", isActive: false },
        { id: 3, name: "Radiology", isActive: false },
        { id: 4, name: "Dentistry", isActive: false },
        { id: 5, name: "ENT", isActive: false },
        { id: 6, name: "Ophthalmology", isActive: false },
    ];

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        fetchDoctors();
    }, []);

    // SO FUN to know how are filters applied. I think it is legit just array.filter though.
    const getInitials = (fullName) => {
        if (!fullName) return "DR";
        const names = fullName.split(" ");
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const getBgColor = (specialty) => {
        const colors = {
            "Cardiologist": "#3b5bdb",
            "Neurologist": "#00746a",
            "Pediatrician": "#496ae8",
            "Dermatologist": "#ba1a1a",
            "Orthopedic": "#ff8c00",
        };
        return colors[specialty] || "#dde1ff";
    };

    const fetchDoctors = async () =>{
        setLoading(true);
        try{
            const doctorsRef = ref(database, `doctors`);
            const snapshot = await get(doctorsRef);
            
            if (snapshot.exists()){
                const doctorsList = [];
                snapshot.forEach((childSnapshot)=>{
                    const doctor = childSnapshot.val();
                    if (!doctor.isVerified) return;
                    doctorsList.push({
                        id:childSnapshot.key,
                        initials: getInitials(doctor.fullName),
                        name: doctor.fullName,
                        primarySpecialization: doctor.primarySpecialization,
                        hospitalAffiliation: doctor.hospitalAffiliation,
                        rating: doctor.rating,
                        bgColor: getBgColor(doctor.primarySpecialization),
                        textColor: "#ffffff",
                    });
                });
                setDoctors(doctorsList);
            }
        } catch(e){
            console.error("Error fetching doctors:", e);
            ToastAndroid.show("Error", ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    }
    // Now I need to see here how to fetch doctors

    const renderFilterChip = ({ item }) => (
        <TouchableOpacity style={[
            styles.filterChip,
            item.isActive && styles.activeFilterChip
        ]}>
            <Text style={[
                styles.filterChipText,
                item.isActive && styles.activeFilterChipText
            ]}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderDoctorCard = ({ item }) => (
        <View style={styles.doctorCard}>
            <View style={[styles.doctorAvatar, { backgroundColor: item.bgColor }]}>
                <Text style={[styles.doctorInitials, { color: item.textColor }]}>{item.initials}</Text>
            </View>
            <View style={styles.doctorInfo}>
                <Text style={styles.doctorName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.doctorDetails} numberOfLines={1}>
                    {item.primarySpecialization}
                </Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#F39C12" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
                </View>
            </View>
            <TouchableOpacity 
                onPress={() => navigation.navigate("DoctorDetails", { doctorId: item.id })}            
                style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
        </View>
    );
    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}>
                    
                    {/* Search Input */}
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#747686" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search doctors, hospitals..."
                            placeholderTextColor="#747686"
                        />
                    </View>

                    {/* Filters */}
                    <FlatList
                        data={filterCategories}
                        renderItem={renderFilterChip}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersList}
                    />

                    {/* Doctor List */}
                    <View style={styles.doctorsSection}>
                        <FlatList
                            data={doctors}
                            renderItem={renderDoctorCard}
                            keyExtractor={(item) => item.id.toString()}
                            scrollEnabled={false}
                            contentContainerStyle={styles.doctorsList}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fc",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: "#f7f9fc",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#3B5BDB",
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#b8c3ff",
        alignItems: "center",
        justifyContent: "center",
    },
    userInitials: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#001355",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e6e8eb",
        borderRadius: 9999,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        fontWeight: "500",
        color: "#191c1e",
    },
    filtersList: {
        marginBottom: 24,
        gap: 12,
    },
    filterChip: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 9999,
        backgroundColor: "#ffffff",
        marginRight: 12,
    },
    activeFilterChip: {
        backgroundColor: "#3B5BDB",
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 2,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#444654",
    },
    activeFilterChipText: {
        color: "#ffffff",
    },
    doctorsSection: {
        flex: 1,
    },
    doctorsList: {
        gap: 16,
    },
    doctorCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        padding: 16,
        borderWidth: 0.3,
        borderColor: "#c4c5d6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 16,
    },
    doctorAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    doctorInitials: {
        fontSize: 18,
        fontWeight: "bold",
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#191c1e",
        marginBottom: 4,
    },
    doctorDetails: {
        fontSize: 14,
        color: "#444654",
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#444654",
    },
    reviewsText: {
        fontSize: 12,
        color: "#747686",
        marginLeft: 2,
    },
    bookButton: {
        backgroundColor: "#3B5BDB",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 9999,
        shadowColor: "#3b5bdb",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 4,
    },
    bookButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
    },
});

export default FindDoctorsPage;