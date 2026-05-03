import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { auth, database } from "../config/firebase";
import { ref, onValue } from "firebase/database";
import { TopBar } from "../components/TopBar";
import { SearchBar } from "../components/SearchBar";
import { ServiceGrid } from "../components/ServiceGrid";
import { ScheduleCard } from "../components/ScheduleCard";
import { HorizontalScrollList } from "../components/HorizontalScrollList";
import { DoctorCard } from "../components/DoctorCard";
import { useNavigation } from "@react-navigation/native";

const HomePage = () => {
    const [displayName, setDisplayName] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [topSpecialists, setTopSpecialists] = useState([]);
    const navigation = useNavigation();
    const services = [
        { id: 1, name: "Emergency", icon: "warning", screen: "Emergency" },
        { id: 2, name: "Hospital", icon: "business", screen: "Hospitals" },
        { id: 3, name: "Blood", icon: "water", screen: "BloodBank" },
        { id: 4, name: "Prescription", icon: "document-text", screen: "Prescription" },
        { id: 5, name: "Doctor", icon: "medkit", screen: "FindDoctors" },
        { id: 8, name: "Radiology", icon: "scan", screen: "Radiology" },
    ];

    const getInitials = (fullName) => {
        if (!fullName) return "DR";
        const names = fullName.split(" ");
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const getBgColor = (specialty) => {
        const colors = {
            "Cardiologist": "#3b5bdb",
            "Neurologist": "#00746a",
            "Pediatrician": "#496ae8",
            "Dermatologist": "#ba1a1a",
            "Orthopedic": "#ff8c00",
        };
        return colors[specialty] || "#dde1ff";
    };

    const serviceColors = {
        "Emergency": { backgroundColor: "#ffdad6", iconColor: "#ba1a1a" },
        "Doctor": { backgroundColor: "#3b5bdb", iconColor: "#ffffff" },
    };

    useEffect(() => {
        setTimeout(()=>{
            if (auth.currentUser) {
                setDisplayName(auth.currentUser.displayName);
            }
        }, 500);

        const doctorsRef = ref(database, "doctors");
        const unsub = onValue(doctorsRef, (snapshot) => {
            const docs = [];
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    const doctor = child.val();
                    if (doctor.isVerified) {
                        docs.push({
                            id: child.key,
                            initials: getInitials(doctor.fullName),
                            name: doctor.fullName,
                            specialty: doctor.primarySpecialization,
                            rating: doctor.rating || 0,
                            bgColor: getBgColor(doctor.primarySpecialization)
                        });
                    }
                });
            }
            // Sort by rating or just take first 5
            docs.sort((a, b) => b.rating - a.rating);
            setTopSpecialists(docs.slice(0, 5));
        });

        return () => unsub();
    }, []);

    const filteredSpecialists = topSpecialists.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleServicePress = (service) => {
        navigation.navigate(service.screen);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <TopBar userName={displayName} avatarText="A" />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <SearchBar 
                    placeholder="Find doctor, clinic, or health issue" 
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
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
                    data={filteredSpecialists}
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