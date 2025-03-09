import React, { useState } from "react";
import "./style/Chatroom.css";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Keep the Google Generative AI import
// import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
// import workerSrc from "pdfjs-dist/build/pdf.worker.min.js";
// import pdfParse from "pdf-parse";
// import { PDFDocument } from "pdf-lib";
import pdfToText from 'react-pdftotext'


function Chatroom({ onClose, topic }) {
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileText, setFileText] = useState("")

    const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "Your name is Gigi. You should explain stuff like you're my best friend and we're gossiping."
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        setSelectedFile(file);
        pdfToText(file)
            .then(text => {
                setFileText(text);
                console.log("fileText: ", fileText);
            })
            .catch(error => console.error("Failed to extract text from pdf"))
    };

    const sendMessage = async () => {
        if (!userMessage.trim()) return;

        let contentToSend = "";

        chatHistory.forEach((msg) => {
            contentToSend += `${msg.sender === "user" ? "User" : "Bot"}: ${msg.text}\n`;
        });

        contentToSend += `User: ${userMessage}\n`;

        const newMessages = [...chatHistory, { sender: "user", text: userMessage }];
        console.log(newMessages);
        setChatHistory(newMessages);
        setUserMessage("");

        setIsLoading(true);

        try {
            if (selectedFile) {
                contentToSend += `\n\nFile Content: ${fileText}`;
            }

            const result = await model.generateContent(contentToSend);
            const response = await result.response;

            setChatHistory([
                ...newMessages,
                { sender: "bot", text: response.text() }
            ]);

        } catch (error) {
            console.error("Error communicating with Gigi", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="Chatroom">
            <h1>{topic.name}</h1>
            <button type="button" onClick={onClose}>X</button>
            <input className="upload" type="file" accept=".pdf" onChange={handleFileChange} />

            <div className="messages">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={msg.sender === "user" ? "user-message" : "ai-message"}>
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
        </div>
    );
}

export default Chatroom;