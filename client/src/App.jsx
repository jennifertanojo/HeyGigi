import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import AddCourseWindow from "./components/AddCourseWindow"; // Import Modal component
import Chatroom from "./components/Chatroom";
import TopicFolder from "./components/TopicFolder";

import './App.css';

function App() {
  const [isAddWindowOpen, setIsAddWindowOpen] = useState(false);
  const [topics, setTopics] = useState([]);  // Renamed setTopic to setTopics for consistency
  const [isChatroomOpen, setIsChatroomOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null); 

  const openAddWindow = () => setIsAddWindowOpen(true);
  const closeAddWindow = () => setIsAddWindowOpen(false);
  
  const openChatroom = (topic) => {
    setSelectedTopic(topic);
    setIsChatroomOpen(true);
  };

  const closeChatroomw = () => setIsChatroomOpen(false);

  const addCourse = (topicName) => {
    const newTopic = { id: Date.now(), name: topicName };
    setTopics([...topics, newTopic]); 
    closeAddWindow();
    openChatroom(newTopic);
  };

  return (
    <div className="App">
      <div id="sidebar">
        {topics.map((topic) => (
          <TopicFolder key={topic.id} name={topic.name} openChatroom={() => openChatroom(topic)} />
        ))}
        <button onClick={openAddWindow}>Add New</button>
      </div>
      {isAddWindowOpen && <AddCourseWindow onClose={closeAddWindow} onAddCourse={addCourse} />}
      {isChatroomOpen && <Chatroom onClose={closeChatroomw} topic={selectedTopic} />}
    </div>
  );
}

export default App;
