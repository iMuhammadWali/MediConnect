import { Button, ToastAndroid, TouchableOpacity, Text } from "react-native"
import App from "../App";

// I will probably use poppings
const AppButton = () =>{
    const onButtonClickListener = () =>{
        ToastAndroid.show("Button pressed", ToastAndroid.SHORT);
    }

    return (
        <TouchableOpacity
        onPress={onButtonClickListener}
        style={{
            backgroundColor:"#3b5bdb",
            height: 50,
            width: 300,
            alignItems:"center",
            justifyContent: "center",
            borderRadius: 30}}
        >
            <Text style={{color:"white"}}>Get Started</Text>
        </TouchableOpacity>
    )
}

export default AppButton;