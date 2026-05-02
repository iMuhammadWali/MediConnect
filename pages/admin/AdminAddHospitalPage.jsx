import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ref, push, set } from "firebase/database";
import { database } from "../../config/firebase";
import { FormInput } from "../../components/FormInput";

const AdminAddHospitalPage = () => {
    const navigation = useNavigation();
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!name || !address || !phone) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            const newRef = push(ref(database, "hospitals"));
            await set(newRef, {
                name,
                address,
                phone,
                createdAt: new Date().toISOString()
            });
            Alert.alert("Success", "Hospital added successfully!");
            navigation.goBack();
        } catch (e) {
            Alert.alert("Error", e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={22} color="#ffffff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add Hospital</Text>
                </View>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.card}>
                        <FormInput label="Hospital Name" icon="business-outline" placeholder="Enter name" value={name} onChangeText={setName} required />
                        <FormInput label="Address" icon="location-outline" placeholder="Enter full address" value={address} onChangeText={setAddress} required multiline />
                        <FormInput label="Phone Number" icon="call-outline" placeholder="Enter phone number" value={phone} onChangeText={setPhone} required keyboardType="phone-pad" />
                        
                        <TouchableOpacity style={styles.saveButton} onPress={handleAdd} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Add Hospital</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    content: { padding: 20 },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 20,
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    saveButton: {
        backgroundColor: "#1a40c2",
        borderRadius: 9999,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 16,
        elevation: 3,
    },
    saveButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
});

export default AdminAddHospitalPage;
