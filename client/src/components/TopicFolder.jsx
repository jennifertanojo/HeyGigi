import React from "react";
import folderImg from "../images/Folder.png"; 

import "./style/TopicFolder.css";

function Topicfolder({ name, openChatroom }) {
  return (
    <div>
      <img onClick={openChatroom} src={folderImg} alt="Folder"/>
      <h2>{name}</h2>
    </div>
  );
}

export default Topicfolder;
