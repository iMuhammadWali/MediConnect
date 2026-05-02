// components/DoctorCard.js
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export const DoctorCard = ({ 
    initials, 
    name, 
    specialty, 
    rating, 
    bgColor = "#dde1ff",
    onPress 
}) => {
    return (
        <View style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: bgColor }]}>
                <Text style={styles.initials}>{initials}</Text>
            </View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.specialty}>{specialty}</Text>
            <View style={styles.ratingContainer}>
                <Ionicons name="star" size={12} color="#06402b" />
                <Text style={styles.ratingText}>{rating}</Text>
            </View>
            <TouchableOpacity style={styles.viewButton} onPress={onPress}>
                <Text style={styles.viewButtonText}>View Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
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
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    initials: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#001355",
    },
    name: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#191c1e",
        marginBottom: 4,
        textAlign: "center",
    },
    specialty: {
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
    viewButton: {
        width: "100%",
        backgroundColor: "#3b5bdb",
        paddingVertical: 8,
        borderRadius: 9999,
        alignItems: "center",
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#ffffff",
    },
});