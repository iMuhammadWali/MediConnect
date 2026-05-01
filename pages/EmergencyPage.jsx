import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

const EmergencyPage = () => {
    const navigation = useNavigation();

    const handleCall = (number, serviceName) => {
        Alert.alert(
            `Call ${serviceName}`,
            `Are you sure you want to call ${serviceName} at ${number}?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Call", 
                    onPress: () => {
                        Linking.openURL(`tel:${number}`);
                    }
                }
            ]
        );
    };

    const handleShareLocation = () => {
        Alert.alert(
            "Share Location",
            "This will share your current GPS location with emergency contacts",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Share", onPress: () => {
                    // Implement location sharing logic here
                    Alert.alert("Success", "Location shared with emergency contacts");
                }}
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                
                {/* Contextual Header */}
                <View style={styles.contextHeader}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="warning" size={24} color="#ffffff" />
                        <Text style={styles.headerTitle}>Emergency Services</Text>
                    </View>
                    <Text style={styles.headerSubtitle}>
                        Quick access to life-saving services in your area.
                    </Text>
                </View>

                {/* Primary Emergency Action - Ambulance */}
                <TouchableOpacity 
                    style={styles.ambulanceButton}
                    onPress={() => handleCall("115", "Ambulance")}
                    activeOpacity={0.8}>
                    <View style={styles.ambulanceButtonLeft}>
                        <Ionicons name="medkit" size="call" size={32} color="#ffffff" />
                        <Text style={styles.ambulanceButtonText}>Call Ambulance</Text>
                    </View>
                    <Text style={styles.ambulanceNumber}>115</Text>
                </TouchableOpacity>

                {/* Secondary Emergency Services */}
                <View style={styles.servicesContainer}>
                    {/* Police */}
                    <View style={styles.serviceCard}>
                        <View style={styles.serviceInfo}>
                            <View style={styles.serviceIconContainer}>
                                <Ionicons name="shield" size={24} color="#1a40c2" />
                            </View>
                            <View>
                                <Text style={styles.serviceName}>Police</Text>
                                <Text style={styles.serviceNumber}>110</Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.callButton}
                            onPress={() => handleCall("110", "Police")}>
                            <Ionicons name="call" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    {/* Fire Brigade */}
                    <View style={styles.serviceCard}>
                        <View style={styles.serviceInfo}>
                            <View style={styles.serviceIconContainer}>
                                <Ionicons name="flame" size={24} color="#1a40c2" />
                            </View>
                            <View>
                                <Text style={styles.serviceName}>Fire Brigade</Text>
                                <Text style={styles.serviceNumber}>113</Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.callButton}
                            onPress={() => handleCall("113", "Fire Brigade")}>
                            <Ionicons name="call" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>

                    {/* Poison Control */}
                    <View style={styles.serviceCard}>
                        <View style={styles.serviceInfo}>
                            <View style={styles.serviceIconContainer}>
                                <Ionicons name="medical" size={24} color="#1a40c2" />
                            </View>
                            <View>
                                <Text style={styles.serviceName}>Poison Control</Text>
                                <Text style={styles.serviceNumber}>119</Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.callButton}
                            onPress={() => handleCall("119", "Poison Control")}>
                            <Ionicons name="call" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Share Location Section */}
                <TouchableOpacity 
                    style={styles.locationCard}
                    onPress={handleShareLocation}
                    activeOpacity={0.7}>
                    <View style={styles.locationIconContainer}>
                        <Ionicons name="location" size={32} color="#ffffff" />
                    </View>
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationTitle}>Share My Location</Text>
                        <Text style={styles.locationSubtitle}>
                            Send your GPS to emergency contact
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>

                {/* Map Snippet */}
                <View style={styles.mapContainer}>
                    <Image 
                        source={{ 
                            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBncJWcMi-FuIob_6WSnRkFwk1IdbN0rwXB4KfaBsdpdfywHSq2Tc30v80kMTGWBm8Cakj2bCh-VqvdhxmgkgJ9RXkh7VnzCb027gHqQ6qtDDqx4qlt_CxUOor-zDUDqsOBgfBFWYRSCMRrQa5GlJtlHVrbQM9vxZ7xnwN2dvcPeUqSbqWiA9aNvkr-A-F5jcQTNGSuoqZsrVL23nam9mkkIGPByJUBBzs_BCyw0o8p2mMoSygm55K5eS66LzCgfGQ5fweL1-f-R_Vl"
                        }}
                        style={styles.mapImage}
                        blurRadius={2}
                    />
                    <View style={styles.mapOverlay}>
                        <View style={styles.locationBadge}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.locationText}>Current: Jinnah Ave, Karachi</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 32,
    },
    contextHeader: {
        backgroundColor: "#3b5bdb",
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.06,
        shadowRadius: 24,
        elevation: 4,
    },
    headerIconContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
    },
    headerTitle: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        color: "#e2e5ff",
        fontSize: 14,
        opacity: 0.9,
        lineHeight: 20,
    },
    ambulanceButton: {
        backgroundColor: "#E74C3C",
        borderRadius: 9999,
        paddingVertical: 24,
        paddingHorizontal: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 40,
        shadowColor: "#E74C3C",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    ambulanceButtonLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    ambulanceButtonText: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "bold",
    },
    ambulanceNumber: {
        color: "#ffffff",
        fontSize: 24,
        fontWeight: "900",
    },
    servicesContainer: {
        gap: 16,
        marginBottom: 40,
    },
    serviceCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    serviceInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    serviceIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#e6e8eb",
        alignItems: "center",
        justifyContent: "center",
    },
    serviceName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#191c1e",
    },
    serviceNumber: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a40c2",
        marginTop: 4,
    },
    callButton: {
        backgroundColor: "#1a40c2",
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    locationCard: {
        backgroundColor: "#496ae8",
        borderRadius: 16,
        padding: 24,
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        marginBottom: 32,
        shadowColor: "#496ae8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    locationIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    locationInfo: {
        flex: 1,
    },
    locationTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
    },
    locationSubtitle: {
        color: "#e2e5ff",
        fontSize: 14,
        marginTop: 4,
    },
    mapContainer: {
        borderRadius: 16,
        overflow: "hidden",
        height: 160,
        backgroundColor: "#eceef1",
        position: "relative",
    },
    mapImage: {
        width: "100%",
        height: "100%",
        opacity: 0.6,
    },
    mapOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    locationBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.9)",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    pulseDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#1a40c2",
    },
    locationText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#191c1e",
    },
});

export default EmergencyPage;