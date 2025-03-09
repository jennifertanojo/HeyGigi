import React from "react";
import "./style/Sidebar.css";
import TopicFolder from "./TopicFolder";

function Sidebar({ topics, openAddWindow }) {
    return (
        <div id="sidebar">
            {topics.map((topic) => (
                <TopicFolder key={topic.id} name={topic.name} />
            ))}
            <button onClick={openAddWindow}>Add New</button>
        </div>
    );
}

export default Sidebar;
