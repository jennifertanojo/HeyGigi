import { useState } from "react";
import AddCourseWindow from "./components/AddCourseWindow"; 
import Chatroom from "./components/Chatroom";
import TopicFolder from "./components/TopicFolder";
import Gigi from "./images/Gigi.png"; 
import buttons from "./images/buttons.png"; 
import Start from "./images/Start.png"; 


import './App.css';

function App() {
  const [isAddWindowOpen, setIsAddWindowOpen] = useState(false);
  const [topics, setTopics] = useState([]); 
  const [isChatroomOpen, setIsChatroomOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null); 

  const openAddWindow = () => {
    setIsChatroomOpen(false);
    setIsAddWindowOpen(true);
  };
  const closeAddWindow = () => setIsAddWindowOpen(false);
  
  const openChatroom = (topic) => {
    setSelectedTopic(topic);
    setIsChatroomOpen(true);
  };

  const closeChatroomw = () => setIsChatroomOpen(false);

  const addCourse = (topicName) => {
    setIsChatroomOpen(false);
    const newTopic = { id: Date.now(), name: topicName };
    setTopics([...topics, newTopic]); 
    closeAddWindow();
    openChatroom(newTopic);
  };

  return (
    <div className="App">
      <div id="AppHeader">
        <img id="gigiImg" src={Gigi} alt="Gigi"></img>
        <p id="heyGigi">Hey Gigi!</p>
        <img id="buttonsImg" src={buttons} alt="buttons"></img>
      </div>
      <div id="sidebar">
        {topics.map((topic) => (
          <TopicFolder key={topic.id} name={topic.name} openChatroom={() => openChatroom(topic)} />
        ))}
        <button onClick={openAddWindow}>Add New</button>
      </div>
      {isAddWindowOpen && <AddCourseWindow onClose={closeAddWindow} onAddCourse={addCourse} />}
      {isChatroomOpen && <Chatroom onClose={closeChatroomw} topic={selectedTopic} />}

      <div id="AppFooter">
        <img id="startImg" src={Start} alt="Start"></img>
        
      </div>
    </div>
  );
}

export default App;
