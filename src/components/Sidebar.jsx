import React from "react";

const Sidebar = () => {
  return (
    <div className="bg-red-400 w-20 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-center items-center h-16">Logo</div>
        <div className="flex justify-center items-center h-16">Menu</div>
        <div className="flex justify-center items-center h-16">Menu</div>
        <div className="flex justify-center items-center h-16">Menu</div>
        <div className="flex justify-center items-center h-16">Menu</div>
      </div>
      <div className="flex justify-center items-center h-16">Log Out</div>
    </div>
  );
};

export default Sidebar;
