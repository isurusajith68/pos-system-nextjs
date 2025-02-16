"use client";

import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect, useRef } from "react";
import { useScrollStore } from "@/store/useScrollRef";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { setScrollRef } = useScrollStore();

  useEffect(() => {
    if (scrollRef.current) {
      setScrollRef(scrollRef);
    }
  }, [setScrollRef]);
  return (
    <div className="flex sm:h-screen flex-col h-dvh">
      <NavBar />
      <div className="flex flex-1">
        <Sidebar />
        <ScrollArea
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto rounded-tl-2xl bg-secondary"
          style={{ height: "calc(100dvh - 60px)" }}
        >
          {children}
        </ScrollArea>
      </div>
    </div>
  );
};

export default Layout;
