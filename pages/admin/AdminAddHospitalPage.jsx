import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput, FlatList } from "react-native";
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
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // OSM Search States
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const searchOSM = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            setSearchResults(data);
        } catch (e) {
            Alert.alert("Error", "Failed to search location");
        } finally {
            setSearching(false);
        }
    };

    const handleAdd = async () => {
        if (!name || !address || !phone) {
            Alert.alert("Error", "Please fill all fields and select a valid address from the search.");
            return;
        }
        setLoading(true);
        try {
            const newRef = push(ref(database, "hospitals"));
            await set(newRef, {
                name,
                address,
                phone,
                latitude,
                longitude,
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
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.card}>
                        <FormInput label="Hospital Name" icon="business-outline" placeholder="Enter name" value={name} onChangeText={setName} required />
                        
                        <Text style={styles.label}>Location / Address <Text style={styles.required}>*</Text></Text>
                        <View style={styles.searchBox}>
                            <Ionicons name="location-outline" size={20} color="#1a40c2" style={styles.searchIcon} />
                            <TextInput 
                                style={styles.searchInput}
                                placeholder="Search on OpenStreetMap..."
                                placeholderTextColor="#747686"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={searchOSM}
                            />
                            <TouchableOpacity onPress={searchOSM} style={styles.searchBtn}>
                                {searching ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="search" size={18} color="#fff" />}
                            </TouchableOpacity>
                        </View>
                        
                        {searchResults.length > 0 && (
                            <View style={styles.resultsContainer}>
                                {searchResults.slice(0, 5).map((item, index) => (
                                    <TouchableOpacity 
                                        key={index} 
                                        style={styles.resultItem}
                                        onPress={() => {
                                            setAddress(item.display_name);
                                            setLatitude(item.lat);
                                            setLongitude(item.lon);
                                            setSearchResults([]);
                                            setSearchQuery("");
                                        }}
                                    >
                                        <Ionicons name="location" size={16} color="#747686" style={{marginTop: 2}} />
                                        <Text style={styles.resultText}>{item.display_name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        
                        {address ? (
                            <View style={styles.selectedAddress}>
                                <Text style={styles.selectedAddressText} numberOfLines={2}>{address}</Text>
                                <TouchableOpacity onPress={() => {setAddress(""); setLatitude(null); setLongitude(null);}}>
                                    <Ionicons name="close-circle" size={20} color="#E74C3C" />
                                </TouchableOpacity>
                            </View>
                        ) : null}

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
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#191c1e",
        marginBottom: 8,
        marginTop: 12,
    },
    required: {
        color: "#E74C3C",
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f2f4f7",
        borderRadius: 12,
        paddingLeft: 16,
        paddingRight: 4,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: "rgba(196, 197, 214, 0.3)",
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#191c1e',
        fontSize: 14,
    },
    searchBtn: {
        backgroundColor: "#1a40c2",
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    resultsContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginTop: 4,
        borderWidth: 1,
        borderColor: "rgba(196, 197, 214, 0.3)",
        elevation: 2,
        overflow: 'hidden',
    },
    resultItem: {
        flexDirection: "row",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f2f4f7",
        gap: 8,
    },
    resultText: {
        fontSize: 13,
        color: "#444654",
        flex: 1,
    },
    selectedAddress: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e6f1fb",
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        justifyContent: "space-between",
    },
    selectedAddressText: {
        fontSize: 13,
        color: "#0c447c",
        flex: 1,
        marginRight: 8,
    }
});

export default AdminAddHospitalPage;
