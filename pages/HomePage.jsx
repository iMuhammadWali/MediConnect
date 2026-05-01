import { View, Image, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

// TODO: Change all the icons in this page.
// Have to work on the navbar.

const HomePage = () => {
    const navigation = useNavigation();

    // This should be hardcoded.
    const services = [
        { id: 1, name: "Emergency", icon: "", color: "#ba1a1a", bgColor: "#ffdad6" },
        { id: 2, name: "Hospital", icon: "", color: "#00746a", bgColor: "#84f6e6" },
        { id: 3, name: "Blood", icon: "", color: "#00746a", bgColor: "#84f6e6" },
        { id: 4, name: "Prescription", icon: "", color: "#00746a", bgColor: "#84f6e6" },
        { id: 5, name: "Doctor", icon: "", color: "#ffffff", bgColor: "#3b5bdb", isActive: true },
        { id: 6, name: "Check Up", icon: "", color: "#00746a", bgColor: "#84f6e6" },
        { id: 7, name: "Location", icon: "", color: "#00746a", bgColor: "#84f6e6" },
        { id: 8, name: "Radiology", icon: "", color: "#00746a", bgColor: "#84f6e6" },
    ];

    // This should be loaded from firebase.
    const topSpecialists = [
        { id: 1, initials: "RK", name: "Dr. Rahul Kumar", specialty: "Neurologist", rating: 4.9, bgColor: "#dde1ff" },
        { id: 2, initials: "FP", name: "Dr. Fatima Patel", specialty: "Dermatologist", rating: 4.8, bgColor: "#dde1ff" },
        { id: 3, initials: "MJ", name: "Dr. Mark Jones", specialty: "Orthopedic", rating: 4.7, bgColor: "#b8c3ff" },
    ];

    // Navbar is consistent across screens so I should make a reusable component. 
    // TODO: use bottom react navigation to create a bottom nav bar.
    const navItems = [
        { id: 1, name: "Home", icon: "🏠", isActive: true },
        { id: 2, name: "Schedule", icon: "📅", isActive: false },
        { id: 3, name: "Doctors", icon: "👨‍⚕️", isActive: false },
        { id: 4, name: "Profile", icon: "👤", isActive: false },
    ];


    const renderServiceItem = ({ item }) => (
        <TouchableOpacity style={styles.serviceItem}>
            <View style={[
                styles.serviceIcon,
                { backgroundColor: item.isActive ? item.bgColor : item.bgColor },
                item.isActive && styles.activeServiceIcon
            ]}>
                <Text style={[styles.serviceIconText, { color: item.color }]}>{item.icon}</Text>
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
                <Text style={styles.ratingStar}>⭐</Text>
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
                {/* Top App Bar */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>A</Text>
                        </View>
                        <View>
                            <Text style={styles.greeting}>Good Morning</Text>
                            <Text style={styles.welcomeText}>Welcome Back, Ahmed</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <Text style={styles.notificationIcon}>🔔</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Section */}
                <View style={styles.searchSection}>
                    <View style={styles.searchContainer}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find doctor, clinic, or health issue"
                            placeholderTextColor="#747686"
                        />
                    </View>
                </View>

                {/* Service Grid Section */}
                <View style={styles.servicesSection}>
                    <Text style={styles.sectionTitle}>Our Services</Text>
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
                                <View style={styles.videoBadge}>
                                    <Text style={styles.videoIcon}>📹</Text>
                                    <Text style={styles.videoText}>Video</Text>
                                </View>
                            </View>
                            <View style={styles.appointmentDetails}>
                                <View style={styles.appointmentDetail}>
                                    <Text style={styles.detailIcon}>📅</Text>
                                    <Text style={styles.detailText}>Oct 24, 2023</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.appointmentDetail}>
                                    <Text style={styles.detailIcon}>⏰</Text>
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
        fontSize: 20,
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
        borderRadius: 24,
        padding: 20,
        shadowColor: "#3b5bdb",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 4,
        borderWidth: 1,
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
    videoBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#84f6e6",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9999,
        gap: 4,
        marginLeft: "auto",
    },
    videoIcon: {
        fontSize: 14,
    },
    videoText: {
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
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.03,
        shadowRadius: 16,
        elevation: 2,
        borderWidth: 1,
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
    ratingStar: {
        fontSize: 12,
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