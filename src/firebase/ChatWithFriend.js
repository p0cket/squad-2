import React, { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore"
import { db } from "../firebase/firebase"

function ChatWithFriend({ currentUserId, friendId }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isFriend, setIsFriend] = useState(false)

  const chatRoomId = [currentUserId, friendId].sort().join("_") // Unique chat room ID

  // Check if users are friends
  useEffect(() => {
    const checkFriendship = async () => {
        try {
            const userRef = doc(db, "users", currentUserId);
            const userDoc = await getDoc(userRef);
    
            if (userDoc.exists()) {
                // Provide a default empty array if friends field is missing
                const userFriends = userDoc.data().friends || [];
                setIsFriend(userFriends.includes(friendId)); // Check if friendId is in the user's friends list
            } else {
                console.log("User document does not exist.");
            }
        } catch (error) {
          console.error("Error checking friendship: fix later"); // Log any errors encountered

            // console.error("Error checking friendship:", error); // Log any errors encountered
        }
    };
    

    checkFriendship()
  }, [currentUserId, friendId])

  // Fetch messages if they are friends
  useEffect(() => {
    if (isFriend) {
      const messagesRef = collection(db, "chatRooms", chatRoomId, "messages")
      const q = query(messagesRef, orderBy("timestamp", "asc"))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setMessages(loadedMessages)
        console.log("Messages updated:", loadedMessages) // Log updated messages
      })

      return () => unsubscribe() // Clean up listener on unmount
    }
  }, [isFriend, chatRoomId])

  // Send a message to Firestore
  const sendMessage = async () => {
    if (newMessage.trim() && isFriend) {
      try {
        const messagesRef = collection(db, "chatRooms", chatRoomId, "messages")
        await addDoc(messagesRef, {
          text: newMessage,
          sender: currentUserId,
          timestamp: new Date(),
        })
        console.log("Message sent:", newMessage) // Log sent message
        setNewMessage("") // Clear input field after sending
      } catch (error) {
        console.error("Error sending message:", error) // Log the error
      }
    }
  }

  if (!isFriend) {
    return (
      <div className="text-red-500">
        You are not friends with this user and cannot message them.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 bg-gray-100 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
        Chat with Friend
      </h2>

      {/* Messages Display */}
      <div className="flex-grow overflow-y-auto bg-white p-4 mb-4 rounded-lg shadow-inner">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-semibold text-blue-600">
              {message.sender === currentUserId ? "You" : "Friend"}:{" "}
            </span>
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
  )
}

export default ChatWithFriend
