import { View, Text, StyleSheet } from "react-native";

export const SectionDivider = ({ title }) => {
    return (
        <View style={styles.sectionDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.dividerLine} />
        </View>
    );
};

const styles = StyleSheet.create({
    sectionDivider: { flexDirection: "row", alignItems: "center", marginVertical: 10, gap: 8 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#e0e3e6" },
    sectionTitle: { fontSize: 12, fontWeight: "600", color: "#1a40c2" }
});