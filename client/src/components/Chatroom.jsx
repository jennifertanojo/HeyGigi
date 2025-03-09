import React, { useState } from "react";
import "./style/Chatroom.css";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Window from "./Window";
import Send from "../images/Send.png";
import File from "../images/File.png";
import Mic from "../images/Mic.png"; // Add a microphone icon
import pdfToText from "react-pdftotext";
import ReactMarkdown from "react-markdown";
import Phone from "../images/Phone.png";
import GigiCall from "../images/GigiCall.png";

function Chatroom({ onClose, topic }) {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileText, setFileText] = useState("");
  const [isCallingGigi, setIsCallingGigi] = useState(false);

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction:
      "Your name is Gigi. You should explain stuff like you're my best friend and we're gossiping.",
  });

  // Speech-to-Text Function
  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Recognized Speech:", transcript);
      setUserMessage(transcript);
      sendMessage(transcript); // Automatically send message after speech
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    pdfToText(file)
      .then((text) => {
        setFileText(text);
        setChatHistory((prevChat) => [
          ...prevChat,
          {
            sender: "user",
            text: `📂 Uploaded file: ${file.name}`,
            fileName: file.name,
          },
        ]);
      })
      .catch((error) => console.error("Failed to extract text from pdf", error));
  };

  const callGigi = () => {
    setIsCallingGigi((prev) => !prev);
  };

  const sendMessage = async (message = userMessage) => {
    if (!message.trim()) return;

    let contentToSend = chatHistory
      .map((msg) => `${msg.sender === "user" ? "User" : "Bot"}: ${msg.text}`)
      .join("\n");

    contentToSend += `\nUser: ${message}\n`;

    const newMessages = [...chatHistory, { sender: "user", text: message }];
    setChatHistory(newMessages);
    setUserMessage("");
    setIsLoading(true);

    try {
      if (selectedFile) {
        contentToSend += `\n\nFile Content: ${fileText}`;
      }

      console.log("Sending content to Gemini:", contentToSend);
      const result = await model.generateContent(contentToSend);
      const response = await result.response;

      setChatHistory([...newMessages, { sender: "bot", text: response.text() }]);
    } catch (error) {
      console.error("Error communicating with Gigi", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Chatroom">
      <Window onClose={onClose} HeaderTitle={topic.name}>
        {isCallingGigi ? (
          <div className="CallArea">
            <img src={GigiCall} alt="Calling Gigi" />
            <div className="CallButtons">
              <button style={{ fontSize: "18px" }}>Interrupt</button>
              <button
                style={{
                  fontSize: "18px",
                  backgroundColor: "#FF7AAA",
                  color: "white",
                }}
                onClick={callGigi}
              >
                Hang Up
              </button>
            </div>
          </div>
        ) : (
          <div className="ChatroomArea">
            <div className="messages">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={msg.sender === "user" ? "user-message" : "ai-message"}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ))}
            </div>

            <div className="MessageBar">
              <img
                src={Phone}
                alt="Call Gigi"
                onClick={callGigi}
                style={{
                  cursor: "pointer",
                  height: "50px",
                }}
                disabled={isLoading}
              />
              <textarea
                className="UserMessage"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <img
                src={Mic}
                alt="Voice Input"
                onClick={startListening}
                style={{
                  cursor: "pointer",
                  height: "48px",
                }}
                title="Speak to Gigi"
              />
              <input
                id="fileInput"
                className="upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="fileInput">
                <img
                  src={File}
                  alt="Upload PDF"
                  style={{ cursor: "pointer", width: "50px", height: "50px" }}
                />
              </label>
              <img
                src={Send}
                alt="Send"
                onClick={() => sendMessage()}
                style={{
                  cursor: "pointer",
                  height: "30px",
                }}
                disabled={isLoading}
              />
            </div>
          </div>
        )}
      </Window>
    </div>
  );
}

export default Chatroom;
