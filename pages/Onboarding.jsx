import {View, Image, Text, StyleSheet} from "react-native"
import AppButton from '../components/AppButton';

const Onboarding = () =>{
    return (
    <View style={{flex: 1, paddingBottom: 80, alignItems:'center'}}>
        <View style={styles.container}>
            <Image 
                source={require('../assets/logo.png')}
                style={{ width: 50, height: 50 }}
            />
    
            <Text style={styles.title}>MediConnect</Text>
            <Text style={styles.tagLine}>Your health, simplified</Text>    
        </View>
        <AppButton />
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