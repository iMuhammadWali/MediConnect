import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export const SearchBar = ({ placeholder, value, onChangeText, onSearch }) => {
    return (
        <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#747686" />
            <TextInput
                style={styles.searchInput}
                placeholder={placeholder || "Search..."}
                placeholderTextColor="#747686"
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSearch}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e6e8eb",
        borderRadius: 9999,
        paddingHorizontal: 16,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        fontWeight: "500",
        color: "#191c1e",
    },
});