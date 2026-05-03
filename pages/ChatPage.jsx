import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import { ref, onValue, push, set } from "firebase/database";
import { database, auth } from "../config/firebase";

const ChatPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { otherUid, otherName } = route.params || {};
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const flatListRef = useRef();

    const currentUid = auth.currentUser?.uid;
    const chatId = currentUid && otherUid
        ? (currentUid < otherUid ? `${currentUid}_${otherUid}` : `${otherUid}_${currentUid}`)
        : null;

    useEffect(() => {
        if (!chatId) return;
        const msgRef = ref(database, `chats/${chatId}/messages`);
        const unsub = onValue(msgRef, snapshot => {
            const data = snapshot.val();
            if (!data) {
                setMessages([]);
                return;
            }
            const msgs = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            msgs.sort((a, b) => a.timestamp - b.timestamp);
            setMessages(msgs);
        });
        return unsub;
    }, [chatId]);

    const handleSend = async () => {
        if (!text.trim()) return;
        const msgText = text.trim();
        setText("");

        try {
            if (!chatId) throw new Error("Chat connection is not established.");
            if (!currentUid) throw new Error("You must be logged in to send messages.");

            const msgRef = ref(database, `chats/${chatId}/messages`);
            const newMsgRef = push(msgRef);
            await set(newMsgRef, {
                text: msgText,
                senderId: currentUid,
                timestamp: Date.now()
            });
        } catch (error) {
            setText(msgText);
            Alert.alert("Failed to send message", error.message);
        }
    };

    const renderMessage = ({ item: m }) => {
        const isMe = m.senderId === currentUid;
        return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
                <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.otherMessageText]}>
                    {m.text}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{otherName || "Chat"}</Text>
            </View>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <FlatList
                    ref={flatListRef}
                    data={[...messages].reverse()}
                    inverted
                    keyExtractor={m => m.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No messages yet. Start a conversation.</Text>
                    }
                />
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={text}
                        onChangeText={setText}
                        placeholder="Type a message..."
                        placeholderTextColor="#c4c5d6"
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !text.trim() && { opacity: 0.5 }]}
                        onPress={handleSend}
                        disabled={!text.trim()}
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f7f9fc" },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        backgroundColor: "#1a40c2",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(255,255,255,0.15)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
    messagesContent: { padding: 16, gap: 12 },
    emptyText: { textAlign: "center", color: "#717273", marginTop: 20 },
    messageBubble: { maxWidth: "80%", padding: 12, borderRadius: 16 },
    myMessage: { alignSelf: "flex-end", backgroundColor: "#1a40c2", borderBottomRightRadius: 4 },
    otherMessage: { alignSelf: "flex-start", backgroundColor: "#e6e8eb", borderBottomLeftRadius: 4 },
    messageText: { fontSize: 15 },
    myMessageText: { color: "#fff" },
    otherMessageText: { color: "#191c1e" },
    inputContainer: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    input: {
        flex: 1,
        backgroundColor: "#f0f2f5",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: "#1a40c2",
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    }
});

export default ChatPage;