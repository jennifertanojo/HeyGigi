import React, { useState } from "react";
import "./style/AddCourseWindow.css";
import Window from "./Window";

function AddCourseWindow({ onClose, onAddCourse }) {
  const [courseName, setCourseName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (courseName.trim() === "") {
      alert("Course name cannot be empty");
      return;
    }
    onAddCourse(courseName); // Pass course name to parent component
    onClose(); // Close modal after adding
  };

  return (
    <div className="AddCourseBg">
      <div className="AddCourseWindow">
        <Window onClose={onClose} HeaderTitle={"New Topic"}>
          <form className="Form" onSubmit={handleSubmit}>
            <label htmlFor="courseName">Title:</label>
            <input
              className="TopicTitleField"
              placeholder="Enter a topic title"
              type="text"
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
            />
            <button className="StartChatButton" type="submit">
              Start a chat
            </button>
          </form>
        </Window>
      </div>
    </div>
  );
}

export default AddCourseWindow;
