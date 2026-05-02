import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { TopBar } from "../components/TopBar";
import { SearchBar } from "../components/SearchBar";
import { ServiceGrid } from "../components/ServiceGrid";
import { ScheduleCard } from "../components/ScheduleCard";
import { HorizontalScrollList } from "../components/HorizontalScrollList";
import { DoctorCard } from "../components/DoctorCard";
import { useNavigation } from "@react-navigation/native";

const HomePage = () => {
    const [displayName, setDisplayName] = useState(null);
    const navigation = useNavigation();
    const services = [
        { id: 1, name: "Emergency", icon: "warning", screen: "Emergency" },
        { id: 2, name: "Hospital", icon: "business", screen: "Hospitals" },
        { id: 3, name: "Blood", icon: "water", screen: "BloodBank" },
        { id: 4, name: "Prescription", icon: "document-text", screen: "Prescription" },
        { id: 5, name: "Doctor", icon: "medkit", screen: "FindDoctors" },
        { id: 6, name: "Check Up", icon: "heart", screen: "CheckUp" },
        { id: 7, name: "Location", icon: "location", screen: "Locations" },
        { id: 8, name: "Radiology", icon: "scan", screen: "Radiology" },
    ];

    const topSpecialists = [
        { id: 1, initials: "RK", name: "Dr. Rahul Kumar", specialty: "Neurologist", rating: 4.9, bgColor: "#dde1ff" },
        { id: 2, initials: "FP", name: "Dr. Fatima Patel", specialty: "Dermatologist", rating: 4.8, bgColor: "#dde1ff" },
        { id: 3, initials: "MJ", name: "Dr. Mark Jones", specialty: "Orthopedic", rating: 4.7, bgColor: "#b8c3ff" },
    ];

    const serviceColors = {
        "Emergency": { backgroundColor: "#ffdad6", iconColor: "#ba1a1a" },
        "Doctor": { backgroundColor: "#3b5bdb", iconColor: "#ffffff" },
    };

    useEffect(() => {
        if (auth.currentUser) {
            setDisplayName(auth.currentUser.displayName);
        }
    }, []);

    const handleServicePress = (service) => {
        navigation.navigate(service.screen);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <TopBar userName={displayName} avatarText="A" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <SearchBar placeholder="Find doctor, clinic, or health issue" />
                <ServiceGrid services={services} onServicePress={handleServicePress} customColors={serviceColors} />
                
                {/* This should also be done with a flat list or I can just chose not to show it 
                and change the schedule card component */}
                {/* <ScheduleCard 
                    doctorInitials="SA"
                    doctorName="Dr. Sarah Ahmed"
                    doctorSpecialty="Cardiologist"
                    date="Oct 24, 2023"
                    time="10:30 AM"
                    status="Confirmed"
                /> */}
                <HorizontalScrollList 
                    title="Top Specialists"
                    data={topSpecialists}
                    renderItem={({ item }) => (
                        <DoctorCard 
                            initials={item.initials}
                            name={item.name}
                            specialty={item.specialty}
                            rating={item.rating}
                            bgColor={item.bgColor}
                            onPress={() => navigation.navigate("DoctorDetails", { doctorId: item.id })}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f7f9fc",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
    },
});

export default HomePage;