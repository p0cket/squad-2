import React, { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    // Fetch messages and listen for new messages in real-time
    useEffect(() => {
        const messagesRef = collection(db, "chatMessages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(loadedMessages);
            console.log("Messages updated:", loadedMessages); // Log updated messages
        });

        // Clean up the listener on component unmount
        return () => unsubscribe();
    }, []);

    // Add new message to Firestore
    const sendMessage = async () => {
        if (newMessage.trim()) {
            try {
                const messagesRef = collection(db, "chatMessages");
                await addDoc(messagesRef, {
                    text: newMessage,
                    sender: "User", // Replace this with dynamic user identification if available
                    timestamp: new Date() // Current timestamp
                });
                console.log("Message sent:", newMessage); // Log sent message
                setNewMessage(""); // Clear input field after sending
            } catch (error) {
                console.error("Error sending message:", error); // Log the error
            }
        }
    };

    return (
        <div className="flex flex-col h-full p-6 bg-gray-100 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Realtime Chat</h2>

            {/* Messages Display */}
            <div className="flex-grow overflow-y-auto bg-white p-4 mb-4 rounded-lg shadow-inner">
                {messages.map((message) => (
                    <div key={message.id} className="mb-2">
                        <span className="font-semibold text-blue-600">{message.sender}: </span>
                        <span className="text-gray-700">{message.text}</span>
                    </div>
                ))}
            </div>

            {/* Input Field and Send Button */}
            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="Type a message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                >
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat;
