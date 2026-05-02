import { View, Image, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
    
import {Ionicons} from "@expo/vector-icons"
import { useEffect, useState } from "react";
import { subscribe } from "firebase/data-connect";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
// TODO: Change all the icons in this page.
// Have to work on the navbar.

const HomePage = () => {
    const navigation = useNavigation();
    const [displayName, setDisplayName] = useState(null);

    // This should be hardcoded.
    const services = [
        // Need to add appropriate background colors here as well.
        { id: 1, name: "Emergency", icon: "warning", screen: "Emergency" },
        { id: 2, name: "Hospital", icon: "business", screen: "Hospitals" },
        { id: 3, name: "Blood", icon: "water", screen: "BloodBank" },
        { id: 4, name: "Prescription", icon: "document-text", screen: "Prescriptions" },
        { id: 5, name: "Doctor", icon: "medkit", screen: "FindDoctors" },
        { id: 6, name: "Check Up", icon: "heart", screen: "CheckUp" },
        { id: 7, name: "Location", icon: "location", screen: "Locations" },
        { id: 8, name: "Radiology", icon: "scan", screen: "Radiology" },
    ];

    // This should be loaded from firebase.
    const topSpecialists = [
        { id: 1, initials: "RK", name: "Dr. Rahul Kumar", specialty: "Neurologist", rating: 4.9, bgColor: "#dde1ff" },
        { id: 2, initials: "FP", name: "Dr. Fatima Patel", specialty: "Dermatologist", rating: 4.8, bgColor: "#dde1ff" },
        { id: 3, initials: "MJ", name: "Dr. Mark Jones", specialty: "Orthopedic", rating: 4.7, bgColor: "#b8c3ff" },
    ];

    const handleServicePress = (screenName) => {
        navigation.navigate(screenName);
    };

    useEffect(()=>{
        const subscriber = onAuthStateChanged(auth, (user) => {
            setDisplayName(user? user.displayName: "User");
        }); 
        return subscriber;
    }, []);

    const renderServiceItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.serviceItem}
            onPress={() => handleServicePress(item.screen)}>
            <View style={[
                styles.serviceIcon,
                item.isActive && styles.activeServiceIcon
            ]}>
                <Ionicons 
                    name={item.icon} 
                    size={28} 
                    color={"#4767e6"} 
                />
            </View>
            <Text style={[
                styles.serviceName,
                item.isActive && styles.activeServiceName
            ]}>{item.name}</Text>
        </TouchableOpacity>
    );
    const renderSpecialistCard = ({ item }) => (
        <View style={styles.specialistCard}>
            <View style={[styles.specialistAvatar, { backgroundColor: item.bgColor }]}>
                <Text style={styles.specialistInitials}>{item.initials}</Text>
            </View>
            <Text style={styles.specialistName}>{item.name}</Text>
            <Text style={styles.specialistSpecialty}>{item.specialty}</Text>
            <View style={styles.ratingContainer}>
                <Ionicons name="star" color="#06402b"></Ionicons>
                <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <TouchableOpacity style={styles.viewProfileButton}>
                <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
        </View>
    );


    return (
        <SafeAreaView style={styles.container} edges={['top']}>            
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

                {/* Top Bar for home page. */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>A</Text>
                        </View>
                        <View>
                            <Text style={styles.greeting}>Good Morning</Text>
                            <Text style={styles.welcomeText}>Welcome Back
                            </Text>
                            <Text style={styles.welcomeText}>{displayName}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Ionicons style={styles.notificationIcon} name="notifications" size={24}></Ionicons>
                    </TouchableOpacity>
                </View>

                {/* Search Section */}
                <View style={styles.searchSection}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search-outline" size={24}></Ionicons>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find doctor, clinic, or health issue"
                            placeholderTextColor="#747686"
                        />
                    </View>
                </View>

                {/* Service Grid Section */}
                <View style={styles.servicesSection}>
                    <Text style={styles.sectionTitle}>Services</Text>
                    <FlatList
                        data={services}
                        renderItem={renderServiceItem}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={4}
                        scrollEnabled={false}
                        contentContainerStyle={styles.servicesGrid}
                    />
                </View>

                {/* Schedule Today Section */}
                <View style={styles.scheduleSection}>
                    <View style={styles.scheduleHeader}>
                        <Text style={styles.sectionTitle}>Schedule Today</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.scheduleCard}>
                        <View style={styles.scheduleCardContent}>
                            <View style={styles.doctorInfo}>
                                <View style={styles.doctorAvatar}>
                                    <Text style={styles.doctorAvatarText}>SA</Text>
                                </View>
                                <View>
                                    <Text style={styles.doctorName}>Dr. Sarah Ahmed</Text>
                                    <Text style={styles.doctorSpecialty}>Cardiologist</Text>
                                </View>
                                <View style={styles.confirmedBadge}>
                                    <Text style={styles.confirmedText}>Confirmed</Text>
                                </View>
                            </View>
                            <View style={styles.appointmentDetails}>
                                <View style={styles.appointmentDetail}>
                                    <Ionicons name="calendar" size={20}></Ionicons>
                                    <Text style={styles.detailText}>Oct 24, 2023</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.appointmentDetail}>
                                    <Ionicons name="time" size={20}></Ionicons>
                                    <Text style={styles.detailText}>10:30 AM</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Top Specialists Section */}
                <View style={styles.specialistsSection}>
                    <Text style={styles.sectionTitle}>Top Specialists</Text>
                    <FlatList
                        data={topSpecialists}
                        renderItem={renderSpecialistCard}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.specialistsList}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );

};


// The rest is just the styling that I wont be working on and AI will work on it. Easy.
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fc",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1a40c2",
        marginHorizontal: -24,
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginTop: -8,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#dde1ff",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#001355",
    },
    greeting: {
        color: "#a5b4fc",
        fontSize: 12,
        fontWeight: "500",
    },
    welcomeText: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "bold",
    },
    notificationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    notificationIcon: {
        color: 'white'
    },
    searchSection: {
        marginTop: 24,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e6e8eb",
        borderRadius: 9999,
        paddingHorizontal: 16,
    },
    searchIcon: {
        fontSize: 20,
        color: "#747686",
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        fontWeight: "500",
        color: "#191c1e",
    },
    servicesSection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#191c1e",
        marginBottom: 16,
    },
    servicesGrid: {
        gap: 24,
    },
    serviceItem: {
        flex: 1,
        alignItems: "center",
        gap: 8,
    },
    serviceIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    activeServiceIcon: {
        shadowColor: "#3b5bdb",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 4,
    },
    serviceIconText: {
        fontSize: 28,
    },
    serviceName: {
        fontSize: 12,
        fontWeight: "500",
        color: "#444654",
        textAlign: "center",
    },
    activeServiceName: {
        fontWeight: "bold",
        color: "#3b5bdb",
    },
    scheduleSection: {
        marginTop: 24,
    },
    scheduleHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 16,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#3b5bdb",
    },
    scheduleCard: {
        backgroundColor: "#ffffff",
        borderRadius: 8,
        padding: 20,
        shadowColor: "#3b5bdb",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        borderWidth: 0.2,
        borderColor: "#c4c5d6",
        overflow: "hidden",
    },
    scheduleCardContent: {
        position: "relative",
        zIndex: 1,
    },
    doctorInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 16,
    },
    doctorAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#b8c3ff",
        alignItems: "center",
        justifyContent: "center",
    },
    doctorAvatarText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#001355",
    },
    doctorName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#191c1e",
    },
    doctorSpecialty: {
        fontSize: 14,
        fontWeight: "500",
        color: "#444654",
    },
    confirmedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#84f6e6",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
        gap: 4,
        marginLeft: "auto",
    },
    confirmedText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#005951",
    },
    appointmentDetails: {
        flexDirection: "row",
        backgroundColor: "#f2f4f7",
        borderRadius: 16,
        padding: 16,
        justifyContent: "space-between",
    },
    appointmentDetail: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailIcon: {
        fontSize: 20,
        color: "#3b5bdb",
    },
    detailText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#444654",
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: "#c4c5d6",
    },
    specialistsSection: {
        marginTop: 24,
        marginBottom: 24,
    },
    specialistsList: {
        gap: 16,
        paddingRight: 24,
    },
    specialistCard: {
        minWidth: 180,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.03,
        shadowRadius: 16,
        borderWidth: 0.3,
        borderColor: "#c4c5d6",
        alignItems: "center",
    },
    specialistAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    specialistInitials: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#001355",
    },
    specialistName: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#191c1e",
        marginBottom: 4,
        textAlign: "center",
    },
    specialistSpecialty: {
        fontSize: 12,
        fontWeight: "500",
        color: "#444654",
        marginBottom: 16,
        textAlign: "center",
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#84f6e6",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 16,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#005951",
    },
    viewProfileButton: {
        width: "100%",
        backgroundColor: "#3b5bdb",
        paddingVertical: 8,
        borderRadius: 9999,
        alignItems: "center",
    },
    viewProfileText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#ffffff",
    },
    bottomNav: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.03,
        shadowRadius: 20,
        elevation: 8,
        paddingBottom: 8,
    },
    navContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 24,
    },
    navItem: {
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    activeNavItem: {
        backgroundColor: "#eef2ff",
        borderRadius: 9999,
    },
    navIcon: {
        fontSize: 24,
        color: "#94a3b8",
    },
    activeNavIcon: {
        color: "#4338ca",
    },
    navLabel: {
        fontSize: 10,
        fontWeight: "500",
        marginTop: 4,
        letterSpacing: 0.5,
        color: "#94a3b8",
    },
    activeNavLabel: {
        color: "#4338ca",
    },
});

export default HomePage;