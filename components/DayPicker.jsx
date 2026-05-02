import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DayPicker = ({ selectedDays, onToggleDay, label }) => {
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.daysContainer}>
                {DAYS.map(day => (
                    <TouchableOpacity
                        key={day}
                        style={[
                            styles.dayChip,
                            selectedDays.includes(day) && styles.activeDayChip
                        ]}
                        onPress={() => onToggleDay(day)}>
                        <Text style={[
                            styles.dayText,
                            selectedDays.includes(day) && styles.activeDayText
                        ]}>{day}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputGroup: { gap: 4 },
    inputLabel: { fontSize: 11, fontWeight: "600", color: "#444654", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 },
    daysContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    dayChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#e6e8eb" },
    activeDayChip: { backgroundColor: "#1a40c2" },
    dayText: { fontSize: 12, color: "#444654" },
    activeDayText: { color: "#ffffff" }
});