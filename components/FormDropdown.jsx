import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";

export const FormDropdown = ({ 
    label, 
    icon, 
    placeholder, 
    value, 
    onSelect, 
    options,
    multiple = false,
    selectedItems = [],
    onToggleItem,
    required = false
}) => {
    const [visible, setVisible] = useState(false);

    const renderDropdownModal = () => (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setVisible(false)}>
            <TouchableOpacity 
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setVisible(false)}>
                <TouchableOpacity 
                    activeOpacity={1} 
                    style={styles.dropdownModal}
                    onPress={() => {}}>
                    <View style={styles.dropdownHeader}>
                        <Text style={styles.dropdownTitle}>{label}</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Ionicons name="close" size={24} color="#191c1e" />
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => {
                            const isSelected = multiple 
                                ? selectedItems.includes(item) 
                                : value === item;
                            return (
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    activeOpacity={0.6}
                                    onPress={() => {
                                        if (multiple && onToggleItem) {
                                            onToggleItem(item);
                                        } else if (onSelect) {
                                            onSelect(item);
                                            setVisible(false);
                                        }
                                    }}>
                                    <Text style={[
                                        styles.dropdownItemText,
                                        isSelected && styles.selectedDropdownItemText
                                    ]}>{item}</Text>
                                    <View style={[
                                        styles.checkbox,
                                        isSelected && styles.checkboxSelected
                                    ]}>
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={14} color="#ffffff" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                    {multiple && (
                        <View style={styles.dropdownFooter}>
                            <TouchableOpacity 
                                style={styles.doneButton}
                                onPress={() => setVisible(false)}>
                                <Text style={styles.doneButtonText}>
                                    Done {selectedItems.length > 0 ? `(${selectedItems.length})` : ""}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );

    const displayValue = multiple 
        ? (selectedItems.length > 0 ? selectedItems.join(", ") : placeholder)
        : (value || placeholder);

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
                {label} {required && <Text style={styles.requiredStar}>*</Text>}
            </Text>
            <TouchableOpacity 
                style={styles.inputContainer}
                onPress={() => setVisible(true)}>
                <Ionicons name={icon} size={18} color="#c4c5d6" style={styles.inputIcon} />
                <Text 
                    style={[styles.inputText, !value && !selectedItems.length && styles.placeholderText]} 
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {displayValue}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#c4c5d6" />
            </TouchableOpacity>
            {renderDropdownModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    inputGroup: { gap: 4, marginVertical: 10 },
    inputLabel: { fontSize: 11, fontWeight: "600", color: "#444654", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
    requiredStar: { color: "#ba1a1a" },
    inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#e6e8eb", borderRadius: 14, paddingHorizontal: 14, height: 46 },
    inputIcon: { marginRight: 10 },
    inputText: { flex: 1, fontSize: 13, color: "#191c1e" },
    placeholderText: { color: "#c4c5d6" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    dropdownModal: { backgroundColor: "#ffffff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "60%", overflow: "hidden" },
    dropdownHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#e0e3e6" },
    dropdownTitle: { fontSize: 16, fontWeight: "bold", color: "#191c1e" },
    dropdownItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, height: 52, borderBottomWidth: 1, borderBottomColor: "#f2f4f7" },
    dropdownItemText: { fontSize: 14, color: "#191c1e" },
    selectedDropdownItemText: { color: "#1a40c2", fontWeight: "500" },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: "#c4c5d6", alignItems: "center", justifyContent: "center" },
    checkboxSelected: { backgroundColor: "#1a40c2", borderColor: "#1a40c2" },
    dropdownFooter: { padding: 12, borderTopWidth: 1, borderTopColor: "#e0e3e6" },
    doneButton: { backgroundColor: "#1a40c2", paddingVertical: 12, borderRadius: 9999, alignItems: "center" },
    doneButtonText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 }
});