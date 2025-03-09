import React, { useState } from "react";
import "./style/AddCourseWindow.css";

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
            <h3>New Topic</h3>
            <button type="button" onClick={onClose}>X</button>

            <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="courseName">Title:</label>
                <input
                placeholder="Enter a topic title"
                type="text"
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
                />
            </div>
            <button type="submit">Start a chat</button>
            </form>
        </div>
    </div>

  );
}

export default AddCourseWindow;
