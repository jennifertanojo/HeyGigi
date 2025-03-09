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
        console.log("IM HERE!!!");
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
        let contentToSend = userMessage;
        console.log("User message: ", userMessage);

        const newMessages = [...chatHistory, { sender: "user", text: userMessage }];
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
                { sender: "bot", text: response.text() }
            ]);

        } catch (error) {
            console.error("Error communicating with Gigi", error);
        } finally {
            setIsLoading(false);
        }
    };

    // const readFileContent = async (file) => {
    //     const reader = new FileReader();
    //     reader.readAsArrayBuffer(file);

    //     return new Promise((resolve, reject) => {
    //         reader.onload = async (event) => {
    //             try {
    //                 const pdfDoc = await PDFDocument.load(event.target.result);
    //                 let extractedText = "";

    //                 for (const page of pdfDoc.getPages()) {
    //                     extractedText += page.getTextContent().items.map((item) => item.str).join(" ") + "\n\n";
    //                 }

    //                 resolve(extractedText);
    //             } catch (error) {
    //                 reject(error);
    //             }
    //         };

    //         reader.onerror = (error) => reject(error);
    //     });
    // };

    return (
        <div className="Chatroom">
            <h1>{topic.name}</h1>
            <button type="button" onClick={onClose}>X</button>
            {/* <button className="upload">Upload</button> */}
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
