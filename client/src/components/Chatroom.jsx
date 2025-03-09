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
import NOKIA from "../images/NOKIa.mp3";
import axios from "axios";

function Chatroom({ onClose, topic }) {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileText, setFileText] = useState("");
  const [isCallingGigi, setIsCallingGigi] = useState(false);
  const [text, setText] = useState("");
  const [audioSrc, setAudioSrc] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isVoiceCall, setIsVoiceCall] = useState(false);

  const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction:
      "Your name is Gigi. You should explain stuff like you're my best friend and we're gossiping.",
  });
  const handleInterrupt = async () => {
    startListening();

    const response = await axios.post("http://localhost:8080/tts", {
      "": text,
    });
    // setChatHistory((prevMessages) => [
    //     ...prevMessages,
    //     {
    //         sender: "bot",
    //         text: "Starting a call...",
    //         options: []
    //     }
    // ]);
    setAudioSrc(null);
    const audioSrc = `data:audio/mp3;base64,${response.data.audioContent}`;
    setAudioSrc(audioSrc);
  };

  // Speech-to-Text Function
  const startListening = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
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
    console.log("IM HERE!!!");
    const file = e.target.files[0];
    setSelectedFile(file);
    pdfToText(file)
      .then((text) => {
        setFileText(text);
        console.log("fileText: ", fileText);
      })
      .catch((error) => console.error("Failed to extract text from pdf"));
  };

  const handleSynthesize = async () => {
    if (!text) {
      alert("Please enter text before calling.");
      return;
    }

    try {
      setIsLoading(true);
      setIsCallingGigi((prev) => !prev);
      await new Promise((resolve) => setTimeout(resolve, 0)); // Ensures re-render

      // Clean up the plain text (optional)
      const cleanedText = cleanText(text); // If further cleaning is required

      const response = await axios.post("http://localhost:8080/tts", { cleanedText });

      setChatHistory((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Starting a call...", options: [] },
      ]);

      const audioSrc = `data:audio/mp3;base64,${response.data.audioContent}`;
      setAudioSrc(audioSrc);
    } catch (error) {
      console.error("Error fetching TTS:", error);
      alert("Failed to start call. Try again.");
    } finally {
      setIsLoading(false);
      setIsCalling(false);
    }
  };

  // Helper function to clean up the text (if needed)
  const cleanText = (text) => {
    return text
        .replace(/(\*|_)+/g, "")
        .replace(/^cleanedText\s+/i, "")
        .replace(/\n/g, " ")      // Remove newlines
        .replace(/\s+/g, " ")     // Replace multiple spaces with a single space
        .replace(/[\p{Emoji}]/gu, "")
        .toLowerCase() 
        .trim();                 // Trim leading and trailing spaces
    };

  const handlePhone = () => {
    setIsCalling(true);
    handleSynthesize();
  };

  const callGigi = () => {
    setIsCallingGigi((prev) => !prev);
  };

  const sendMessage = async (message = userMessage) => {
    setIsLoading(true);

    if (!message.trim()) return;

    let contentToSend = chatHistory
      .map((msg) => `${msg.sender === "user" ? "User" : "Bot"}: ${msg.text}`)
      .join("\n");

    contentToSend += `\nUser: ${message}\n`;

    const newMessages = [...chatHistory, { sender: "user", text: message }];
    setChatHistory(newMessages);
    setUserMessage("");

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
      setText(response.text());

      setChatHistory([
        ...newMessages,
        { sender: "bot", text: response.text() },
      ]);

      setChatHistory((prevMessages) => [
        ...prevMessages,
        {
          sender: "bot",
          text: "Would you like to continue chatting or start a call?",
          options: ["Continue chatting", "Start a call"],
        },
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
          isCalling || !audioSrc ? ( // Show loading if fetching audio
            <div className="LoadingPage">
              <img src={GigiCall}></img>
              <div>Calling Gigi...</div>
              <audio autoPlay loop>
                <source src={NOKIA} type="audio/mp3" />
              </audio>
            </div>
          ) : (
            <div className="CallArea">
              <img src={GigiCall} alt="Calling Gigi" />
              <div className="CallButtons">
                <button style={{ fontSize: "18px" }} onClick={handleInterrupt}>
                  Interrupt
                </button>
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
                {audioSrc && <audio autoPlay controls src={audioSrc} />}
              </div>
            </div>
          )
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
                onClick={handlePhone}
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
