import React, { useState } from "react";
import "./style/Chatroom.css";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Window from "./Window";
import Send from "../images/Send.png";
import File from "../images/File.png";
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
            fileName: file.name, // Store file name
          },
        ]);
      })
      .catch((error) =>
        console.error("Failed to extract text from pdf", error)
      );
  };

  const callGigi = () => {
    if (!isCallingGigi) {
      setIsCallingGigi(true);
    } else {
      setIsCallingGigi(false);
    }
  };

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    let contentToSend = "";

    chatHistory.forEach((msg) => {
      contentToSend += `${msg.sender === "user" ? "User" : "Bot"}: ${
        msg.text
      }\n`;
    });

    contentToSend += `User: ${userMessage}\n`;

    const newMessages = [...chatHistory, { sender: "user", text: userMessage }];
    console.log(newMessages);
    setChatHistory(newMessages);
    setUserMessage("");

    setIsLoading(true);

    try {
      let fileResponseText = "";

      if (selectedFile) {
        contentToSend += `\n\nFile Content: ${fileText}`;
        // setSelectedFile(null);
      }

      console.log("File: ", selectedFile);
      console.log("File text: ", fileText);

      console.log("Content to send: ", contentToSend);
      const result = await model.generateContent(contentToSend);
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
        {isCallingGigi ? (
          <div className="CallArea">
            <img src={GigiCall} />
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
                  className={
                    msg.sender === "user" ? "user-message" : "ai-message"
                  }
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
              <input
                id="fileInput"
                className="upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: "none" }} // Hides the default input
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
                onClick={sendMessage}
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
