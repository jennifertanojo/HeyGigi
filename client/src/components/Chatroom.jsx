import React, { useState } from "react";
import "./style/Chatroom.css";

import { GoogleGenerativeAI } from "@google/generative-ai";
import Window from "./Window";
import Send from "../images/Send.png";
import File from "../images/File.png";
import pdfToText from "react-pdftotext";
import ReactMarkdown from "react-markdown";
import axios from "axios";

function Chatroom({ onClose, topic }) {
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileText, setFileText] = useState("");
    const [text, setText] = useState("");
    const [audioSrc, setAudioSrc] = useState(null);
    const [calling, setCalling] = useState(false);
    const [isVoiceCall, setIsVoiceCall] = useState(false);


    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction:
            "Your name is Gigi. You should explain stuff like you're my best friend and we're gossiping.",
    });

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
        const response = await axios.post('http://localhost:8080/tts', {
            "text": text,
        });
        const audioSrc = `data:audio/mp3;base64,${response.data.audioContent}`;
        setAudioSrc(audioSrc);
    };

    const sendMessage = async () => {
        if (!userMessage.trim()) return;

        let contentToSend = "";

        chatHistory.forEach((msg) => {
            contentToSend += `${msg.sender === "user" ? "User" : "Bot"}: ${msg.text
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
                    options: ["Continue chatting", "Start a call"]
                }
            ]);
        } catch (error) {
            console.error("Error communicating with Gigi", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOptionClick = (option) => {
        if (option === "Start a call") {
            startVoiceCall();
        } else if (option === "Continue chatting") {
            continueChatting();
        }
    };

    const startVoiceCall = () => {
        setIsVoiceCall(true);
        setChatHistory([
            ...chatHistory,
            { sender: "bot", text: "Starting voice chat..." }
        ]);

        const speech = new SpeechSynthesisUtterance("Let's start the call!");
        speech.lang = "en-US";
        window.speechSynthesis.speak(speech);

        setChatHistory(prevMessages => [
            ...prevMessages,
            {
                sender: "bot",
                text: "The call has started, let's chat!",
                options: ["Starting a call"]
            }
        ]);
    };

    const continueChatting = () => {
        setIsVoiceCall(false);
        setChatHistory([
            ...chatHistory,
            { sender: "bot", text: "Okay, let's continue chatting!" }
        ]);
    };

    return (
        <div className="Chatroom">
            <Window onClose={onClose} HeaderTitle={topic.name}>
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
                                cursor: isLoading ? "Sending..." : "Send",
                                height: "30px",
                            }}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="voice-call-container">
                        <button onClick={handleSynthesize}>
                            Call
                        </button>
                        <button onClick={continueChatting}>
                            Continue Chatting
                        </button>
                    </div>
                    {audioSrc && <audio controls src={audioSrc} />}

                </div>
            </Window>
        </div>
    );
}

export default Chatroom;




