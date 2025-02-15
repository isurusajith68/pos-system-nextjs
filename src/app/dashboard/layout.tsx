import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POS System",
  description: "POS System",
};

const layout = async ({ children }: LayoutProps) => {
  return (
    <div className="flex sm:h-screen flex-col h-dvh">
      <NavBar />
      <div className="flex flex-1">
        <Sidebar />
        <ScrollArea
          className="flex-1 p-4 overflow-y-auto rounded-tl-2xl bg-secondary"
          style={{ height: "calc(100dvh - 60px)" }}
        >
          {children}
        </ScrollArea>
      </div>
    </div>
  );
};

export default layout;
