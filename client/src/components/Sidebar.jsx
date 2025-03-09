import React, { useState, useEffect } from "react";
import "./style/Sidebar.css";
import Coursefolder from "./CourseFolder";

function Sidebar() {

    const [courses, setCourses] = useState([
        { id: 1, name: "Course 1" },
        { id: 2, name: "Course 2" },
        { id: 3, name: "Course 3" },
      ]);

      const addCourse = () => {
        const newCourse = {
          id: courses.length + 1, // Generate a new id based on the current length
          name: `Course ${courses.length + 1}`,
        };
    
        setCourses([...courses, newCourse]); // Add the new course to the existing array
      };
    
      // Step 2: Dynamically render the Coursefolder for each course in the courses array
      return (
        <div id="sidebar">
          {courses.map((course) => (
            <Coursefolder key={course.id} name={course.name} />
          ))}
          <button onClick={addCourse}>add</button>

        </div>
      );
    }

export default Sidebar;
