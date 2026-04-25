import { Button, ToastAndroid, TouchableOpacity, Text } from "react-native"
import App from "../App";

// I will probably use poppings
const AppButton = ({text, onPress, width, height}) =>{
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                backgroundColor:"#3b5bdb",
                height: height,
                width: width,
                alignItems:"center",
                justifyContent: "center",
                borderRadius: 30
            }}
        >
            <Text style={{color:"white"}}>{text}</Text>
        </TouchableOpacity>
    )
}

export default AppButton;