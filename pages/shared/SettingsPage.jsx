import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { signOut } from "firebase/auth";
import { auth, database } from "../../config/firebase";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";

const SettingsPage = () => {
    const navigation = useNavigation();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const userRef = ref(database, `users/${uid}`);
        const unsub = onValue(userRef, snapshot => {
            if (snapshot.exists()) {
                setUserData(snapshot.val());
            }
        });
        return unsub;
    }, []);

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut(auth);
                        } catch (error) {
                            Alert.alert("Error", error.message);
                        }
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, subtitle, onPress, type = "arrow", value, onValueChange, danger }) => (
        <TouchableOpacity 
            style={styles.settingItem} 
            onPress={onPress}
            activeOpacity={type === "switch" ? 1 : 0.7}
            disabled={type === "switch"}
        >
            <View style={[styles.iconContainer, danger && styles.dangerIconContainer]}>
                <Ionicons name={icon} size={20} color={danger ? "#ba1a1a" : "#1a40c2"} />
            </View>
            <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {type === "arrow" && <Ionicons name="chevron-forward" size={20} color="#c4c5d6" />}
            {type === "switch" && (
                <Switch
                    trackColor={{ false: "#e6e8eb", true: "#dde1ff" }}
                    thumbColor={value ? "#1a40c2" : "#f4f3f4"}
                    onValueChange={onValueChange}
                    value={value}
                />
            )}
        </TouchableOpacity>
    );

    const SettingsSection = ({ title, children }) => (
        <View style={styles.section}>
            {title && <Text style={styles.sectionTitle}>{title}</Text>}
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {userData?.fullName ? userData.fullName.substring(0, 2).toUpperCase() : "US"}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{userData?.fullName || "User"}</Text>
                        <Text style={styles.profileEmail}>{userData?.email || auth.currentUser?.email}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{userData?.role?.toUpperCase() || "PATIENT"}</Text>
                        </View>
                    </View>
                </View>

                {/* Account Settings */}
                <SettingsSection title="Account">
                    <SettingItem 
                        icon="person-outline" 
                        title="Personal Information" 
                        onPress={() => Alert.alert("Coming Soon", "Edit profile will be available soon.")} 
                    />
                    <SettingItem 
                        icon="lock-closed-outline" 
                        title="Security & Password" 
                        onPress={() => Alert.alert("Coming Soon", "Password management will be available soon.")} 
                    />
                </SettingsSection>

                {/* Preferences */}
                <SettingsSection title="Preferences">
                    <SettingItem 
                        icon="notifications-outline" 
                        title="Push Notifications" 
                        type="switch"
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                    />
                    <SettingItem 
                        icon="moon-outline" 
                        title="Dark Mode" 
                        type="switch"
                        value={darkModeEnabled}
                        onValueChange={setDarkModeEnabled}
                    />
                    <SettingItem 
                        icon="language-outline" 
                        title="Language" 
                        subtitle="English (US)"
                        onPress={() => Alert.alert("Coming Soon", "Language selection will be available soon.")} 
                    />
                </SettingsSection>

                {/* Support & About */}
                <SettingsSection title="Support">
                    <SettingItem 
                        icon="help-circle-outline" 
                        title="Help Center" 
                        onPress={() => Linking.openURL("https://google.com")} 
                    />
                    <SettingItem 
                        icon="information-circle-outline" 
                        title="About MediConnect" 
                        subtitle="Version 1.0.0"
                        onPress={() => Alert.alert("About", "MediConnect Version 1.0.0\nDeveloped by the MediConnect Team.")} 
                    />
                </SettingsSection>

                {/* Logout */}
                <SettingsSection>
                    <SettingItem 
                        icon="log-out-outline" 
                        title="Log Out" 
                        danger
                        onPress={handleLogout} 
                    />
                </SettingsSection>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    header: { padding: 20, backgroundColor: "#1a40c2", borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    profileSection: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", padding: 20, borderRadius: 24, marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#E6F1FB", alignItems: "center", justifyContent: "center", marginRight: 16 },
    avatarText: { fontSize: 24, fontWeight: "bold", color: "#0C447C" },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 18, fontWeight: "bold", color: "#191c1e", marginBottom: 4 },
    profileEmail: { fontSize: 13, color: "#747686", marginBottom: 8 },
    roleBadge: { alignSelf: "flex-start", backgroundColor: "rgba(26, 64, 194, 0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
    roleText: { fontSize: 10, fontWeight: "bold", color: "#1a40c2", letterSpacing: 0.5 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#747686", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12, marginLeft: 8 },
    sectionContent: { backgroundColor: "#ffffff", borderRadius: 20, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
    settingItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f2f4f7" },
    iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f7f9fc", alignItems: "center", justifyContent: "center", marginRight: 12 },
    dangerIconContainer: { backgroundColor: "#fff0f0" },
    settingTextContainer: { flex: 1 },
    settingTitle: { fontSize: 16, fontWeight: "500", color: "#191c1e" },
    dangerText: { color: "#ba1a1a", fontWeight: "600" },
    settingSubtitle: { fontSize: 13, color: "#747686", marginTop: 2 }
});

export default SettingsPage;