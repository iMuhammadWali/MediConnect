import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { ref, get, update } from "firebase/database";
import { database } from "../config/firebase";

const AdminApprovalsPage = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState("pending");
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [rejectedDoctors, setRejectedDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const doctorsRef = ref(database, 'doctors');
            const snapshot = await get(doctorsRef);
            
            if (snapshot.exists()) {
                const pending = [];
                const rejected = [];
                
                snapshot.forEach((childSnapshot) => {
                    const doctor = childSnapshot.val();
                    if (!doctor.isVerified) {
                        pending.push({
                            id: childSnapshot.key,
                            ...doctor
                        });
                    } else if (doctor.isVerified === false && doctor.rejected) {
                        rejected.push({
                            id: childSnapshot.key,
                            ...doctor
                        });
                    }
                });
                
                setPendingDoctors(pending);
                setRejectedDoctors(rejected);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (doctorId) => {
        Alert.alert(
            "Approve Doctor",
            "Are you sure you want to approve this doctor?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Approve",
                    onPress: async () => {
                        try {
                            const doctorRef = ref(database, `doctors/${doctorId}`);
                            await update(doctorRef, {
                                isVerified: true,
                                verifiedAt: new Date().toISOString()
                            });
                            
                            // Remove from pending list
                            setPendingDoctors(pendingDoctors.filter(d => d.id !== doctorId));
                            Alert.alert("Success", "Doctor approved successfully");
                        } catch (error) {
                            Alert.alert("Error", "Failed to approve doctor");
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (doctorId) => {
        Alert.alert(
            "Reject Doctor",
            "Are you sure you want to reject this doctor?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reject",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const doctorRef = ref(database, `doctors/${doctorId}`);
                            await update(doctorRef, {
                                isVerified: false,
                                rejected: true,
                                rejectedAt: new Date().toISOString()
                            });
                            
                            // Move to rejected list
                            const rejectedDoctor = pendingDoctors.find(d => d.id === doctorId);
                            setPendingDoctors(pendingDoctors.filter(d => d.id !== doctorId));
                            if (rejectedDoctor) {
                                setRejectedDoctors([...rejectedDoctors, { ...rejectedDoctor, rejected: true }]);
                            }
                            Alert.alert("Success", "Doctor rejected");
                        } catch (error) {
                            Alert.alert("Error", "Failed to reject doctor");
                        }
                    }
                }
            ]
        );
    };

    const getInitials = (fullName) => {
        if (!fullName) return "DR";
        const names = fullName.split(" ");
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const renderDoctorCard = ({ item }) => (
        <View style={styles.doctorCard}>
            <View style={styles.cardHeader}>
                <View style={styles.doctorAvatar}>
                    {item.photoURL ? (
                        <Image source={{ uri: item.photoURL }} style={styles.avatarImage} />
                    ) : (
                        <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
                    )}
                </View>
                <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{item.fullName}</Text>
                    <Text style={styles.doctorSpecialty}>{item.primarySpecialization || "Doctor"}</Text>
                    <Text style={styles.hospitalName}>{item.hospitalAffiliation}</Text>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity 
                    style={styles.approveButton} 
                    onPress={() => handleApprove(item.id)}>
                    <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.rejectButton} 
                    onPress={() => handleReject(item.id)}>
                    <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const currentData = activeTab === "pending" ? pendingDoctors : rejectedDoctors;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                
                {/* Top Bar */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.openDrawer()}>
                            <Ionicons name="menu-outline" size={24} color="#ffffff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Approvals</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{pendingDoctors.length}</Text>
                        </View>
                    </View>
                    <View style={styles.adminAvatar}>
                        <Text style={styles.adminInitials}>AD</Text>
                    </View>
                </View>

                {/* Segmented Control */}
                <View style={styles.segmentedControl}>
                    <TouchableOpacity 
                        style={[styles.segment, activeTab === "pending" && styles.activeSegment]}
                        onPress={() => setActiveTab("pending")}>
                        <Text style={[styles.segmentText, activeTab === "pending" && styles.activeSegmentText]}>
                            Pending
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.segment, activeTab === "rejected" && styles.activeSegment]}
                        onPress={() => setActiveTab("rejected")}>
                        <Text style={[styles.segmentText, activeTab === "rejected" && styles.activeSegmentText]}>
                            Rejected
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Doctor List */}
                {currentData.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-done-circle-outline" size={64} color="#c4c5d6" />
                        <Text style={styles.emptyText}>
                            {activeTab === "pending" ? "No pending approvals" : "No rejected doctors"}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {activeTab === "pending" 
                                ? "All doctors have been verified" 
                                : "No rejected applications to show"}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={currentData}
                        renderItem={renderDoctorCard}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        contentContainerStyle={styles.doctorsList}
                    />
                )}
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
        paddingBottom: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1a40c2",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffff",
    },
    badge: {
        backgroundColor: "#ffffff",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 9999,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#1a40c2",
    },
    adminAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#dde1ff",
        alignItems: "center",
        justifyContent: "center",
    },
    adminInitials: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#001355",
    },
    segmentedControl: {
        flexDirection: "row",
        backgroundColor: "#e6e8eb",
        borderRadius: 9999,
        padding: 4,
        marginHorizontal: 20,
        marginTop: 24,
        marginBottom: 24,
    },
    segment: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 9999,
        alignItems: "center",
    },
    activeSegment: {
        backgroundColor: "#1a40c2",
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#444654",
    },
    activeSegmentText: {
        color: "#ffffff",
        fontWeight: "bold",
    },
    doctorsList: {
        paddingHorizontal: 20,
        gap: 16,
    },
    doctorCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 16,
    },
    doctorAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#E6F1FB",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0C447C",
    },
    doctorInfo: {
        flex: 1,
        justifyContent: "center",
    },
    doctorName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#191c1e",
        marginBottom: 2,
    },
    doctorSpecialty: {
        fontSize: 14,
        color: "#444654",
        marginBottom: 2,
    },
    hospitalName: {
        fontSize: 13,
        fontWeight: "600",
        color: "#00746a",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
    },
    approveButton: {
        flex: 1,
        backgroundColor: "#10b981",
        paddingVertical: 12,
        borderRadius: 9999,
        alignItems: "center",
    },
    approveButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "bold",
    },
    rejectButton: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: "#ba1a1a",
        paddingVertical: 12,
        borderRadius: 9999,
        alignItems: "center",
        backgroundColor: "transparent",
    },
    rejectButtonText: {
        color: "#ba1a1a",
        fontSize: 14,
        fontWeight: "bold",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#191c1e",
        marginTop: 16,
        textAlign: "center",
    },
    emptySubtext: {
        fontSize: 14,
        color: "#747686",
        marginTop: 8,
        textAlign: "center",
    },
});

export default AdminApprovalsPage;