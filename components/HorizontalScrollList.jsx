// components/HorizontalScrollList.js
import { View, Text, FlatList, StyleSheet } from "react-native";

export const HorizontalScrollList = ({ title, data, renderItem, keyExtractor, onSeeAllPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {onSeeAllPress && (
                    <TouchableOpacity onPress={onSeeAllPress}>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        marginBottom: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#191c1e",
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#3b5bdb",
    },
    listContent: {
        gap: 16,
        paddingRight: 24,
    },
});