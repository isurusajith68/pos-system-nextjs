import Sidebar from "../../components/Sidebar";
import React from "react";

const layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <div>
        <Sidebar />
      </div>
      {children}
    </div>
  );
};

export default layout;
