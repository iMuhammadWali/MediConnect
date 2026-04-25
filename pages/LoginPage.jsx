import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: Learn useEffect and useNavigation Hooks. What are hooks in react?
const LoginPage = () =>{
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{flex: 1}}>
                <Text>This is the login screen, Haha neend aarahi hai.</Text>
            </View>
        </SafeAreaView>
    )
}
export default LoginPage;