import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database, auth } from "../config/firebase";
import { Agenda } from 'react-native-calendars';


// This is being used for Doctor Schedule.
const theme = {
    agendaDayTextColor: '#747686',
    agendaDayNumColor: '#191c1e',
    agendaTodayColor: '#1a40c2',
    agendaKnobColor: '#c4c5d6',
    dotColor: '#1a40c2',
    selectedDayBackgroundColor: '#1a40c2',
};

const parseDateString = (dateStr) => {
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    
    // Attempt to parse 'May 4, 2026'
    if (typeof dateStr === 'string') {
        const parts = dateStr.replace(/,/g, '').split(' ');
        if (parts.length >= 3) {
            const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
            const month = monthMap[parts[0].substring(0, 3)];
            const day = parseInt(parts[1], 10);
            const year = parseInt(parts[2], 10);
            if (month !== undefined && !isNaN(day) && !isNaN(year)) {
                return new Date(Date.UTC(year, month, day));
            }
        }
    }
    throw new Error("Invalid date format");
};

const SchedulerPage = () => {
    const navigation = useNavigation();
    const [items, setItems] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const appRef = ref(database, "appointments");
        const unsub = onValue(appRef, snapshot => {
            const appointmentsData = {};
            
            // Pre-populate a range of days around today to ensure Agenda has keys to render
            const today = new Date();
            for (let i = -30; i < 60; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const strTime = date.toISOString().split('T')[0];
                appointmentsData[strTime] = [];
            }

            if (snapshot.exists()) {
                snapshot.forEach(c => {
                    const data = c.val();
                    if (data.patientId === uid || data.doctorId === uid) {
                        try {
                            const d = parseDateString(data.date);
                            const formattedDate = d.toISOString().split('T')[0];
                            
                            if (!appointmentsData[formattedDate]) {
                                appointmentsData[formattedDate] = [];
                            }
                            
                            appointmentsData[formattedDate].push({
                                id: c.key,
                                name: data.doctorName,
                                time: data.time,
                                status: data.status,
                                height: 80,
                                isDoctor: data.doctorId === uid,
                                ...data
                            });
                        } catch (e) {
                            console.log("Invalid date", data.date);
                        }
                    }
                });
            }
            setItems(appointmentsData);
            setLoading(false);
        });
        return unsub;
    }, []);

    const renderItem = (item) => {
        const isCancel = item.status === "Cancel";
        const isComplete = item.status === "Completed";
        return (
            <TouchableOpacity 
                style={[styles.item, isCancel && { opacity: 0.6 }]}
                onPress={() => {
                    if (item.isDoctor) {
                        navigation.navigate("PatientDetails", { patientId: item.patientId });
                    } else {
                        navigation.navigate("DoctorDetails", { doctorId: item.doctorId });
                    }
                }}
            >
                <View style={styles.itemHeader}>
                    <Text style={styles.itemTime}>{item.time}</Text>
                    <View style={[styles.statusBadge, { 
                        backgroundColor: isCancel ? '#ffdad6' : isComplete ? '#84f6e6' : 'rgba(243, 156, 18, 0.1)'
                    }]}>
                        <Text style={[styles.statusText, {
                            color: isCancel ? '#93000a' : isComplete ? '#005951' : '#F39C12'
                        }]}>{item.status}</Text>
                    </View>
                </View>
                <Text style={styles.itemTitle}>{item.isDoctor ? "Patient Appointment" : item.doctorName}</Text>
                <Text style={styles.itemSubtitle}>{item.isDoctor ? "View Patient Details" : "View Doctor Details"}</Text>
            </TouchableOpacity>
        );
    };

    const renderEmptyDate = () => {
        return (
            <View style={styles.emptyDate}>
                <View style={styles.emptyLine} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Scheduler</Text>
            </View>

            <Agenda
                items={items}
                selected={new Date().toISOString().split('T')[0]}
                renderItem={renderItem}
                renderEmptyDate={renderEmptyDate}
                theme={theme}
                showClosingKnob={true}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fc",
    },
    header: {
        backgroundColor: "#1a40c2",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        zIndex: 1, // To overlap the agenda slightly if needed
    },
    headerTitle: { fontSize: 24, fontWeight: "bold", color: "#ffffff" },
    item: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 12,
        padding: 16,
        marginRight: 10,
        marginTop: 17,
        shadowColor: "#1a40c2",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemTime: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a40c2',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 9999,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#191c1e',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#747686',
    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30,
        justifyContent: 'center',
    },
    emptyLine: {
        height: 1,
        backgroundColor: '#e6e8eb',
        marginRight: 10,
    }
});

export default SchedulerPage;
