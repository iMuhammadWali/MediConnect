import {View, Image, Text, StyleSheet, ToastAndroid} from "react-native"
import AppButton from '../components/AppButton';
import { Link } from "@react-navigation/native";

const OnboardingPage = () =>{
    return (
    <View style={{flex: 1, paddingBottom: 70, alignItems:'center', paddingHorizontal:20}}>
        <View style={{
            flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image 
                    source={require('../assets/logo.png')}
                    style={{ width: 170, height: 170 }}
                />
    
                <Text style={{
                        marginTop: 10, fontSize: 28, fontWeight: "400"
                }}>MediConnect</Text>

                <Text style={{ marginTop:10,marginBottom: 100, fontSize: 16
                }}>Your health, simplified</Text>

            <Link screen="Login"> Go to login</Link>
            </View>

            <AppButton 
                text="Get Started" 
                onPress={()=>{ToastAndroid.show("Get Started Button Pressed", ToastAndroid.SHORT)}}
                height={50} 
                width="100%"/>

        </View>
    );
}

export default OnboardingPage;