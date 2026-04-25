import {View, Image, Text, StyleSheet, ToastAndroid} from "react-native"
import AppButton from '../components/AppButton';

const Onboarding = () =>{
    return (
    <View style={{flex: 1, paddingBottom: 70, alignItems:'center', paddingHorizontal:20}}>
        <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
            }}>
                <Image 
                    source={require('../assets/logo.png')}
                    style={{ width: 50, height: 50 }}
                />
    
                <Text style={styles.title}>MediConnect</Text>
                <Text style={styles.tagLine}>Your health, simplified</Text>    
            </View>

            <AppButton 
                text="Get Started" 
                onPress={()=>{ToastAndroid.show("Get Started Button Pressed", ToastAndroid.SHORT)}}
                height={50} 
                width="100%"/>
    </View>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title:{
    marginTop: 40,
    fontSize: 28,
    fontWeight: "400"
  },
  tagLine: {
    marginTop:10,
    marginBottom: 100,
    fontSize: 16
  }
  
});


export default Onboarding;