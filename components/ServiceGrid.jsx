import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export const ServiceGrid = ({ services, onServicePress, columns = 3, customColors = {} }) => {
    const renderServiceItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.serviceItem}
            onPress={() => onServicePress(item)}>
            <View style={[
                styles.serviceIcon,
                customColors[item.name]?.backgroundColor && { backgroundColor: customColors[item.name].backgroundColor }
            ]}>
                <Ionicons 
                    name={item.icon} 
                    size={28} 
                    color={customColors[item.name]?.iconColor || "#4767e6"} 
                />
            </View>
            <Text style={styles.serviceName}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Services</Text>
            <FlatList
                data={services}
                renderItem={renderServiceItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={columns}
                scrollEnabled={false}
                contentContainerStyle={styles.servicesGrid}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#191c1e",
        marginBottom: 16,
    },
    servicesGrid: {
        gap: 24,
    },
    serviceItem: {
        flex: 1,
        alignItems: "center",
        gap: 8,
    },
    serviceIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#d5eaff",
    },
    serviceName: {
        fontSize: 12,
        fontWeight: "500",
        color: "#444654",
        textAlign: "center",
    },
});