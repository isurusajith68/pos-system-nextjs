"use client";

import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { Suspense, useEffect, useRef } from "react";
import { useScrollStore } from "@/store/useScrollRef";
import { getUserFromCookie } from "@/services/auth";
import { redirect } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { setScrollRef } = useScrollStore();
  const { setUser, user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);
  useEffect(() => {
    if (scrollRef.current) {
      setScrollRef(scrollRef);
    }
  }, [setScrollRef]);

  useEffect(() => {
    const noSelectElements = document.querySelectorAll(".no-select");
    noSelectElements.forEach((element) => {
      element.addEventListener("selectstart", (e) => e.preventDefault());
      element.addEventListener("dragstart", (e) => e.preventDefault());
      element.addEventListener("contextmenu", (e) => e.preventDefault());
      element.addEventListener("copy", (e) => e.preventDefault());
      element.addEventListener("cut", (e) => e.preventDefault());
      element.addEventListener("paste", (e) => e.preventDefault());
      element.addEventListener("drop", (e) => e.preventDefault());
    });
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const user = await getUserFromCookie();
        if (!user) {
          setIsLoading(false);
          redirect("/");
        }
        setUser(user);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    if (!user) {
      loadUser();
    }
  }, []);
  return (
    <div className="flex sm:h-screen flex-col h-dvh no-select">
      {isLoading ? (
        <div className="flex items-center justify-center h-full w-full">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <NavBar user={user} />
          <div className="flex flex-1">
            <Sidebar />
            <Suspense fallback={<div>Loading...</div>}>
              <ScrollArea
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto rounded-tl-2xl bg-secondary"
                style={{ height: "calc(100dvh - 60px)" }}
              >
                {children}
              </ScrollArea>
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
