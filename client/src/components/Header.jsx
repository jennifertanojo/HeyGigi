import React from "react";
import Folder from "../images/Folder.png";

const Header = ({ onClose, HeaderTitle }) => {
  return (
    <div className="CourseWindowHeadline">
      <div className="CourseAndLogo">
        <img style={{ height: "30px" }} src={Folder} alt="Folder Icon" />
        <h3 style={{ color: "#FFFFFF", fontSize: "24px" }}>{HeaderTitle}</h3>
      </div>
      <button type="button" onClick={onClose}>
        X
      </button>
    </div>
  );
};

export default Header;
