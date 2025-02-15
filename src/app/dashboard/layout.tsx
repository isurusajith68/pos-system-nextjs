import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const layout = async ({ children }: LayoutProps) => {
  return (
    <div className="flex sm::h-screen flex-col h-svh">
      <NavBar  />
      <div className="flex flex-1">
        <Sidebar />
        <ScrollArea
          className="flex-1 p-4 overflow-y-auto rounded-tl-2xl bg-secondary"
          style={{ height: "calc(100vh - 60px)" }}
        >
          {children}
        </ScrollArea>
      </div>
    </div>
  );
};

export default layout;
