import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const ComingSoonPage = ({ title, icon }) => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <View style={styles.content}>
                <Ionicons name={icon} size={80} color="#c4c5d6" />
                <Text style={styles.title}>Coming Soon</Text>
                <Text style={styles.subtitle}>We are working hard to bring this feature to you.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        backgroundColor: "#1a40c2",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
    content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, gap: 12 },
    title: { fontSize: 24, fontWeight: "bold", color: "#191c1e" },
    subtitle: { fontSize: 14, color: "#717273", textAlign: "center" }
});

export const BloodBankPage = () => <ComingSoonPage title="Blood Bank" icon="water-outline" />;
export const PrescriptionPage = () => <ComingSoonPage title="Prescriptions" icon="document-text-outline" />;
export const CheckUpPage = () => <ComingSoonPage title="Check Up" icon="heart-outline" />;
