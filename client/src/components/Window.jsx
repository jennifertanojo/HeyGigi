import React from "react";
import Folder from "../images/Folder.png";
import "./style/Window.css";

const Window = ({ onClose, HeaderTitle, children }) => {
  return (
    <div className="Window">
      <div className="WindowHeadline">
        <div className="CourseAndLogo">
          <img style={{ height: "30px" }} src={Folder} alt="Folder Icon" />
          <h3 style={{ color: "#FFFFFF", fontSize: "24px" }}>{HeaderTitle}</h3>
        </div>
        <button type="button" onClick={onClose}>
          X
        </button>
      </div>

      <div className="Content">{children}</div>
    </div>
  );
};

export default Window;
