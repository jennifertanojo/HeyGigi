import React, { useState } from "react";
import "./style/Chatroom.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Window from "./Window";

function Chatroom({ onClose, topic }) {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction:
      "Your name is Gigi. You should explain stuff like you're my best friend and we're gossiping. Keep your answers short.",
  });

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const newMessages = [...chatHistory, { sender: "user", text: userMessage }];
    setChatHistory(newMessages);
    setUserMessage("");

    setIsLoading(true);

    try {
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      console.log(response.text());
      
      setChatHistory([
        ...newMessages,
        { sender: "bot", text: response.text() },
      ]);
    } catch (error) {
      console.error("Error communicating with Gigi", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Chatroom">
      <Window onClose={onClose} HeaderTitle={topic.name}>
        <button type="button" onClick={onClose}>
          X
        </button>

        <div className="messages">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={msg.sender === "user" ? "user-message" : "ai-message"}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </button>
      </Window>
    </div>
  );
}

export default Chatroom;
