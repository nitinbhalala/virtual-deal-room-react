import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

// Static data based on your requirements.
const sellerId = "67f4c1fa49cc5885f32c074d";
const buyerId = "67f4bffad8b9911cbb17e708";
const dealId = "67f50d8c89f5a30f3585f98f";

// The Socket.io server URL from your instructions.
const SOCKET_URL = "wss://virtual-deal-room-43t2.onrender.com";

const Chat = ({ senderId }) => {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");

  // Use a ref to store the scrollable container reference if needed.
  const messagesEndRef = useRef(null);

  // Initialize the socket and join the chat room once when the component mounts.
  useEffect(() => {
    // Create a new socket connection. (The socket.io client automatically uses the correct protocol.)
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      forceNew: true,
    });
    setSocket(newSocket);

    // When connection is successful, join the chat.
    newSocket.on("connect", () => {
      console.log("Connected to socket server");

      // Here we use the join_chat event using the static data.
      newSocket.emit("join_chat", { sellerId, buyerId, dealId });
    });

    // Listen for the join confirmation with the roomId and any prior chat messages.
    newSocket.on("chat_joined", (data) => {
      console.log("Chat joined:", data);
      setRoomId(data.roomId);
      // Set the initial chat history if any.
      if (data.chatHistory) {
        setChatHistory(data.chatHistory);
      }
    });

    // Listen for received messages.
    newSocket.on("receive_message", (newMessage) => {
      console.log("New message received:", newMessage);
      setChatHistory((prev) => [...prev, newMessage]);
    });

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Scroll into view when new messages are added (optional).
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Handler to send a new message.
  const sendMessage = () => {
    if (message.trim() === "" || !roomId || !socket) return;

    // Create the message payload according to your backend's send_message event.
    const payload = {
      senderId, // the senderId taken from the user input
      roomId,
      text: message,
    };

    socket.emit("send_message", payload);
    // Optionally add the message to the chat immediately.
    setChatHistory((prev) => [
      ...prev,
      { text: message, senderId, createdAt: new Date() },
    ]);
    setMessage("");
  };

  return (
    <div>
      <h2>Chat Room</h2>
      {roomId ? (
        <div>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              height: "300px",
              overflowY: "scroll",
            }}
          >
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                style={{
                  margin: "0.5rem 0",
                  textAlign: msg.senderId === senderId ? "right" : "left",
                }}
              >
                <strong>{msg.senderId === senderId ? "You" : "Other"}:</strong>{" "}
                {msg.text}
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ marginTop: "1rem" }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ width: "80%", padding: "0.5rem" }}
            />
            <button
              onClick={sendMessage}
              style={{ padding: "0.5rem 1rem", marginLeft: "1rem" }}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div>Joining chat room...</div>
      )}
    </div>
  );
};

export default Chat;
