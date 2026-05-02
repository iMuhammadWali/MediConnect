import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export const FormInput = ({ 
    label, 
    icon, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false,
    showPasswordToggle = false,
    onTogglePassword,
    keyboardType = "default",
    autoCapitalize = "none",
    multiline = false,
    required = false,
    error = null,
    rightElement = null,
    headerRightElement = null 
}) => {
    return (
        <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
                <Text style={styles.inputLabel}>
                    {label} {required && <Text style={styles.requiredStar}>*</Text>}
                </Text>
                {headerRightElement && headerRightElement}
            </View>
            <View style={[styles.inputContainer, error && styles.inputError]}>
                <Ionicons name={icon} size={18} color="#c4c5d6" style={styles.inputIcon} />
                <TextInput
                    style={[styles.input, multiline && styles.textArea]}
                    placeholder={placeholder}
                    placeholderTextColor="#c4c5d6"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={multiline ? 3 : 1}
                />
                {rightElement && rightElement}
                {showPasswordToggle && (
                    <TouchableOpacity onPress={onTogglePassword}>
                        <Ionicons 
                            name={secureTextEntry ? "eye-off-outline" : "eye-outline"} 
                            size={18} 
                            color="#c4c5d6" 
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    inputGroup: { gap: 4, marginVertical: 10 },
    labelContainer: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: "center",
        paddingHorizontal: 4 
    },
    inputLabel: { fontSize: 11, fontWeight: "600", color: "#444654", textTransform: "uppercase", letterSpacing: 0.5 },
    requiredStar: { color: "#ba1a1a" },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#e6e8eb", borderRadius: 14, paddingHorizontal: 14, minHeight: 46 },
    inputError: { borderWidth: 1, borderColor: "#ba1a1a" },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 13, color: "#191c1e", paddingVertical: 10 },
    textArea: { textAlignVertical: "center", paddingTop: 10, minHeight: 72 },
    errorText: { fontSize: 11, color: "#ba1a1a", marginLeft: 4 }
});